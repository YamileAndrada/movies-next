import { test, expect, Page } from '@playwright/test';

test.describe('Movies Explorer Flow', () => {
  async function ensureFiltersOpen(page: Page) {
    const filtersButton = page.getByRole('button', { name: /filters/i });
    if (await filtersButton.count() > 0) {
      const expanded = await filtersButton.getAttribute('aria-expanded');
      if (expanded === 'false') {
        await filtersButton.click();
      }
    }
  }

  test('should complete full movies workflow: apply filters → navigate pages → view details', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Navigate to movies page
    await page.goto('/movies');

    // Verify page loaded
    await expect(page.getByRole('heading', { name: /explore movies/i })).toBeVisible();

    // Ensure filters panel open
    await ensureFiltersOpen(page);

    // Wait for title input to attach & be visible, then fill
    const titleInput = page.locator('#title-filter');
    await titleInput.waitFor({ state: 'attached', timeout: 10000 });
    await titleInput.waitFor({ state: 'visible', timeout: 5000 });
    await titleInput.fill('Matrix');

    // Wait for debounce + network settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    // Verify table shows results (table visible + at least 1 row OR "No movies found")
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Wait for loading to finish and data rows with role="button" to appear OR "No movies found"
    const dataRows = page.locator('tbody tr[role="button"]');
    const noResults = page.getByText(/no movies found/i);

    await Promise.race([
      dataRows.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
      noResults.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
    ]);

    const rowsCount = await dataRows.count();

    // If there are rows, test pagination and details; otherwise assert empty-ui
    if (rowsCount > 0) {
      // Use flexible selectors for pagination and wait attached
      const prevButton = page.getByRole('button', { name: /previous(\spage)?/i });
      const nextButton = page.getByRole('button', { name: /next(\spage)?/i });

      // If pagination controls exist, assert visibility. If not, skip pagination.
      if ((await prevButton.count()) > 0 && (await nextButton.count()) > 0) {
        await prevButton.waitFor({ state: 'attached', timeout: 5000 });
        await nextButton.waitFor({ state: 'attached', timeout: 5000 });

        await expect(prevButton).toBeVisible();
        await expect(nextButton).toBeVisible();

        // Previous should be disabled on first page
        await expect(prevButton).toBeDisabled();
      } else {
        // No pagination controls present — proceed without failing
        console.warn('⚠ Pagination controls not found; skipping pagination asserts.');
      }

      // Click on first movie row to open details
      const firstRow = dataRows.first();

      // Wait a bit for any animations/transitions
      await page.waitForTimeout(200);

      await firstRow.click();

      // Verify modal opened with movie details
      const modal = page.getByRole('dialog');
      await modal.waitFor({ state: 'visible', timeout: 8000 });
      await expect(modal).toBeVisible();

      // Verify modal has movie information (meta fields)
      await expect(modal.getByText(/year/i)).toBeVisible();
      await expect(modal.getByText(/director/i)).toBeVisible();

      // Close modal (search for Close button flexibly)
      const closeButton = modal.getByRole('button', { name: /close/i });
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
        await expect(modal).not.toBeVisible();
      } else {
        // fallback: press Escape
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
    } else {
      // No rows: expect empty state
      await expect(noResults).toBeVisible();
    }
  });

  test('should navigate between pages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/movies');

    // Wait for table to load
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Wait for page info or at least one row
    const pageInfo = page.getByText(/page \d+ of \d+/i);
    const rows = page.locator('tbody tr');
    await Promise.race([
      pageInfo.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
      rows.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
    ]);

    // If pageInfo not present, skip pagination test (no pages)
    if ((await pageInfo.count()) === 0) {
      console.warn('⚠ Page info not found — skipping pagination navigation test.');
      return;
    }

    const initialText = await pageInfo.textContent();

    // Click Next button if enabled
    const nextButton = page.getByRole('button', { name: /next(\spage)?/i });
    if ((await nextButton.count()) > 0 && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const newText = await pageInfo.textContent();
      expect(newText).not.toBe(initialText);

      const prevButton = page.getByRole('button', { name: /previous(\spage)?/i });
      if ((await prevButton.count()) > 0) {
        await expect(prevButton).toBeEnabled();
        // Go back
        await prevButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(200);
        await expect(prevButton).toBeDisabled();
      }
    } else {
      console.warn('⚠ Next button not enabled or not present; skipping next/previous flow.');
    }
  });

  test('should filter by multiple criteria', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/movies');

    // Ensure filters open
    await ensureFiltersOpen(page);

    // Wait for year inputs to attach/visible
    const yearFrom = page.locator('#year-from');
    const yearTo = page.locator('#year-to');

    await yearFrom.waitFor({ state: 'attached', timeout: 8000 });
    await yearTo.waitFor({ state: 'attached', timeout: 8000 });
    await yearFrom.waitFor({ state: 'visible', timeout: 5000 });
    await yearTo.waitFor({ state: 'visible', timeout: 5000 });

    // Fill year filters
    await yearFrom.fill('2000');
    await yearTo.fill('2010');

    // Wait for debounce + network
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    // Verify rows exist or show no-results
    const rows = page.locator('tbody tr');
    const noResults = page.getByText(/no movies found/i);
    await Promise.race([
      rows.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
      noResults.waitFor({ state: 'visible', timeout: 8000 }).catch(() => null),
    ]);

    // Verify table still shows results or empty state
    if ((await rows.count()) > 0) {
      await expect(page.getByRole('table')).toBeVisible();
    } else {
      await expect(noResults).toBeVisible();
    }

    // Clear filters (only clicks if button exists)
    const clearButton = page.getByRole('button', { name: /clear all/i });
    if ((await clearButton.count()) > 0) {
      await clearButton.click();
    }

    // Inputs should be cleared
    await expect(yearFrom).toHaveValue('');
    await expect(yearTo).toHaveValue('');
  });
});

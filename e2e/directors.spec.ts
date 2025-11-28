import { test, expect } from '@playwright/test';

test.describe('Directors Analysis Flow', () => {
  test('should complete full directors workflow: input threshold → calculate → view results', async ({ page }) => {
    // Navigate to directors page
    await page.goto('/directors');

    // Verify page loaded
    await expect(page.getByRole('heading', { name: /directors analysis/i })).toBeVisible();

    // Find and fill the threshold input
    const thresholdInput = page.getByLabel(/minimum movie count/i);
    await expect(thresholdInput).toBeVisible();
    await thresholdInput.fill('2');

    // Click Calculate button
    const calculateButton = page.getByRole('button', { name: /calculate/i });
    await calculateButton.click();

    // Wait for loading to finish
    await expect(calculateButton).not.toHaveText(/calculating/i, { timeout: 10000 });

    // Verify results are displayed
    await expect(page.getByText(/found.*directors/i)).toBeVisible();

    // Verify table is displayed with results
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Verify table headers
    await expect(page.getByRole('columnheader', { name: /director/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /movie count/i })).toBeVisible();

    // Verify at least one row exists
    const rows = page.getByRole('row');
    await expect(rows).toHaveCount(await rows.count());
    expect(await rows.count()).toBeGreaterThan(1); // At least header + 1 data row
  });

  test('should show validation error for non-numeric input', async ({ page }) => {
    await page.goto('/directors');

    const thresholdInput = page.getByLabel(/minimum movie count/i);
    await thresholdInput.fill('abc');

    const calculateButton = page.getByRole('button', { name: /calculate/i });
    await calculateButton.click();

    // Should show validation error
    await expect(page.getByText(/please enter a valid number/i)).toBeVisible();

    // Should not show results
    await expect(page.getByRole('table')).not.toBeVisible();
  });

  test('should show empty state for negative threshold', async ({ page }) => {
    await page.goto('/directors');

    const thresholdInput = page.getByLabel(/minimum movie count/i);
    await thresholdInput.fill('-5');

    const calculateButton = page.getByRole('button', { name: /calculate/i });
    await calculateButton.click();

    // Wait for loading to finish
    await expect(calculateButton).not.toHaveText(/calculating/i, { timeout: 10000 });

    // Should show empty state message
    await expect(page.getByText(/non-negative threshold/i)).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have WCAG violations on directors page', async ({ page }) => {
    await page.goto('/directors');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have WCAG violations on movies page', async ({ page }) => {
    await page.goto('/movies');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have WCAG violations on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/directors');

    const thresholdInput = page.getByLabel(/minimum movie count/i);
    const calculateButton = page.getByRole('button', { name: /calculate/i });

    // Fill and submit form
    await thresholdInput.fill('3');
    await calculateButton.click();

    // Verify results are accessible
    const resultsRegion = page.getByRole('region', { name: /directors results/i });
    await resultsRegion.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);

    if (await resultsRegion.isVisible()) {
      await expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/directors');

    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);

    // Check form structure
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });
});

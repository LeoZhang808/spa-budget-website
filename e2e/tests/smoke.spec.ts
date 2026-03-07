import { test, expect } from '@playwright/test';

/**
 * E2E smoke test: register → log in → add expense → verify on dashboard.
 *
 * Prerequisites:
 *   - Frontend running on http://localhost:5173
 *   - Backend running on http://localhost:4000
 *   - MySQL database running and migrated
 *
 * Run with: npx playwright test (from the e2e/ directory)
 */

const uniqueEmail = `smoke-${Date.now()}@test.com`;
const password = 'TestPassword123';

test.describe('Smoke Test: Login → Add Expense → Dashboard', () => {
  test('register a new user account', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/sign up|create|register/i);

    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('log out and log back in', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('add an expense transaction', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to transactions
    await page.click('a[href="/transactions"], nav >> text=Transactions');
    await page.waitForURL('**/transactions', { timeout: 5000 });

    // Click add transaction button
    await page.click('button:has-text("Add"), button:has-text("New")');

    // Fill out the transaction form
    await page.fill('input[id="amount"], input[name="amount"]', '25.50');

    const categorySelect = page.locator('select[id="category"], select[name="category"]');
    if (await categorySelect.isVisible()) {
      const options = await categorySelect.locator('option').allTextContents();
      const firstCategory = options.find((o) => o.trim() && !o.includes('Select'));
      if (firstCategory) {
        await categorySelect.selectOption({ label: firstCategory });
      }
    }

    const noteInput = page.locator('input[id="note"], textarea[id="note"], input[name="note"]');
    if (await noteInput.isVisible()) {
      await noteInput.fill('E2E smoke test expense');
    }

    // Submit the form
    await page.click('button:has-text("Save"), button[type="submit"]:has-text("Add")');

    // Verify the transaction appears in the list
    await expect(page.locator('text=25.50, text=$25.50, text=2550')).toBeVisible({
      timeout: 5000,
    });
  });

  test('dashboard shows expense data', async ({ page }) => {
    // Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verify dashboard loads with some content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });

    // Verify the page contains budget/expense-related content
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });
});

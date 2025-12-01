import { Page, expect } from '@playwright/test';

/**
 * Common test utilities for E2E tests
 */

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

/**
 * Clear all inputs in a form
 */
export async function clearForm(page: Page) {
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.value = '';
      }
    });
  });
}

/**
 * Wait for toast notification and verify its message
 */
export async function waitForToast(page: Page, expectedMessage?: string) {
  const toast = page.locator('[role="status"], [role="alert"], .toast').first();
  await toast.waitFor({ state: 'visible', timeout: 5000 });

  if (expectedMessage) {
    await expect(toast).toContainText(expectedMessage);
  }

  return toast;
}

/**
 * Fill form field with validation
 */
export async function fillField(page: Page, label: string, value: string) {
  const field = page.getByLabel(label, { exact: false });
  await field.waitFor({ state: 'visible' });
  await field.fill(value);
  await expect(field).toHaveValue(value);
}

/**
 * Click button and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, buttonText: string) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.getByRole('button', { name: buttonText }).click(),
  ]);
}

/**
 * Check if element exists on page
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * Get error message from form
 */
export async function getFormError(page: Page): Promise<string | null> {
  const errorElement = page.locator('.text-destructive, [role="alert"]').first();

  try {
    await errorElement.waitFor({ state: 'visible', timeout: 3000 });
    return await errorElement.textContent();
  } catch {
    return null;
  }
}

/**
 * Select option from dropdown
 */
export async function selectOption(page: Page, label: string, option: string) {
  await page.getByLabel(label).click();
  await page.getByRole('option', { name: option }).click();
}

/**
 * Upload file to input
 */
export async function uploadFile(page: Page, selector: string, filePath: string) {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingToComplete(page: Page) {
  // Wait for any loading spinners to disappear
  const loadingSpinner = page.locator('[class*="animate-spin"], [class*="loading"]');

  try {
    await loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
  } catch {
    // No loading spinner found, continue
  }
}

/**
 * Verify page title
 */
export async function verifyPageTitle(page: Page, expectedTitle: string) {
  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
}

/**
 * Navigate to route with locale
 */
export async function navigateToRoute(page: Page, route: string, locale: string = 'en') {
  const url = `/${locale}${route}`;
  await page.goto(url);
  await waitForPageLoad(page);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return await elementExists(page, '[data-testid="user-menu"], [data-testid="dashboard"]');
}

/**
 * Generate random email
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Wait for specific time
 */
export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verify URL contains path
 */
export async function verifyUrlContains(page: Page, path: string) {
  await expect(page).toHaveURL(new RegExp(path));
}

/**
 * Click element by text
 */
export async function clickByText(page: Page, text: string) {
  await page.getByText(text, { exact: false }).first().click();
}

/**
 * Verify element is visible
 */
export async function verifyVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * Verify element contains text
 */
export async function verifyContainsText(page: Page, selector: string, text: string) {
  await expect(page.locator(selector)).toContainText(text);
}

import { Page, expect } from '@playwright/test';
import { testUsers } from './fixtures';
import { waitForPageLoad, fillField, waitForLoadingToComplete } from './test-helpers';

/**
 * Authentication helper functions for E2E tests
 */

/**
 * Login with credentials
 */
export async function login(
  page: Page,
  email: string = testUsers.validUser.email,
  password: string = testUsers.validUser.password,
  locale: string = 'en'
) {
  await page.goto(`/${locale}/auth/login`);
  await waitForPageLoad(page);

  // Fill in login form
  await fillField(page, 'Email', email);
  await fillField(page, 'Password', password);

  // Submit form
  const loginButton = page.getByRole('button', { name: /sign in|login/i });
  await loginButton.click();

  // Wait for navigation to dashboard
  await waitForLoadingToComplete(page);
  await page.waitForURL(new RegExp(`/${locale}/dashboard`), { timeout: 10000 });
  await waitForPageLoad(page);
}

/**
 * Register a new user
 */
export async function register(
  page: Page,
  email: string,
  password: string,
  name: string,
  locale: string = 'en'
) {
  await page.goto(`/${locale}/auth/register`);
  await waitForPageLoad(page);

  // Fill in registration form
  await fillField(page, 'Name', name);
  await fillField(page, 'Email', email);
  await fillField(page, 'Password', password);

  // Check if there's a confirm password field
  const confirmPasswordField = page.getByLabel('Confirm Password', { exact: false });
  const confirmExists = await confirmPasswordField.count();

  if (confirmExists > 0) {
    await fillField(page, 'Confirm Password', password);
  }

  // Submit form
  const registerButton = page.getByRole('button', { name: /sign up|register|create account/i });
  await registerButton.click();

  // Wait for navigation or success
  await waitForLoadingToComplete(page);
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Try different logout button locations
  const userMenuButton = page.locator('[data-testid="user-menu"], button:has-text("Profile"), button:has-text("Account")').first();

  try {
    await userMenuButton.waitFor({ state: 'visible', timeout: 3000 });
    await userMenuButton.click();

    // Click logout option
    const logoutButton = page.getByRole('menuitem', { name: /logout|sign out/i });
    await logoutButton.click();

    // Wait for redirect to login page
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
  } catch (error) {
    // Try alternative logout method
    await page.goto('/en/auth/login');
  }

  await waitForPageLoad(page);
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check if we're on a dashboard page
    const url = page.url();
    if (!url.includes('/dashboard')) {
      return false;
    }

    // Check for user menu or dashboard elements
    const userMenu = page.locator('[data-testid="user-menu"], [data-testid="dashboard"]');
    await userMenu.waitFor({ state: 'visible', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(page: Page, email: string, locale: string = 'en') {
  await page.goto(`/${locale}/auth/forgot-password`);
  await waitForPageLoad(page);

  await fillField(page, 'Email', email);

  const submitButton = page.getByRole('button', { name: /send|submit|reset/i });
  await submitButton.click();

  await waitForLoadingToComplete(page);
}

/**
 * Reset password with token
 */
export async function resetPassword(
  page: Page,
  token: string,
  newPassword: string,
  locale: string = 'en'
) {
  await page.goto(`/${locale}/auth/reset-password?token=${token}`);
  await waitForPageLoad(page);

  await fillField(page, 'New Password', newPassword);
  await fillField(page, 'Confirm Password', newPassword);

  const submitButton = page.getByRole('button', { name: /reset|submit/i });
  await submitButton.click();

  await waitForLoadingToComplete(page);
}

/**
 * Verify user is authenticated and on dashboard
 */
export async function verifyAuthenticated(page: Page, locale: string = 'en') {
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard`));
  const loggedIn = await isLoggedIn(page);
  expect(loggedIn).toBeTruthy();
}

/**
 * Verify user is not authenticated
 */
export async function verifyNotAuthenticated(page: Page) {
  const loggedIn = await isLoggedIn(page);
  expect(loggedIn).toBeFalsy();
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page, locale: string = 'en') {
  await login(page, testUsers.adminUser.email, testUsers.adminUser.password, locale);
}

/**
 * Login as lawyer
 */
export async function loginAsLawyer(page: Page, locale: string = 'en') {
  await login(page, testUsers.lawyer.email, testUsers.lawyer.password, locale);
}

/**
 * Setup authenticated state in storage
 */
export async function setupAuthState(page: Page, locale: string = 'en') {
  await login(page, testUsers.validUser.email, testUsers.validUser.password, locale);

  // Save storage state
  await page.context().storageState({ path: '.auth/user.json' });
}

/**
 * Clear auth state
 */
export async function clearAuthState(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Get auth token from storage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  });
}

/**
 * Set auth token in storage
 */
export async function setAuthToken(page: Page, token: string) {
  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token);
  }, token);
}

/**
 * Verify login error message
 */
export async function verifyLoginError(page: Page, expectedError?: string) {
  const errorMessage = page.locator('.text-destructive, [role="alert"]').first();
  await expect(errorMessage).toBeVisible();

  if (expectedError) {
    await expect(errorMessage).toContainText(expectedError);
  }
}

/**
 * Wait for auth redirect
 */
export async function waitForAuthRedirect(page: Page, expectedPath: string) {
  await page.waitForURL(new RegExp(expectedPath), { timeout: 10000 });
  await waitForPageLoad(page);
}

/**
 * Toggle password visibility
 */
export async function togglePasswordVisibility(page: Page) {
  const toggleButton = page.locator('button[type="button"]:has-text("Show"), button:has([class*="eye"])').first();
  await toggleButton.click();
}

/**
 * Verify password is visible
 */
export async function verifyPasswordVisible(page: Page) {
  const passwordInput = page.locator('input[type="text"][id*="password"]');
  await expect(passwordInput).toBeVisible();
}

/**
 * Verify password is hidden
 */
export async function verifyPasswordHidden(page: Page) {
  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible();
}

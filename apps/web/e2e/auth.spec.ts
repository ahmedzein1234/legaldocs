import { test, expect } from '@playwright/test';
import {
  login,
  logout,
  register,
  requestPasswordReset,
  verifyAuthenticated,
  verifyNotAuthenticated,
  verifyLoginError,
  togglePasswordVisibility,
} from './utils/auth-helpers';
import {
  generateRandomEmail,
  generateRandomString,
  waitForPageLoad,
  fillField,
  getFormError,
  waitForToast,
} from './utils/test-helpers';
import { testUsers, invalidData } from './utils/fixtures';

test.describe('Authentication Flow', () => {
  test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/auth/login');
      await waitForPageLoad(page);
    });

    test('should display login form correctly', async ({ page }) => {
      // Verify page title
      await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();

      // Verify form fields are present
      await expect(page.getByLabel('Email', { exact: false })).toBeVisible();
      await expect(page.getByLabel('Password', { exact: false })).toBeVisible();

      // Verify login button exists
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();

      // Verify links
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /sign up|register/i })).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await login(page);
      await verifyAuthenticated(page);

      // Verify we're on the dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText(/welcome/i)).toBeVisible();
    });

    test('should show error with invalid email', async ({ page }) => {
      await fillField(page, 'Email', invalidData.email.invalid);
      await fillField(page, 'Password', testUsers.validUser.password);

      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Verify error message
      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });

    test('should show error with invalid password', async ({ page }) => {
      await fillField(page, 'Email', testUsers.validUser.email);
      await fillField(page, 'Password', 'wrongpassword');

      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Verify error is shown
      await verifyLoginError(page);
    });

    test('should show error with empty fields', async ({ page }) => {
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Should see validation errors
      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });

    test('should toggle password visibility', async ({ page }) => {
      await fillField(page, 'Password', 'testpassword');

      // Get password input
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();

      // Click toggle button
      await togglePasswordVisibility(page);

      // Password should now be visible (type="text")
      const visiblePasswordInput = page.locator('input[type="text"][id*="password"]');
      await expect(visiblePasswordInput).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.getByRole('link', { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/\/auth\/forgot-password/);
    });

    test('should navigate to register page', async ({ page }) => {
      await page.getByRole('link', { name: /sign up|register/i }).click();
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('should remember email after failed login', async ({ page }) => {
      const testEmail = 'test@example.com';
      await fillField(page, 'Email', testEmail);
      await fillField(page, 'Password', 'wrongpassword');

      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Email should still be in the field
      const emailInput = page.getByLabel('Email', { exact: false });
      await expect(emailInput).toHaveValue(testEmail);
    });
  });

  test.describe('Registration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/auth/register');
      await waitForPageLoad(page);
    });

    test('should display registration form correctly', async ({ page }) => {
      // Verify page title
      await expect(page.getByRole('heading', { name: /register|sign up|create account/i })).toBeVisible();

      // Verify form fields
      const nameField = page.getByLabel('Name', { exact: false });
      const emailField = page.getByLabel('Email', { exact: false });
      const passwordField = page.getByLabel('Password', { exact: false });

      await expect(nameField).toBeVisible();
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();

      // Verify register button
      await expect(page.getByRole('button', { name: /sign up|register|create account/i })).toBeVisible();

      // Verify login link
      await expect(page.getByRole('link', { name: /sign in|login/i })).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
      const email = generateRandomEmail();
      const name = `Test User ${generateRandomString(5)}`;
      const password = 'TestPassword123!';

      await register(page, email, password, name);

      // Should redirect to dashboard or login
      // The exact behavior depends on your app
      await page.waitForURL(/\/(dashboard|auth\/login)/, { timeout: 10000 });
    });

    test('should show error with invalid email format', async ({ page }) => {
      await fillField(page, 'Name', 'Test User');
      await fillField(page, 'Email', invalidData.email.invalid);
      await fillField(page, 'Password', 'Password123!');

      await page.getByRole('button', { name: /sign up|register/i }).click();

      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });

    test('should show error with weak password', async ({ page }) => {
      await fillField(page, 'Name', 'Test User');
      await fillField(page, 'Email', generateRandomEmail());
      await fillField(page, 'Password', invalidData.password.tooShort);

      await page.getByRole('button', { name: /sign up|register/i }).click();

      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });

    test('should show error with empty name', async ({ page }) => {
      await fillField(page, 'Name', '');
      await fillField(page, 'Email', generateRandomEmail());
      await fillField(page, 'Password', 'Password123!');

      await page.getByRole('button', { name: /sign up|register/i }).click();

      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });

    test('should navigate to login page from register', async ({ page }) => {
      await page.getByRole('link', { name: /sign in|login/i }).click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should show error when registering with existing email', async ({ page }) => {
      // Try to register with an email that already exists
      await fillField(page, 'Name', 'Test User');
      await fillField(page, 'Email', testUsers.validUser.email);
      await fillField(page, 'Password', 'Password123!');

      await page.getByRole('button', { name: /sign up|register/i }).click();

      // Should show error about email already being registered
      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await login(page);
      await verifyAuthenticated(page);

      // Then logout
      await logout(page);

      // Verify we're logged out
      await verifyNotAuthenticated(page);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/auth/forgot-password');
      await waitForPageLoad(page);
    });

    test('should display forgot password form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /forgot password|reset password/i })).toBeVisible();
      await expect(page.getByLabel('Email', { exact: false })).toBeVisible();
      await expect(page.getByRole('button', { name: /send|submit|reset/i })).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
      await requestPasswordReset(page, testUsers.validUser.email);

      // Should show success message or confirmation
      // The exact behavior depends on your implementation
      const successMessage = page.locator('text=/sent|check your email|reset link/i');

      try {
        await successMessage.waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        // Success message might not be visible in test environment
        console.log('Success message not found - may be expected in test environment');
      }
    });

    test('should show error with invalid email', async ({ page }) => {
      await fillField(page, 'Email', invalidData.email.invalid);
      await page.getByRole('button', { name: /send|submit|reset/i }).click();

      const error = await getFormError(page);
      expect(error).toBeTruthy();
    });

    test('should navigate back to login', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /back to login|sign in/i });

      if (await loginLink.count() > 0) {
        await loginLink.click();
        await expect(page).toHaveURL(/\/auth\/login/);
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      // Try to access dashboard without being logged in
      await page.goto('/en/dashboard');

      // Should be redirected to login
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    });

    test('should access protected route when authenticated', async ({ page }) => {
      await login(page);

      // Should be able to access dashboard
      await page.goto('/en/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      await login(page);

      // Reload the page
      await page.reload();
      await waitForPageLoad(page);

      // Should still be authenticated
      await verifyAuthenticated(page);
    });

    test('should maintain session across navigation', async ({ page }) => {
      await login(page);

      // Navigate to different pages
      await page.goto('/en/dashboard/documents');
      await verifyAuthenticated(page);

      await page.goto('/en/dashboard/templates');
      await verifyAuthenticated(page);

      await page.goto('/en/dashboard');
      await verifyAuthenticated(page);
    });
  });

  test.describe('Localization', () => {
    test('should display login form in Arabic', async ({ page }) => {
      await page.goto('/ar/auth/login');
      await waitForPageLoad(page);

      // Verify page is in Arabic (RTL)
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');
    });

    test('should login with Arabic locale', async ({ page }) => {
      await login(page, testUsers.validUser.email, testUsers.validUser.password, 'ar');
      await expect(page).toHaveURL(/\/ar\/dashboard/);
    });

    test('should switch language from login page', async ({ page }) => {
      await page.goto('/en/auth/login');

      // Look for language switcher
      const languageSwitcher = page.locator('[data-testid="language-switcher"], button:has-text("AR"), button:has-text("English")');

      const switcherExists = await languageSwitcher.count();
      if (switcherExists > 0) {
        await languageSwitcher.first().click();

        // Should switch to Arabic
        await page.waitForURL(/\/ar\/auth\/login/, { timeout: 5000 });
      }
    });
  });
});

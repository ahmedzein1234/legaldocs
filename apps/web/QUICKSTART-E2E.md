# Quick Start Guide: E2E Testing

Get started with E2E testing for LegalDocs in 5 minutes.

## Step 1: Install Dependencies

```bash
cd apps/web
npm install
```

## Step 2: Install Playwright Browsers

```bash
npx playwright install
```

This will download the latest versions of Chromium, Firefox, and WebKit browsers.

## Step 3: Configure Test Environment (Optional)

Create a `.env.test` file:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your test configuration:

```env
BASE_URL=http://localhost:3000
API_URL=http://localhost:4001
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Password123!
```

## Step 4: Start Your Application

In one terminal, start the Next.js app:

```bash
npm run dev
```

The app should be running at `http://localhost:3000` (or port 3001 as configured).

## Step 5: Run Your First Test

In another terminal, run the tests:

```bash
# Run all tests
npm run test:e2e

# Or run with interactive UI (recommended for first time)
npm run test:e2e:ui
```

## What You Should See

### Headless Mode (Default)

```
Running 150 tests using 4 workers

  ✓  auth.spec.ts:10:5 › should login successfully (2s)
  ✓  auth.spec.ts:20:5 › should register new user (3s)
  ✓  dashboard.spec.ts:15:5 › should display dashboard (1s)
  ...

  150 passed (45s)
```

### UI Mode

A browser window will open showing:
- Test files on the left
- Test execution in the middle
- Test results and traces on the right

You can:
- Click on any test to run it
- Watch tests execute in real-time
- Debug failed tests
- View screenshots and videos

## Common Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI (interactive, great for debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run on specific browser
npx playwright test --project=chromium

# Debug mode (step through tests)
npm run test:e2e:debug

# Show HTML report
npm run test:e2e:report
```

## Test Files Overview

```
apps/web/e2e/
├── auth.spec.ts          # Login, register, logout tests
├── dashboard.spec.ts     # Dashboard functionality tests
├── documents.spec.ts     # Document CRUD tests
├── templates.spec.ts     # Template browsing tests
├── generate.spec.ts      # AI document generation tests
├── signatures.spec.ts    # Signature workflow tests
├── utils/
│   ├── test-helpers.ts   # Common utilities
│   ├── auth-helpers.ts   # Auth helpers
│   └── fixtures.ts       # Test data
├── global-setup.ts       # Global test setup
└── auth.setup.ts         # Auth state setup
```

## Understanding Test Results

### Test Passed
```
✓ auth.spec.ts:10:5 › should login successfully (2s)
```
- ✓ = Test passed
- 2s = Time taken

### Test Failed
```
✗ auth.spec.ts:20:5 › should register new user (3s)
  Error: Timeout 5000ms exceeded
  Screenshot: test-results/auth-register/test-failed.png
```

When a test fails:
1. Check the error message
2. View the screenshot in `test-results/`
3. Watch the video if available
4. Run in UI mode for debugging

### Viewing Detailed Reports

```bash
npm run test:e2e:report
```

Opens an HTML report showing:
- All test results
- Screenshots and videos
- Execution timeline
- Detailed error traces

## Debugging Failed Tests

### Method 1: UI Mode (Easiest)

```bash
npm run test:e2e:ui
```

1. Click on the failed test
2. Click "Show Browser"
3. Step through the test
4. See exactly where it fails

### Method 2: Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector:
- Step through each action
- Inspect the page
- Try selectors
- View console logs

### Method 3: Headed Mode

```bash
npm run test:e2e:headed
```

Runs tests with visible browser:
- Watch tests execute
- See what the user sees
- Identify UI issues

## Writing Your First Test

Create a new test file `apps/web/e2e/my-feature.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should do something', async ({ page }) => {
    // Navigate to your feature
    await page.goto('/en/dashboard/my-feature');

    // Interact with elements
    await page.click('button:has-text("Click Me")');

    // Assert results
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.result')).toHaveText('Success!');
  });
});
```

Run your test:

```bash
npx playwright test my-feature.spec.ts
```

## Test Best Practices

### 1. Use Helper Functions

```typescript
// Good
import { login, fillField } from './utils/auth-helpers';

await login(page);
await fillField(page, 'Email', 'test@example.com');

// Avoid
await page.goto('/auth/login');
await page.fill('input[type="email"]', 'test@example.com');
// ... repeated code
```

### 2. Use Proper Selectors

```typescript
// Best: Use data-testid
await page.locator('[data-testid="submit-button"]').click();

// Good: Use role
await page.getByRole('button', { name: 'Submit' }).click();

// Okay: Use text
await page.locator('button:has-text("Submit")').click();

// Avoid: Use CSS classes (brittle)
await page.locator('.btn-primary').click();
```

### 3. Wait Properly

```typescript
// Good
await expect(page.locator('.content')).toBeVisible();
await page.waitForLoadState('networkidle');

// Avoid
await page.waitForTimeout(5000); // Only use when absolutely necessary
```

## Troubleshooting

### "Cannot find browser"

```bash
npx playwright install
```

### "Port 3000 already in use"

Stop any running instances of the app, or change BASE_URL in config.

### Tests are slow

```bash
# Run in parallel
npx playwright test --workers=4

# Run specific browser only
npx playwright test --project=chromium
```

### Tests are flaky

1. Add proper waits
2. Use `waitForLoadState('networkidle')`
3. Avoid `waitForTimeout()`
4. Use explicit assertions

### Can't find element

1. Check selector in UI mode
2. Wait for element to appear
3. Verify element is visible
4. Check if element is in shadow DOM

## Next Steps

1. Read the full [E2E Testing Guide](./e2e/README.md)
2. Check [Testing Documentation](./TESTING.md)
3. Explore existing test files for examples
4. Write tests for your features

## Getting Help

- Check [Playwright Documentation](https://playwright.dev)
- Review test examples in `e2e/` directory
- Use UI mode for visual debugging
- Ask the team

## Quick Reference

### Most Used Commands

```bash
npm run test:e2e          # Run all tests
npm run test:e2e:ui       # Interactive UI mode
npx playwright test auth  # Run auth tests only
npm run test:e2e:report   # View HTML report
```

### Useful Playwright Commands

```bash
# Generate test code
npx playwright codegen http://localhost:3000

# Show test report
npx playwright show-report

# Show trace file
npx playwright show-trace trace.zip

# List all tests
npx playwright test --list

# Run tests in VS Code
# Install "Playwright Test for VSCode" extension
```

## Tips for Success

1. Start the app before running tests
2. Use UI mode for debugging
3. Write tests for happy paths first
4. Add error cases gradually
5. Keep tests independent
6. Clean up test data
7. Use descriptive test names

Happy Testing!

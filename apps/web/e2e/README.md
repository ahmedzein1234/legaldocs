# E2E Tests for LegalDocs Application

This directory contains comprehensive end-to-end tests for the LegalDocs application using Playwright.

## Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- LegalDocs application running locally

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests matching a pattern
```bash
npx playwright test --grep "login"
npx playwright test --grep-invert "slow"
```

## Test Structure

### Test Files

- **auth.spec.ts** - Authentication flows (login, register, logout, password reset)
- **dashboard.spec.ts** - Dashboard functionality and navigation
- **documents.spec.ts** - Document management (create, view, edit, delete)
- **templates.spec.ts** - Template browsing and usage
- **generate.spec.ts** - AI document generation flow
- **signatures.spec.ts** - Signature requests and signing process

### Utility Files

- **utils/test-helpers.ts** - Common test utility functions
- **utils/auth-helpers.ts** - Authentication-specific helpers
- **utils/fixtures.ts** - Test data and fixtures

### Setup Files

- **global-setup.ts** - Global test environment setup
- **auth.setup.ts** - Authentication state setup for tests

## Configuration

The test configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel**: Tests run in parallel (configurable)

## Environment Variables

Create a `.env.test` file in the project root for test-specific configuration:

```bash
BASE_URL=http://localhost:3000
API_URL=http://localhost:4001
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Password123!
```

## Test Data

Test data is defined in `utils/fixtures.ts`:

- User accounts (test users, admin, lawyer)
- Document templates
- Sample documents
- API endpoints
- Mock responses

## Authentication

Tests use persistent authentication to speed up execution:

1. The `auth.setup.ts` file logs in once before tests
2. Authentication state is saved to `.auth/user.json`
3. Tests reuse this authenticated state

To run tests without authentication (e.g., testing login page):
```bash
npx playwright test auth.spec.ts
```

## Debugging Tests

### Visual debugging with UI mode
```bash
npm run test:e2e:ui
```

### Step through tests
```bash
npm run test:e2e:debug
```

### Generate and view test report
```bash
npm run test:e2e:report
```

### Screenshots and videos

- Screenshots are captured on test failure
- Videos are recorded for failed tests
- Both are saved in `test-results/`

### Trace viewer

Traces are collected on first retry. To view:
```bash
npx playwright show-trace trace.zip
```

## Best Practices

### 1. Use data-testid attributes
```html
<button data-testid="submit-button">Submit</button>
```

```typescript
await page.locator('[data-testid="submit-button"]').click();
```

### 2. Wait for elements properly
```typescript
// Good
await page.waitForSelector('[data-testid="content"]');
await expect(page.locator('[data-testid="content"]')).toBeVisible();

// Avoid
await page.waitForTimeout(5000); // Only use when absolutely necessary
```

### 3. Use helper functions
```typescript
// Good
await login(page);
await fillField(page, 'Email', 'test@example.com');

// Avoid repeating code
await page.goto('/auth/login');
await page.fill('input[type="email"]', 'test@example.com');
// ... more repeated code
```

### 4. Test user flows, not implementation
```typescript
// Good - tests user behavior
test('user can create and sign document', async ({ page }) => {
  await createDocument(page, 'Rental Agreement');
  await requestSignature(page, 'signer@example.com');
  await expect(page).toHaveURL(/signatures/);
});

// Avoid - tests implementation details
test('API returns 200', async ({ page }) => {
  const response = await page.request.get('/api/documents');
  expect(response.status()).toBe(200);
});
```

### 5. Clean up test data
```typescript
test.afterEach(async ({ page }) => {
  // Clean up any test data created during the test
  await cleanupTestDocuments(page);
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests fail locally but pass in CI
- Check Node.js version matches
- Ensure all dependencies are installed
- Clear `node_modules` and reinstall

### Tests are slow
- Run in parallel: `npx playwright test --workers=4`
- Use authentication state to avoid repeated logins
- Reduce timeouts for fast-failing tests

### Element not found errors
- Add proper waits: `await page.waitForSelector()`
- Check if element is in viewport: `await element.scrollIntoViewIfNeeded()`
- Use more specific selectors

### Flaky tests
- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')`
- Avoid `waitForTimeout()` - use proper assertions instead

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selector Guide](https://playwright.dev/docs/selectors)

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add appropriate comments
4. Use helper functions from `utils/`
5. Update this README if adding new test categories

## License

Same as the main LegalDocs application.

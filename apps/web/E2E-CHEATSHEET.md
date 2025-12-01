# E2E Testing Cheat Sheet

Quick reference for Playwright E2E testing in LegalDocs.

## Installation

```bash
npm install                    # Install dependencies
npx playwright install         # Install browsers
```

## Run Tests

```bash
npm run test:e2e              # Run all tests (headless)
npm run test:e2e:ui           # Interactive UI mode ⭐
npm run test:e2e:headed       # See browser
npm run test:e2e:debug        # Debug mode
npm run test:e2e:report       # View HTML report
```

## Playwright CLI

```bash
# Run specific file
npx playwright test auth.spec.ts

# Run by pattern
npx playwright test --grep "login"

# Run on specific browser
npx playwright test --project=chromium

# Run single test
npx playwright test auth.spec.ts:10

# List all tests
npx playwright test --list

# Show report
npx playwright show-report

# Show trace
npx playwright show-trace trace.zip

# Generate code
npx playwright codegen http://localhost:3000
```

## Common Test Patterns

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('test name', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/LegalDocs/);
});
```

### With Authentication

```typescript
import { login } from './utils/auth-helpers';

test('authenticated test', async ({ page }) => {
  await login(page);
  await page.goto('/dashboard');
  // ... test code
});
```

### Test Suite

```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('test 1', async ({ page }) => {
    // ...
  });

  test('test 2', async ({ page }) => {
    // ...
  });
});
```

## Selectors

```typescript
// By data-testid (recommended)
page.locator('[data-testid="submit"]')

// By role
page.getByRole('button', { name: 'Submit' })

// By text
page.getByText('Welcome')

// By label
page.getByLabel('Email')

// By placeholder
page.getByPlaceholder('Enter email')

// CSS selector
page.locator('.btn-primary')

// XPath (avoid if possible)
page.locator('xpath=//button')
```

## Actions

```typescript
// Navigate
await page.goto('/dashboard')

// Click
await page.click('button')
await page.getByRole('button', { name: 'Submit' }).click()

// Fill input
await page.fill('input[name="email"]', 'test@example.com')

// Type (slower, simulates keypress)
await page.type('input', 'text')

// Check/uncheck
await page.check('input[type="checkbox"]')
await page.uncheck('input[type="checkbox"]')

// Select option
await page.selectOption('select', 'value')
await page.selectOption('select', { label: 'Option 1' })

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf')

// Hover
await page.hover('button')

// Focus
await page.focus('input')

// Press key
await page.press('input', 'Enter')
await page.keyboard.press('Control+A')
```

## Assertions

```typescript
// Visibility
await expect(page.locator('.content')).toBeVisible()
await expect(page.locator('.loading')).not.toBeVisible()
await expect(page.locator('.content')).toBeHidden()

// Text
await expect(page.locator('.title')).toHaveText('Welcome')
await expect(page.locator('.title')).toContainText('Wel')

// Count
await expect(page.locator('.item')).toHaveCount(5)

// Value
await expect(page.locator('input')).toHaveValue('test')

// Attribute
await expect(page.locator('a')).toHaveAttribute('href', '/dashboard')

// Class
await expect(page.locator('div')).toHaveClass('active')

// URL
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveURL('http://localhost:3000/dashboard')

// Title
await expect(page).toHaveTitle('LegalDocs')
```

## Waits

```typescript
// Wait for element
await page.waitForSelector('.content')
await page.waitForSelector('.content', { state: 'visible' })

// Wait for navigation
await page.waitForNavigation()

// Wait for load state
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')

// Wait for response
await page.waitForResponse(response =>
  response.url().includes('/api/documents')
)

// Wait for timeout (avoid!)
await page.waitForTimeout(1000)
```

## Helper Functions

### From test-helpers.ts

```typescript
import {
  waitForPageLoad,
  fillField,
  waitForToast,
  clickByText,
  verifyVisible,
  generateRandomEmail,
  waitForLoadingToComplete,
} from './utils/test-helpers';

await waitForPageLoad(page)
await fillField(page, 'Email', 'test@example.com')
await waitForToast(page, 'Success message')
await clickByText(page, 'Click Me')
await verifyVisible(page, '.content')
const email = generateRandomEmail()
await waitForLoadingToComplete(page)
```

### From auth-helpers.ts

```typescript
import {
  login,
  logout,
  register,
  verifyAuthenticated,
  isLoggedIn,
} from './utils/auth-helpers';

await login(page)
await logout(page)
await register(page, email, password, name)
await verifyAuthenticated(page)
const loggedIn = await isLoggedIn(page)
```

## Debugging

```typescript
// Pause test
await page.pause()

// Screenshot
await page.screenshot({ path: 'screenshot.png' })

// Console log
console.log(await page.textContent('.title'))

// Evaluate JS
const result = await page.evaluate(() => {
  return document.title
})

// Expose function
await page.exposeFunction('log', console.log)

// Set breakpoint in test
debugger; // Run with --debug flag
```

## Test Configuration

```typescript
// Set timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});

// Skip test
test.skip('not ready', async ({ page }) => {
  // ...
});

// Only run this test
test.only('debug this', async ({ page }) => {
  // ...
});

// Run conditionally
test('conditional', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Not supported in Safari');
  // ...
});
```

## Page Object Pattern

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// Usage
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('test@example.com', 'password');
```

## Mobile Testing

```typescript
test('mobile view', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // ... test mobile view
});

// Or use device presets
import { devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test('iPhone test', async ({ page }) => {
  // ...
});
```

## API Testing

```typescript
test('API test', async ({ request }) => {
  const response = await request.post('/api/documents', {
    data: { title: 'Test Doc' }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.title).toBe('Test Doc');
});
```

## Network Mocking

```typescript
// Mock API response
await page.route('/api/documents', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ documents: [] })
  });
});

// Block images
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());
```

## Multiple Pages/Tabs

```typescript
test('new tab', async ({ context, page }) => {
  // Click opens new tab
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.click('a[target="_blank"]')
  ]);

  await newPage.waitForLoadState();
  expect(newPage.url()).toContain('/new-page');
  await newPage.close();
});
```

## Fixtures (Test Data)

```typescript
import {
  testUsers,
  testDocuments,
  testTemplates,
  pageUrls,
} from './utils/fixtures';

// Use in tests
await login(page, testUsers.validUser.email, testUsers.validUser.password);
await page.goto(pageUrls.dashboard);
```

## Environment Variables

```typescript
// In test
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
await page.goto(baseUrl);

// In playwright.config.ts
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
}

// In test
await page.goto('/dashboard'); // Uses baseURL
```

## Common Issues & Solutions

### Timeout
```typescript
// Increase timeout
await page.waitForSelector('.slow-element', { timeout: 10000 });
```

### Element not visible
```typescript
// Scroll into view
await element.scrollIntoViewIfNeeded();
```

### Flaky tests
```typescript
// Use explicit waits
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

### Wrong selector
```typescript
// Use UI mode to find selector
npm run test:e2e:ui
```

## VS Code Extension

Install: "Playwright Test for VSCode"

Features:
- Run tests from editor
- Debug tests
- Pick selectors
- View trace viewer

## Quick Tips

1. Use UI mode for debugging (`npm run test:e2e:ui`)
2. Use `data-testid` for stable selectors
3. Avoid `waitForTimeout()` - use explicit waits
4. Run tests in parallel for speed
5. Keep tests independent
6. Use helper functions
7. Clean up test data
8. Add comments for complex logic
9. Use descriptive test names
10. Check screenshots/videos on failure

## File Structure

```
e2e/
├── *.spec.ts           # Test files
├── utils/
│   ├── test-helpers.ts # Utilities
│   ├── auth-helpers.ts # Auth helpers
│   └── fixtures.ts     # Test data
├── global-setup.ts     # Global setup
└── auth.setup.ts       # Auth setup
```

## Resources

- Playwright Docs: https://playwright.dev
- API Reference: https://playwright.dev/docs/api/class-playwright
- Best Practices: https://playwright.dev/docs/best-practices
- Selectors Guide: https://playwright.dev/docs/selectors

---

Keep this cheat sheet handy for quick reference!

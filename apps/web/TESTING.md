# Testing Guide for LegalDocs

This document provides a comprehensive guide to testing the LegalDocs application.

## Table of Contents

- [Overview](#overview)
- [E2E Tests](#e2e-tests)
- [Test Coverage](#test-coverage)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

## Overview

LegalDocs uses Playwright for end-to-end testing to ensure the application works correctly from a user's perspective. The tests cover all major user flows and features.

## E2E Tests

### Test Suites

#### 1. Authentication Tests (`auth.spec.ts`)
- User login with valid/invalid credentials
- User registration
- Password reset flow
- Logout functionality
- Session persistence
- Protected route access
- Localization (English/Arabic)

**Coverage**: ~25 test cases

#### 2. Dashboard Tests (`dashboard.spec.ts`)
- Dashboard overview display
- Statistics cards
- Quick actions
- Recent documents
- Activity feed
- Power tools navigation
- Responsive design
- Localization

**Coverage**: ~30 test cases

#### 3. Documents Tests (`documents.spec.ts`)
- Document list display
- View document details
- Edit document
- Delete document
- Download document
- Share document
- Search and filter
- Pagination

**Coverage**: ~20 test cases

#### 4. Templates Tests (`templates.spec.ts`)
- Template gallery display
- Browse templates by category
- Search templates
- Template preview
- Use template to create document
- Multi-language templates
- Template sorting and filtering

**Coverage**: ~20 test cases

#### 5. Generate Tests (`generate.spec.ts`)
- AI document generation flow
- Document type selection
- Form field validation
- AI prompt customization
- Multi-step generation
- Document preview
- Save generated document
- Error handling

**Coverage**: ~25 test cases

#### 6. Signatures Tests (`signatures.spec.ts`)
- Create signature request
- Add multiple signers
- Send signature request
- View signature status
- Sign document (draw/type/upload signature)
- Download signed document
- Audit trail
- Signature notifications

**Coverage**: ~30 test cases

### Total Test Coverage

**Total E2E Tests**: ~150 test cases
**Total Test Files**: 6 main test suites
**Browsers Tested**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Test Coverage

### Features Covered

✅ Authentication & Authorization
✅ Dashboard & Navigation
✅ Document Management (CRUD)
✅ Template System
✅ AI Document Generation
✅ Electronic Signatures
✅ Search & Filtering
✅ Localization (English/Arabic)
✅ Responsive Design
✅ Error Handling
✅ Form Validation

### User Flows Covered

1. **New User Flow**
   - Register → Login → Explore Dashboard → Create Document

2. **Document Creation Flow**
   - Browse Templates → Select Template → Fill Details → Generate → Save

3. **Signature Flow**
   - Create Document → Request Signature → Sign Document → Download

4. **Legal Advisory Flow**
   - Ask Question → Get AI Response → Save Consultation

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

### Run Specific Tests

```bash
# Run single test file
npx playwright test auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run on specific browser
npx playwright test --project=chromium

# Run on mobile
npx playwright test --project="Mobile Chrome"
```

### View Reports

```bash
# Show HTML report
npm run test:e2e:report

# Show specific test trace
npx playwright show-trace trace.zip
```

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await login(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.goto('/dashboard');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Page Object Pattern for complex flows**
```typescript
class DocumentPage {
  constructor(private page: Page) {}

  async createDocument(title: string) {
    await this.page.goto('/documents/new');
    await this.page.fill('[name="title"]', title);
    await this.page.click('button[type="submit"]');
  }
}
```

2. **Use data-testid for stable selectors**
```html
<button data-testid="submit-button">Submit</button>
```

```typescript
await page.locator('[data-testid="submit-button"]').click();
```

3. **Wait for elements properly**
```typescript
// Good
await expect(page.locator('[data-testid="content"]')).toBeVisible();

// Avoid
await page.waitForTimeout(5000);
```

4. **Use helper functions**
```typescript
// Good
await login(page);
await fillField(page, 'Email', 'test@example.com');

// Avoid repeating code
```

5. **Clean up test data**
```typescript
test.afterEach(async ({ page }) => {
  await cleanupTestData(page);
});
```

### Utility Functions

Located in `e2e/utils/`:

- **test-helpers.ts**: Common utilities (wait, fill, click, etc.)
- **auth-helpers.ts**: Authentication helpers (login, logout, etc.)
- **fixtures.ts**: Test data and fixtures

### Example Test

```typescript
import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';
import { fillField, waitForToast } from './utils/test-helpers';

test.describe('Create Document', () => {
  test('should create rental agreement', async ({ page }) => {
    await login(page);

    await page.goto('/en/dashboard/generate');
    await page.click('button[value="rental"]');

    await fillField(page, 'Landlord Name', 'John Smith');
    await fillField(page, 'Tenant Name', 'Jane Doe');
    await fillField(page, 'Monthly Rent', '5000');

    await page.click('button:has-text("Generate")');

    await waitForToast(page, 'Document created successfully');
    await expect(page).toHaveURL(/\/documents/);
  });
});
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to main/master/develop branches
- Pull requests
- Manual workflow dispatch

See `.github/workflows/e2e-tests.yml` for configuration.

### Test Reports in CI

- HTML reports uploaded as artifacts
- Videos captured for failed tests
- Traces available for debugging
- PR comments with test results

### Running Tests in CI

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    BASE_URL: http://localhost:3000
```

## Debugging Failed Tests

### Local Debugging

1. **UI Mode** (recommended)
```bash
npm run test:e2e:ui
```

2. **Debug Mode**
```bash
npm run test:e2e:debug
```

3. **Headed Mode**
```bash
npm run test:e2e:headed
```

### Analyzing Failures

1. **Check Screenshots**
   - Located in `test-results/`
   - Captured on failure

2. **Watch Videos**
   - Recorded for failed tests
   - Located in `test-results/`

3. **View Traces**
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Common Issues

#### Timeout Errors
```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  test.setTimeout(60000);
  // ... test code
});
```

#### Flaky Tests
```typescript
// Add proper waits
await page.waitForLoadState('networkidle');
await expect(locator).toBeVisible();
```

#### Selector Issues
```typescript
// Use more specific selectors
await page.getByRole('button', { name: 'Submit' });
await page.getByTestId('submit-button');
```

## Performance Testing

### Metrics Collected

- Page load times
- Navigation speed
- API response times
- Rendering performance

### Example

```typescript
test('dashboard loads quickly', async ({ page }) => {
  const start = Date.now();
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Accessibility Testing

Include basic accessibility checks:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('page is accessible', async ({ page }) => {
  await page.goto('/dashboard');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Mobile Testing

Tests run on mobile viewports:

```typescript
test('mobile view', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');
  // ... test mobile specific behavior
});
```

## Localization Testing

Tests cover both English and Arabic:

```typescript
test('displays in Arabic', async ({ page }) => {
  await page.goto('/ar/dashboard');
  const dir = await page.locator('html').getAttribute('dir');
  expect(dir).toBe('rtl');
});
```

## Test Maintenance

### Regular Tasks

1. **Update test data** when API changes
2. **Update selectors** when UI changes
3. **Add tests** for new features
4. **Remove tests** for deprecated features
5. **Review flaky tests** weekly

### Code Review Checklist

- [ ] Tests follow naming conventions
- [ ] Use helper functions where possible
- [ ] Add comments for complex test logic
- [ ] Clean up test data
- [ ] Update README if needed

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [E2E Testing Guide](./e2e/README.md)

## Support

For questions or issues with tests:
1. Check existing test examples
2. Review helper functions in `utils/`
3. Consult Playwright documentation
4. Ask the team

---

**Last Updated**: 2024-01-01
**Maintained By**: LegalDocs Development Team

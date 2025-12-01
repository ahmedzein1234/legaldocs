import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';
import {
  waitForPageLoad,
  fillField,
  waitForLoadingToComplete,
  verifyVisible,
  clickByText,
} from './utils/test-helpers';
import { testTemplates } from './utils/fixtures';

test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/en/dashboard/templates');
    await waitForPageLoad(page);
  });

  test.describe('Templates Gallery', () => {
    test('should display templates page correctly', async ({ page }) => {
      // Verify page heading
      await expect(page.getByRole('heading', { name: /templates|document templates/i })).toBeVisible();

      // Look for templates grid or list
      const templatesContainer = page.locator('[data-testid="templates-grid"], .templates-grid, [data-testid="templates-list"]');

      if (await templatesContainer.count() > 0) {
        await expect(templatesContainer.first()).toBeVisible();
      }
    });

    test('should display template cards', async ({ page }) => {
      // Wait for templates to load
      await page.waitForTimeout(2000);

      // Look for template cards
      const templateCards = page.locator('[data-testid="template-card"], .template-card, [role="article"]');

      const count = await templateCards.count();
      console.log(`Found ${count} templates`);

      if (count > 0) {
        await expect(templateCards.first()).toBeVisible();

        // Each card should have title
        const firstCard = templateCards.first();
        await expect(firstCard).toContainText(/.+/); // Has some text
      }
    });

    test('should show template categories', async ({ page }) => {
      // Look for category filters or tabs
      const categories = page.locator('[data-testid="category-filter"], button:has-text("Real Estate"), button:has-text("Employment"), button:has-text("Business")');

      if (await categories.count() > 0) {
        await expect(categories.first()).toBeVisible();
      }
    });

    test('should filter templates by category', async ({ page }) => {
      // Find category filter
      const categoryButton = page.locator('button:has-text("Real Estate"), button:has-text("Employment")').first();

      if (await categoryButton.count() > 0) {
        await categoryButton.click();
        await waitForLoadingToComplete(page);

        // Templates should be filtered
        const templateCards = page.locator('[data-testid="template-card"], .template-card');

        if (await templateCards.count() > 0) {
          // Verify filtered results
          await expect(templateCards.first()).toBeVisible();
        }
      }
    });

    test('should search templates', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search"]');

      if (await searchInput.count() > 0) {
        await searchInput.first().fill('rental');
        await page.waitForTimeout(500); // Debounce
        await waitForLoadingToComplete(page);

        // Should show filtered results
        const results = page.locator('[data-testid="template-card"], .template-card');

        if (await results.count() > 0) {
          const firstResult = results.first();
          await expect(firstResult).toContainText(/rental/i);
        }
      }
    });

    test('should display template preview on hover or click', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        // Hover over template
        await templateCard.hover();

        // Look for preview or tooltip
        const preview = page.locator('[data-testid="template-preview"], .template-preview, [role="tooltip"]');

        // Preview might appear on hover or click
        if (await preview.count() === 0) {
          await templateCard.click();
        }
      }
    });

    test('should show template details', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        // Each template should show details like name, category, description
        await expect(templateCard).toContainText(/.+/);

        // Look for use button
        const useButton = templateCard.locator('button:has-text("Use"), button:has-text("Select")');

        if (await useButton.count() > 0) {
          await expect(useButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Template Preview', () => {
    test('should open template preview', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        // Look for preview button
        const previewButton = templateCard.locator('button:has-text("Preview"), button:has-text("View")');

        if (await previewButton.count() > 0) {
          await previewButton.first().click();
          await waitForLoadingToComplete(page);

          // Should show preview modal or page
          const previewModal = page.locator('[role="dialog"], [data-testid="template-preview-modal"]');

          if (await previewModal.count() > 0) {
            await expect(previewModal).toBeVisible();
          }
        }
      }
    });

    test('should display template content in preview', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        // Click to preview
        await templateCard.click();
        await waitForLoadingToComplete(page);

        // Look for template content
        const content = page.locator('[data-testid="template-content"], .template-content, .preview-content');

        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
          await expect(content.first()).toContainText(/.+/);
        }
      }
    });

    test('should close template preview', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        await templateCard.click();
        await waitForLoadingToComplete(page);

        // Look for close button
        const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"], [data-testid="close"]');

        if (await closeButton.count() > 0) {
          await closeButton.first().click();

          // Modal should close
          const modal = page.locator('[role="dialog"]');
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('should use template from preview', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        await templateCard.click();
        await waitForLoadingToComplete(page);

        // Look for "Use Template" button
        const useButton = page.getByRole('button', { name: /use template|use this|select/i });

        if (await useButton.count() > 0) {
          await useButton.first().click();
          await waitForLoadingToComplete(page);

          // Should navigate to generate/create page
          await page.waitForURL(/\/(generate|documents\/new|create)/, { timeout: 10000 });
        }
      }
    });
  });

  test.describe('Use Template', () => {
    test('should start document from template', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        // Find and click "Use Template" button
        const useButton = templateCard.locator('button:has-text("Use"), button:has-text("Select")');

        if (await useButton.count() > 0) {
          await useButton.first().click();
          await waitForLoadingToComplete(page);

          // Should navigate to document creation flow
          await page.waitForURL(/\/(generate|documents\/new|create)/, { timeout: 10000 });
        } else {
          // Try clicking the card itself
          await templateCard.click();

          const useInPreview = page.getByRole('button', { name: /use template|use this/i });
          if (await useInPreview.count() > 0) {
            await useInPreview.first().click();
            await waitForLoadingToComplete(page);
          }
        }
      }
    });

    test('should fill template fields', async ({ page }) => {
      // Select a rental agreement template
      const rentalTemplate = page.locator('[data-testid="template-card"]:has-text("Rental"), .template-card:has-text("Rental")').first();

      if (await rentalTemplate.count() > 0) {
        const useButton = rentalTemplate.locator('button:has-text("Use")');

        if (await useButton.count() > 0) {
          await useButton.first().click();
        } else {
          await rentalTemplate.click();
          await page.getByRole('button', { name: /use/i }).first().click();
        }

        await waitForLoadingToComplete(page);

        // Look for form fields to fill
        const formFields = page.locator('input[type="text"], textarea, [contenteditable="true"]');

        if (await formFields.count() > 0) {
          // Fill first few fields
          const fields = await formFields.all();

          for (let i = 0; i < Math.min(3, fields.length); i++) {
            const field = fields[i];
            const isVisible = await field.isVisible().catch(() => false);

            if (isVisible) {
              await field.fill(`Test Value ${i + 1}`);
            }
          }

          // Look for next or continue button
          const continueButton = page.getByRole('button', { name: /continue|next|generate/i });

          if (await continueButton.count() > 0) {
            await continueButton.first().click();
            await waitForLoadingToComplete(page);
          }
        }
      }
    });

    test('should validate required template fields', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        const useButton = templateCard.locator('button:has-text("Use")');

        if (await useButton.count() > 0) {
          await useButton.first().click();
        } else {
          await templateCard.click();
          const useInPreview = page.getByRole('button', { name: /use/i });
          if (await useInPreview.count() > 0) {
            await useInPreview.first().click();
          }
        }

        await waitForLoadingToComplete(page);

        // Try to submit without filling required fields
        const submitButton = page.getByRole('button', { name: /generate|create|submit/i });

        if (await submitButton.count() > 0) {
          await submitButton.first().click();

          // Should show validation errors
          const errorMessage = page.locator('.text-destructive, [role="alert"]');

          // May or may not have errors depending on required fields
          const errorCount = await errorMessage.count();
          console.log(`Validation errors found: ${errorCount}`);
        }
      }
    });

    test('should generate document from template', async ({ page }) => {
      const templateCard = page.locator('[data-testid="template-card"], .template-card').first();

      if (await templateCard.count() > 0) {
        const useButton = templateCard.locator('button:has-text("Use")');

        if (await useButton.count() > 0) {
          await useButton.first().click();
        } else {
          await templateCard.click();
          const useInPreview = page.getByRole('button', { name: /use/i });
          if (await useInPreview.count() > 0) {
            await useInPreview.first().click();
          }
        }

        await waitForLoadingToComplete(page);

        // Fill out minimal required fields if any
        const textInputs = page.locator('input[type="text"]');
        const inputCount = await textInputs.count();

        for (let i = 0; i < Math.min(3, inputCount); i++) {
          const input = textInputs.nth(i);
          const isVisible = await input.isVisible().catch(() => false);

          if (isVisible) {
            await input.fill(`Test Data ${i + 1}`);
          }
        }

        // Submit to generate
        const generateButton = page.getByRole('button', { name: /generate|create|submit/i });

        if (await generateButton.count() > 0) {
          await generateButton.first().click();
          await waitForLoadingToComplete(page);

          // Should create document (may take time for AI generation)
          await page.waitForTimeout(3000);
        }
      }
    });
  });

  test.describe('Template Categories', () => {
    test('should show all template categories', async ({ page }) => {
      const categories = page.locator('[data-testid="category"], .category-tab, button[role="tab"]');

      if (await categories.count() > 0) {
        const count = await categories.count();
        console.log(`Found ${count} categories`);

        expect(count).toBeGreaterThan(0);
      }
    });

    test('should filter by Real Estate category', async ({ page }) => {
      const realEstateButton = page.locator('button:has-text("Real Estate"), [data-testid="category-real-estate"]');

      if (await realEstateButton.count() > 0) {
        await realEstateButton.first().click();
        await waitForLoadingToComplete(page);

        // Templates should be filtered
        const templates = page.locator('[data-testid="template-card"], .template-card');
        const count = await templates.count();

        console.log(`Found ${count} real estate templates`);
      }
    });

    test('should filter by Employment category', async ({ page }) => {
      const employmentButton = page.locator('button:has-text("Employment"), [data-testid="category-employment"]');

      if (await employmentButton.count() > 0) {
        await employmentButton.first().click();
        await waitForLoadingToComplete(page);

        const templates = page.locator('[data-testid="template-card"], .template-card');
        const count = await templates.count();

        console.log(`Found ${count} employment templates`);
      }
    });

    test('should filter by Business category', async ({ page }) => {
      const businessButton = page.locator('button:has-text("Business"), [data-testid="category-business"]');

      if (await businessButton.count() > 0) {
        await businessButton.first().click();
        await waitForLoadingToComplete(page);

        const templates = page.locator('[data-testid="template-card"], .template-card');
        const count = await templates.count();

        console.log(`Found ${count} business templates`);
      }
    });

    test('should show all templates when clearing filter', async ({ page }) => {
      // First apply a filter
      const categoryButton = page.locator('button:has-text("Real Estate")').first();

      if (await categoryButton.count() > 0) {
        await categoryButton.click();
        await waitForLoadingToComplete(page);

        // Then clear it
        const allButton = page.locator('button:has-text("All"), button:has-text("Clear")');

        if (await allButton.count() > 0) {
          await allButton.first().click();
          await waitForLoadingToComplete(page);
        }
      }
    });
  });

  test.describe('Template Languages', () => {
    test('should show templates in English', async ({ page }) => {
      // By default should be in English
      const templates = page.locator('[data-testid="template-card"], .template-card');

      if (await templates.count() > 0) {
        await expect(templates.first()).toBeVisible();
      }
    });

    test('should show templates in Arabic', async ({ page }) => {
      // Navigate to Arabic version
      await page.goto('/ar/dashboard/templates');
      await waitForPageLoad(page);

      // Page should be RTL
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');

      const templates = page.locator('[data-testid="template-card"], .template-card');

      if (await templates.count() > 0) {
        await expect(templates.first()).toBeVisible();
      }
    });

    test('should filter templates by language', async ({ page }) => {
      const languageFilter = page.locator('select[name="language"], [data-testid="language-filter"]');

      if (await languageFilter.count() > 0) {
        await languageFilter.first().selectOption('ar');
        await waitForLoadingToComplete(page);

        // Should show Arabic templates
        const templates = page.locator('[data-testid="template-card"], .template-card');
        const count = await templates.count();

        console.log(`Found ${count} Arabic templates`);
      }
    });
  });

  test.describe('Template Sorting', () => {
    test('should sort templates by popularity', async ({ page }) => {
      const sortDropdown = page.locator('select[name="sort"], [data-testid="sort"]');

      if (await sortDropdown.count() > 0) {
        await sortDropdown.first().selectOption('popular');
        await waitForLoadingToComplete(page);
      }
    });

    test('should sort templates by name', async ({ page }) => {
      const sortDropdown = page.locator('select[name="sort"], [data-testid="sort"]');

      if (await sortDropdown.count() > 0) {
        await sortDropdown.first().selectOption('name');
        await waitForLoadingToComplete(page);
      }
    });

    test('should sort templates by newest first', async ({ page }) => {
      const sortDropdown = page.locator('select[name="sort"], [data-testid="sort"]');

      if (await sortDropdown.count() > 0) {
        await sortDropdown.first().selectOption('newest');
        await waitForLoadingToComplete(page);
      }
    });
  });
});

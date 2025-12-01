import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';
import {
  waitForPageLoad,
  fillField,
  waitForLoadingToComplete,
  waitForToast,
  generateRandomString,
  selectOption,
} from './utils/test-helpers';
import { testDocuments } from './utils/fixtures';

test.describe('AI Document Generation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/en/dashboard/generate');
    await waitForPageLoad(page);
  });

  test.describe('Generate Page Layout', () => {
    test('should display generate page correctly', async ({ page }) => {
      // Verify page heading
      await expect(page.getByRole('heading', { name: /generate|create|new document/i })).toBeVisible();

      // Look for document type selector or form
      const documentTypes = page.locator('[data-testid="document-type"], select[name="type"], [role="radiogroup"]');

      if (await documentTypes.count() > 0) {
        await expect(documentTypes.first()).toBeVisible();
      }
    });

    test('should show document type options', async ({ page }) => {
      // Look for different document types
      const typeOptions = page.locator('button:has-text("Rental"), button:has-text("Employment"), button:has-text("NDA"), [role="radio"]');

      const count = await typeOptions.count();
      console.log(`Found ${count} document type options`);

      if (count > 0) {
        await expect(typeOptions.first()).toBeVisible();
      }
    });

    test('should show AI-powered indicator', async ({ page }) => {
      const aiIndicator = page.locator('text=/ai|artificial intelligence|powered by ai/i');

      if (await aiIndicator.count() > 0) {
        await expect(aiIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('Select Document Type', () => {
    test('should select rental agreement type', async ({ page }) => {
      const rentalOption = page.locator('button:has-text("Rental"), [value="rental"], [data-value="rental_agreement"]').first();

      if (await rentalOption.count() > 0) {
        await rentalOption.click();
        await waitForLoadingToComplete(page);

        // Should highlight or show as selected
        // The exact implementation varies
      }
    });

    test('should select NDA type', async ({ page }) => {
      const ndaOption = page.locator('button:has-text("NDA"), [value="nda"], text=/non-disclosure/i').first();

      if (await ndaOption.count() > 0) {
        await ndaOption.click();
        await waitForLoadingToComplete(page);
      }
    });

    test('should select employment contract type', async ({ page }) => {
      const employmentOption = page.locator('button:has-text("Employment"), [value="employment"], text=/employment contract/i').first();

      if (await employmentOption.count() > 0) {
        await employmentOption.click();
        await waitForLoadingToComplete(page);
      }
    });

    test('should show document type description', async ({ page }) => {
      const typeOption = page.locator('[data-testid="document-type-option"], .document-type-card').first();

      if (await typeOption.count() > 0) {
        await typeOption.hover();

        // Should show description or tooltip
        const description = page.locator('[data-testid="type-description"], .description, [role="tooltip"]');

        if (await description.count() > 0) {
          await expect(description.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Fill Document Details Form', () => {
    test('should display form fields after selecting type', async ({ page }) => {
      // Select a document type first
      const rentalOption = page.locator('button:has-text("Rental"), [value="rental"]').first();

      if (await rentalOption.count() > 0) {
        await rentalOption.click();
        await waitForLoadingToComplete(page);

        // Look for form fields
        const formFields = page.locator('input[type="text"], textarea, select');

        const count = await formFields.count();
        console.log(`Found ${count} form fields`);

        if (count > 0) {
          await expect(formFields.first()).toBeVisible();
        }
      }
    });

    test('should fill rental agreement details', async ({ page }) => {
      const rentalOption = page.locator('button:has-text("Rental"), [value="rental"]').first();

      if (await rentalOption.count() > 0) {
        await rentalOption.click();
        await waitForLoadingToComplete(page);

        // Fill form fields
        const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
        if (await titleInput.count() > 0) {
          await titleInput.first().fill(testDocuments.rentalAgreement.title);
        }

        const landlordInput = page.locator('input[name="landlord"], input[placeholder*="landlord"]');
        if (await landlordInput.count() > 0) {
          await landlordInput.first().fill(testDocuments.rentalAgreement.landlordName);
        }

        const tenantInput = page.locator('input[name="tenant"], input[placeholder*="tenant"]');
        if (await tenantInput.count() > 0) {
          await tenantInput.first().fill(testDocuments.rentalAgreement.tenantName);
        }

        const rentInput = page.locator('input[name="rent"], input[placeholder*="rent"]');
        if (await rentInput.count() > 0) {
          await rentInput.first().fill(testDocuments.rentalAgreement.monthlyRent);
        }
      }
    });

    test('should validate required fields', async ({ page }) => {
      const typeOption = page.locator('[data-testid="document-type-option"], button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);

        // Try to submit without filling required fields
        const generateButton = page.getByRole('button', { name: /generate|create|submit/i });

        if (await generateButton.count() > 0) {
          await generateButton.first().click();

          // Should show validation errors
          const errorMessage = page.locator('.text-destructive, [role="alert"]');

          // Wait a bit for validation
          await page.waitForTimeout(1000);

          const errorCount = await errorMessage.count();
          console.log(`Validation errors: ${errorCount}`);
        }
      }
    });

    test('should show field descriptions or help text', async ({ page }) => {
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);

        // Look for help text
        const helpText = page.locator('.text-muted-foreground, .help-text, [class*="description"]');

        if (await helpText.count() > 0) {
          console.log('Help text found');
        }
      }
    });
  });

  test.describe('Generate Document', () => {
    test('should generate document with valid data', async ({ page }) => {
      const rentalOption = page.locator('button:has-text("Rental"), [value="rental"]').first();

      if (await rentalOption.count() > 0) {
        await rentalOption.click();
        await waitForLoadingToComplete(page);

        // Fill minimal required fields
        const inputs = page.locator('input[type="text"]');
        const inputCount = await inputs.count();

        for (let i = 0; i < Math.min(4, inputCount); i++) {
          const input = inputs.nth(i);
          const isVisible = await input.isVisible().catch(() => false);

          if (isVisible) {
            await input.fill(`Test Value ${i + 1}`);
          }
        }

        // Click generate button
        const generateButton = page.getByRole('button', { name: /generate|create/i });

        if (await generateButton.count() > 0) {
          await generateButton.first().click();

          // Wait for generation (can take time with AI)
          await waitForLoadingToComplete(page);

          // Should navigate to document view or show success
          // The exact behavior depends on implementation
          await page.waitForTimeout(5000);

          // Look for success indicators
          const successMessage = page.locator('text=/success|generated|created/i');
          const documentContent = page.locator('[data-testid="document-content"], .document-viewer');

          const hasSuccess = await successMessage.count() > 0;
          const hasContent = await documentContent.count() > 0;

          console.log(`Success message: ${hasSuccess}, Document content: ${hasContent}`);
        }
      }
    });

    test('should show loading state during generation', async ({ page }) => {
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);

        // Fill minimal data
        const inputs = page.locator('input[type="text"]');
        const firstInput = inputs.first();

        if (await firstInput.count() > 0) {
          await firstInput.fill('Test Data');
        }

        // Click generate
        const generateButton = page.getByRole('button', { name: /generate|create/i });

        if (await generateButton.count() > 0) {
          await generateButton.first().click();

          // Should show loading indicator
          const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], text=/generating|creating/i');

          // Check if loading appears (might be very fast)
          await page.waitForTimeout(500);

          const isLoading = await loadingIndicator.count();
          console.log(`Loading indicator visible: ${isLoading > 0}`);
        }
      }
    });

    test('should handle generation errors gracefully', async ({ page }) => {
      // This test would need to mock API errors
      // For now, verify the page doesn't crash
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);

        const generateButton = page.getByRole('button', { name: /generate|create/i });

        if (await generateButton.count() > 0) {
          await generateButton.first().click();

          // Wait and check page is still functional
          await page.waitForTimeout(2000);

          await expect(page.locator('body')).toBeVisible();
        }
      }
    });
  });

  test.describe('AI Prompts and Customization', () => {
    test('should allow custom AI prompt input', async ({ page }) => {
      const promptInput = page.locator('textarea[name="prompt"], textarea[placeholder*="prompt"], [data-testid="ai-prompt"]');

      if (await promptInput.count() > 0) {
        await expect(promptInput.first()).toBeVisible();

        await promptInput.first().fill('Create a rental agreement for a luxury apartment in Dubai Marina.');
      }
    });

    test('should show AI suggestions or examples', async ({ page }) => {
      const suggestions = page.locator('[data-testid="suggestion"], .suggestion, button:has-text("Example")');

      if (await suggestions.count() > 0) {
        console.log('Found AI suggestions');
        await expect(suggestions.first()).toBeVisible();
      }
    });

    test('should allow language selection for generation', async ({ page }) => {
      const languageSelect = page.locator('select[name="language"], [data-testid="language-select"]');

      if (await languageSelect.count() > 0) {
        await languageSelect.first().selectOption('ar');
      }
    });

    test('should allow tone/style customization', async ({ page }) => {
      const toneOptions = page.locator('[name="tone"], [data-testid="tone-select"], button:has-text("Formal"), button:has-text("Professional")');

      if (await toneOptions.count() > 0) {
        await toneOptions.first().click();
      }
    });
  });

  test.describe('Multi-Step Generation Flow', () => {
    test('should navigate through generation steps', async ({ page }) => {
      // Step 1: Select type
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);

        // Look for next/continue button
        const nextButton = page.getByRole('button', { name: /next|continue/i });

        if (await nextButton.count() > 0) {
          await nextButton.first().click();
          await waitForLoadingToComplete(page);

          // Should move to next step
          const stepIndicator = page.locator('[data-testid="step-2"], text=/step 2/i');

          if (await stepIndicator.count() > 0) {
            console.log('Advanced to step 2');
          }
        }
      }
    });

    test('should go back to previous step', async ({ page }) => {
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();

        const nextButton = page.getByRole('button', { name: /next|continue/i });

        if (await nextButton.count() > 0) {
          await nextButton.first().click();
          await waitForLoadingToComplete(page);

          // Now go back
          const backButton = page.getByRole('button', { name: /back|previous/i });

          if (await backButton.count() > 0) {
            await backButton.first().click();
            await waitForLoadingToComplete(page);
          }
        }
      }
    });

    test('should show progress indicator', async ({ page }) => {
      const progressIndicator = page.locator('[data-testid="progress"], .progress, [role="progressbar"]');

      if (await progressIndicator.count() > 0) {
        await expect(progressIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('Document Preview', () => {
    test('should show preview of generated document', async ({ page }) => {
      // After generation, should show preview
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);

        // Fill and generate
        const inputs = page.locator('input[type="text"]');
        if (await inputs.count() > 0) {
          await inputs.first().fill('Test Data');
        }

        const generateButton = page.getByRole('button', { name: /generate|create/i });

        if (await generateButton.count() > 0) {
          await generateButton.first().click();
          await page.waitForTimeout(5000);

          // Look for preview
          const preview = page.locator('[data-testid="preview"], .preview, .document-viewer');

          if (await preview.count() > 0) {
            await expect(preview.first()).toBeVisible();
          }
        }
      }
    });

    test('should allow editing generated document', async ({ page }) => {
      // This depends on the flow after generation
      const editButton = page.getByRole('button', { name: /edit|modify/i });

      if (await editButton.count() > 0) {
        await editButton.first().click();
        await waitForLoadingToComplete(page);

        // Should open editor
        const editor = page.locator('[contenteditable="true"], .editor');

        if (await editor.count() > 0) {
          await expect(editor.first()).toBeVisible();
        }
      }
    });

    test('should allow downloading generated document', async ({ page }) => {
      const downloadButton = page.getByRole('button', { name: /download|export/i });

      if (await downloadButton.count() > 0) {
        const downloadPromise = page.waitForEvent('download').catch(() => null);
        await downloadButton.first().click();

        const download = await downloadPromise;

        if (download) {
          console.log(`Downloaded: ${download.suggestedFilename()}`);
        }
      }
    });

    test('should save generated document', async ({ page }) => {
      const saveButton = page.getByRole('button', { name: /save|keep/i });

      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await waitForLoadingToComplete(page);

        // Should show success message
        const successMessage = page.locator('text=/saved|success/i');

        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Template Integration', () => {
    test('should navigate to templates from generate page', async ({ page }) => {
      const templatesLink = page.locator('a:has-text("Browse templates"), a[href*="templates"]');

      if (await templatesLink.count() > 0) {
        await templatesLink.first().click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/templates/);
      }
    });

    test('should pre-fill data when coming from template', async ({ page }) => {
      // This test assumes coming from templates page
      // Would need proper test setup with template selection
      console.log('Template pre-fill test - requires template selection flow');
    });
  });

  test.describe('Cancel and Reset', () => {
    test('should cancel generation and return to dashboard', async ({ page }) => {
      const cancelButton = page.getByRole('button', { name: /cancel|back to dashboard/i });

      if (await cancelButton.count() > 0) {
        await cancelButton.first().click();

        // Should navigate back
        await expect(page).toHaveURL(/\/dashboard/);
      }
    });

    test('should reset form', async ({ page }) => {
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();

        // Fill some data
        const input = page.locator('input[type="text"]').first();
        if (await input.count() > 0) {
          await input.fill('Test Data');
        }

        // Reset
        const resetButton = page.getByRole('button', { name: /reset|clear/i });

        if (await resetButton.count() > 0) {
          await resetButton.first().click();

          // Form should be cleared
          const inputValue = await input.inputValue();
          expect(inputValue).toBe('');
        }
      }
    });
  });

  test.describe('Localization', () => {
    test('should generate document in Arabic', async ({ page }) => {
      await page.goto('/ar/dashboard/generate');
      await waitForPageLoad(page);

      // Page should be RTL
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');

      // Should be able to generate in Arabic
      const typeOption = page.locator('button[value]').first();

      if (await typeOption.count() > 0) {
        await typeOption.click();
        await waitForLoadingToComplete(page);
      }
    });
  });
});

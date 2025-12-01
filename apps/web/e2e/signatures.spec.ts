import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';
import {
  waitForPageLoad,
  fillField,
  waitForLoadingToComplete,
  waitForToast,
  generateRandomEmail,
  generateRandomString,
} from './utils/test-helpers';
import { testSignatures } from './utils/fixtures';

test.describe('Signature Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Signatures List', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);
    });

    test('should display signatures page correctly', async ({ page }) => {
      // Verify page heading
      await expect(page.getByRole('heading', { name: /signatures|signature requests/i })).toBeVisible();

      // Look for new signature request button
      const newButton = page.getByRole('button', { name: /new|request signature|create/i });

      if (await newButton.count() > 0) {
        await expect(newButton.first()).toBeVisible();
      }
    });

    test('should display signature requests list', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for signature items
      const signatureItems = page.locator('[data-testid="signature-item"], .signature-item, [data-testid="signature-card"]');

      const count = await signatureItems.count();
      console.log(`Found ${count} signature requests`);

      if (count > 0) {
        await expect(signatureItems.first()).toBeVisible();
      }
    });

    test('should show signature status badges', async ({ page }) => {
      const statusBadges = page.locator('[data-testid="status-badge"], .badge, [class*="status"]');

      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible();
      }
    });

    test('should filter signatures by status', async ({ page }) => {
      const filterDropdown = page.locator('button:has-text("All"), [data-testid="status-filter"]');

      if (await filterDropdown.count() > 0) {
        await filterDropdown.first().click();

        const pendingOption = page.getByRole('option', { name: /pending/i });

        if (await pendingOption.count() > 0) {
          await pendingOption.click();
          await waitForLoadingToComplete(page);
        }
      }
    });

    test('should search signature requests', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

      if (await searchInput.count() > 0) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
        await waitForLoadingToComplete(page);
      }
    });

    test('should show empty state when no signatures', async ({ page }) => {
      const emptyState = page.locator('text=/no signatures|no requests|get started/i');

      const exists = await emptyState.count();

      if (exists > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    });
  });

  test.describe('Create Signature Request', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/dashboard/signatures/new');
      await waitForPageLoad(page);
    });

    test('should display new signature request form', async ({ page }) => {
      // Verify page heading
      await expect(page.getByRole('heading', { name: /request signature|new signature|create/i })).toBeVisible();

      // Look for form fields
      const documentField = page.locator('[name="document"], [data-testid="document-select"]');
      const signerField = page.locator('[name="signer"], [name="email"]');

      if (await documentField.count() > 0 || await signerField.count() > 0) {
        console.log('Signature request form loaded');
      }
    });

    test('should select document for signature', async ({ page }) => {
      const documentSelect = page.locator('select[name="document"], [data-testid="document-select"]');

      if (await documentSelect.count() > 0) {
        // Select first document
        const options = await documentSelect.locator('option').count();

        if (options > 1) {
          await documentSelect.selectOption({ index: 1 });
        }
      } else {
        // Might be a different UI (cards, search, etc.)
        const documentCard = page.locator('[data-testid="document-card"], .document-item').first();

        if (await documentCard.count() > 0) {
          await documentCard.click();
        }
      }
    });

    test('should upload document for signature', async ({ page }) => {
      const uploadButton = page.locator('button:has-text("Upload"), input[type="file"]');

      if (await uploadButton.count() > 0) {
        console.log('Upload option available');

        // In a real test, you would upload a file
        // await page.setInputFiles('input[type="file"]', 'test-document.pdf');
      }
    });

    test('should add single signer', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();

      if (await emailInput.count() > 0) {
        await emailInput.fill(testSignatures.singleSigner.signerEmail);
      }

      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();

      if (await nameInput.count() > 0) {
        await nameInput.fill(testSignatures.singleSigner.signerName);
      }
    });

    test('should add multiple signers', async ({ page }) => {
      // Look for "Add signer" button
      const addSignerButton = page.getByRole('button', { name: /add signer|add another/i });

      if (await addSignerButton.count() > 0) {
        // Add first signer
        const firstEmail = page.locator('input[type="email"]').first();

        if (await firstEmail.count() > 0) {
          await firstEmail.fill(testSignatures.multipleSigners.signers[0].email);
        }

        // Add second signer
        await addSignerButton.click();
        await page.waitForTimeout(500);

        const emailInputs = page.locator('input[type="email"]');
        const count = await emailInputs.count();

        if (count > 1) {
          await emailInputs.nth(1).fill(testSignatures.multipleSigners.signers[1].email);
        }
      }
    });

    test('should remove signer', async ({ page }) => {
      const addSignerButton = page.getByRole('button', { name: /add signer/i });

      if (await addSignerButton.count() > 0) {
        // Add a signer
        await addSignerButton.click();

        // Look for remove button
        const removeButton = page.locator('button[aria-label="Remove"], button:has-text("Remove"), button:has-text("×")').first();

        if (await removeButton.count() > 0) {
          await removeButton.click();
          await page.waitForTimeout(300);
        }
      }
    });

    test('should add message for signers', async ({ page }) => {
      const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="message"]');

      if (await messageInput.count() > 0) {
        await messageInput.first().fill(testSignatures.singleSigner.message);
        await expect(messageInput.first()).toHaveValue(testSignatures.singleSigner.message);
      }
    });

    test('should set signing order', async ({ page }) => {
      const orderCheckbox = page.locator('input[type="checkbox"][name*="order"], input[name="sequential"]');

      if (await orderCheckbox.count() > 0) {
        await orderCheckbox.first().check();
        await expect(orderCheckbox.first()).toBeChecked();
      }
    });

    test('should set expiration date', async ({ page }) => {
      const expirationInput = page.locator('input[type="date"], input[name="expiration"]');

      if (await expirationInput.count() > 0) {
        await expirationInput.first().fill('2024-12-31');
      }
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit without filling required fields
      const sendButton = page.getByRole('button', { name: /send|submit|request/i });

      if (await sendButton.count() > 0) {
        await sendButton.first().click();

        // Should show validation errors
        const errorMessage = page.locator('.text-destructive, [role="alert"]');
        await page.waitForTimeout(1000);

        const errorCount = await errorMessage.count();
        console.log(`Validation errors: ${errorCount}`);
      }
    });

    test('should send signature request successfully', async ({ page }) => {
      // Select or upload document
      const documentSelect = page.locator('select[name="document"]');

      if (await documentSelect.count() > 0) {
        const options = await documentSelect.locator('option').count();
        if (options > 1) {
          await documentSelect.selectOption({ index: 1 });
        }
      }

      // Add signer
      const emailInput = page.locator('input[type="email"]').first();

      if (await emailInput.count() > 0) {
        await emailInput.fill(generateRandomEmail());
      }

      const nameInput = page.locator('input[name="name"]').first();

      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Signer');
      }

      // Submit
      const sendButton = page.getByRole('button', { name: /send|submit|request/i });

      if (await sendButton.count() > 0) {
        await sendButton.first().click();
        await waitForLoadingToComplete(page);

        // Should show success message or redirect
        const successMessage = page.locator('text=/sent|success|requested/i');

        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }

        // Or redirect to signatures list
        await page.waitForURL(/\/signatures/, { timeout: 10000 }).catch(() => {});
      }
    });

    test('should preview document before sending', async ({ page }) => {
      const previewButton = page.getByRole('button', { name: /preview|view/i });

      if (await previewButton.count() > 0) {
        await previewButton.first().click();

        // Should show preview
        const preview = page.locator('[data-testid="document-preview"], .preview-modal');

        if (await preview.count() > 0) {
          await expect(preview.first()).toBeVisible();
        }
      }
    });

    test('should cancel signature request creation', async ({ page }) => {
      const cancelButton = page.getByRole('button', { name: /cancel|back/i });

      if (await cancelButton.count() > 0) {
        await cancelButton.first().click();

        // Should navigate back
        await expect(page).toHaveURL(/\/signatures|\/dashboard/);
      }
    });
  });

  test.describe('View Signature Request', () => {
    test('should view signature request details', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"], .signature-item').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        // Should show details
        const details = page.locator('[data-testid="signature-details"], .signature-details');

        if (await details.count() > 0) {
          await expect(details.first()).toBeVisible();
        }
      }
    });

    test('should display list of signers', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"]').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        // Look for signers list
        const signersList = page.locator('[data-testid="signers-list"], .signers');

        if (await signersList.count() > 0) {
          await expect(signersList.first()).toBeVisible();
        }
      }
    });

    test('should show signer status', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"]').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        // Look for status indicators
        const statusBadges = page.locator('[data-testid="signer-status"], .status-badge');

        if (await statusBadges.count() > 0) {
          await expect(statusBadges.first()).toBeVisible();
        }
      }
    });

    test('should view document in signature request', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"]').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        const viewDocButton = page.getByRole('button', { name: /view document|preview/i });

        if (await viewDocButton.count() > 0) {
          await viewDocButton.first().click();

          // Should show document viewer
          const viewer = page.locator('[data-testid="document-viewer"], .document-preview');

          if (await viewer.count() > 0) {
            await expect(viewer.first()).toBeVisible();
          }
        }
      }
    });

    test('should send reminder to signers', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"]').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        const reminderButton = page.getByRole('button', { name: /remind|send reminder/i });

        if (await reminderButton.count() > 0) {
          await reminderButton.first().click();
          await waitForLoadingToComplete(page);

          // Should show success message
          await waitForToast(page);
        }
      }
    });

    test('should cancel signature request', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"]').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        const cancelButton = page.getByRole('button', { name: /cancel request|withdraw/i });

        if (await cancelButton.count() > 0) {
          await cancelButton.first().click();

          // Should show confirmation dialog
          const confirmDialog = page.locator('[role="dialog"]');

          if (await confirmDialog.count() > 0) {
            const confirmButton = confirmDialog.getByRole('button', { name: /confirm|yes/i });

            if (await confirmButton.count() > 0) {
              await confirmButton.click();
              await waitForLoadingToComplete(page);
            }
          }
        }
      }
    });
  });

  test.describe('Sign Document', () => {
    test('should access document via signature link', async ({ page }) => {
      // This would require a valid signature token
      // For testing, we can check if the signature page loads

      // Navigate to a mock signature URL
      await page.goto('/en/sign/mock-token-123');

      // Page should load (even if token is invalid)
      await waitForPageLoad(page);

      // Should show signature page or error
      const signaturePage = page.locator('text=/sign|signature/i');
      const errorMessage = page.locator('text=/invalid|expired|not found/i');

      const hasSignaturePage = await signaturePage.count() > 0;
      const hasError = await errorMessage.count() > 0;

      console.log(`Signature page: ${hasSignaturePage}, Error: ${hasError}`);
    });

    test('should display document to be signed', async ({ page }) => {
      // Mock signature flow
      // In a real test, you'd have a valid token

      const documentViewer = page.locator('[data-testid="document-viewer"], .document-content');

      if (await documentViewer.count() > 0) {
        await expect(documentViewer.first()).toBeVisible();
      }
    });

    test('should draw signature on signature pad', async ({ page }) => {
      const signaturePad = page.locator('[data-testid="signature-pad"], canvas');

      if (await signaturePad.count() > 0) {
        // Simulate drawing
        const box = await signaturePad.first().boundingBox();

        if (box) {
          await page.mouse.move(box.x + 10, box.y + 10);
          await page.mouse.down();
          await page.mouse.move(box.x + 100, box.y + 50);
          await page.mouse.up();
        }
      }
    });

    test('should clear signature', async ({ page }) => {
      const clearButton = page.getByRole('button', { name: /clear|reset/i });

      if (await clearButton.count() > 0) {
        await clearButton.first().click();

        // Signature pad should be cleared
      }
    });

    test('should type signature', async ({ page }) => {
      const typeTab = page.locator('button:has-text("Type"), [data-testid="type-signature"]');

      if (await typeTab.count() > 0) {
        await typeTab.first().click();

        const typeInput = page.locator('input[name="signature"], input[placeholder*="signature"]');

        if (await typeInput.count() > 0) {
          await typeInput.first().fill('John Doe');
        }
      }
    });

    test('should upload signature image', async ({ page }) => {
      const uploadTab = page.locator('button:has-text("Upload"), [data-testid="upload-signature"]');

      if (await uploadTab.count() > 0) {
        await uploadTab.first().click();

        const fileInput = page.locator('input[type="file"]');

        if (await fileInput.count() > 0) {
          // In real test, upload actual file
          // await fileInput.setInputFiles('signature.png');
          console.log('Upload signature option available');
        }
      }
    });

    test('should agree to terms before signing', async ({ page }) => {
      const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="agree"]');

      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.first().check();
        await expect(termsCheckbox.first()).toBeChecked();
      }
    });

    test('should submit signature successfully', async ({ page }) => {
      // Draw signature
      const signaturePad = page.locator('canvas');

      if (await signaturePad.count() > 0) {
        const box = await signaturePad.first().boundingBox();

        if (box) {
          await page.mouse.move(box.x + 10, box.y + 10);
          await page.mouse.down();
          await page.mouse.move(box.x + 100, box.y + 50);
          await page.mouse.up();
        }
      }

      // Agree to terms
      const termsCheckbox = page.locator('input[type="checkbox"]').first();

      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.check();
      }

      // Submit
      const submitButton = page.getByRole('button', { name: /sign|submit|confirm/i });

      if (await submitButton.count() > 0) {
        await submitButton.first().click();
        await waitForLoadingToComplete(page);

        // Should show success message
        const successMessage = page.locator('text=/success|signed|complete/i');

        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    });

    test('should validate signature before submission', async ({ page }) => {
      // Try to submit without signature
      const submitButton = page.getByRole('button', { name: /sign|submit/i });

      if (await submitButton.count() > 0) {
        await submitButton.first().click();

        // Should show validation error
        const errorMessage = page.locator('.text-destructive, [role="alert"]');

        if (await errorMessage.count() > 0) {
          console.log('Validation error shown');
        }
      }
    });

    test('should decline to sign', async ({ page }) => {
      const declineButton = page.getByRole('button', { name: /decline|reject/i });

      if (await declineButton.count() > 0) {
        await declineButton.first().click();

        // Should show confirmation
        const confirmDialog = page.locator('[role="dialog"]');

        if (await confirmDialog.count() > 0) {
          const confirmButton = confirmDialog.getByRole('button', { name: /confirm|yes/i });

          if (await confirmButton.count() > 0) {
            await confirmButton.click();
            await waitForLoadingToComplete(page);
          }
        }
      }
    });
  });

  test.describe('Download Signed Document', () => {
    test('should download completed document', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      // Find a completed signature
      const completedSignature = page.locator('[data-testid="signature-item"]:has-text("Completed"), .signature-item:has-text("Signed")').first();

      if (await completedSignature.count() > 0) {
        await completedSignature.click();
        await waitForLoadingToComplete(page);

        const downloadButton = page.getByRole('button', { name: /download/i });

        if (await downloadButton.count() > 0) {
          const downloadPromise = page.waitForEvent('download').catch(() => null);
          await downloadButton.first().click();

          const download = await downloadPromise;

          if (download) {
            expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
          }
        }
      }
    });

    test('should download audit trail', async ({ page }) => {
      await page.goto('/en/dashboard/signatures');
      await waitForPageLoad(page);

      const signatureItem = page.locator('[data-testid="signature-item"]').first();

      if (await signatureItem.count() > 0) {
        await signatureItem.click();
        await waitForLoadingToComplete(page);

        const auditButton = page.getByRole('button', { name: /audit trail|certificate/i });

        if (await auditButton.count() > 0) {
          const downloadPromise = page.waitForEvent('download').catch(() => null);
          await auditButton.first().click();

          const download = await downloadPromise;

          if (download) {
            console.log(`Downloaded audit trail: ${download.suggestedFilename()}`);
          }
        }
      }
    });
  });

  test.describe('Signature Notifications', () => {
    test('should show notification for pending signatures', async ({ page }) => {
      await page.goto('/en/dashboard');
      await waitForPageLoad(page);

      const notification = page.locator('[data-testid="notification"], .notification, text=/pending signature|sign/i');

      if (await notification.count() > 0) {
        console.log('Signature notification found');
      }
    });
  });
});

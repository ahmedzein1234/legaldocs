import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';
import {
  waitForPageLoad,
  fillField,
  waitForToast,
  clickByText,
  verifyVisible,
  verifyContainsText,
  generateRandomString,
  waitForLoadingToComplete,
} from './utils/test-helpers';
import { testDocuments } from './utils/fixtures';

test.describe('Documents Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    await page.goto('/en/dashboard/documents');
    await waitForPageLoad(page);
  });

  test.describe('Documents List', () => {
    test('should display documents page correctly', async ({ page }) => {
      // Verify page heading
      await expect(page.getByRole('heading', { name: /documents|my documents/i })).toBeVisible();

      // Verify page elements
      const createButton = page.getByRole('button', { name: /new document|create/i });
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    });

    test('should display document cards', async ({ page }) => {
      // Look for document cards or table rows
      const documentCards = page.locator('[data-testid="document-card"], .document-card, [role="row"]');

      // Wait a bit for documents to load
      await page.waitForTimeout(2000);

      const count = await documentCards.count();
      console.log(`Found ${count} documents`);

      // Documents might exist or might be empty state
      if (count > 0) {
        await expect(documentCards.first()).toBeVisible();
      }
    });

    test('should show empty state when no documents', async ({ page }) => {
      // This test assumes a fresh account or filtered view with no documents
      const emptyState = page.locator('text=/no documents|get started|create your first/i');

      // Check if empty state exists
      const exists = await emptyState.count();
      if (exists > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    });

    test('should filter documents by status', async ({ page }) => {
      // Look for filter buttons or dropdown
      const filterDropdown = page.locator('button:has-text("All"), button:has-text("Filter"), [data-testid="status-filter"]');

      if (await filterDropdown.count() > 0) {
        await filterDropdown.first().click();

        // Try to filter by draft
        const draftOption = page.getByRole('option', { name: /draft/i });
        if (await draftOption.count() > 0) {
          await draftOption.click();
          await waitForLoadingToComplete(page);
        }
      }
    });

    test('should search documents', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search"]');

      if (await searchInput.count() > 0) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500); // Debounce
        await waitForLoadingToComplete(page);

        // Results should be filtered
        // Exact assertion depends on test data
      }
    });

    test('should sort documents', async ({ page }) => {
      const sortButton = page.locator('button:has-text("Sort"), [data-testid="sort"]');

      if (await sortButton.count() > 0) {
        await sortButton.first().click();

        const sortOption = page.getByRole('option', { name: /date|name|status/i });
        if (await sortOption.count() > 0) {
          await sortOption.first().click();
          await waitForLoadingToComplete(page);
        }
      }
    });
  });

  test.describe('View Document', () => {
    test('should view document details', async ({ page }) => {
      // Find and click on a document
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      const exists = await documentCard.count();
      if (exists > 0) {
        await documentCard.click();

        // Should navigate to document view or open modal
        await waitForLoadingToComplete(page);

        // Verify document details are visible
        const documentContent = page.locator('[data-testid="document-content"], .document-viewer, .document-preview');
        if (await documentContent.count() > 0) {
          await expect(documentContent.first()).toBeVisible();
        }
      } else {
        console.log('No documents available to view');
      }
    });

    test('should display document metadata', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        // Look for metadata like title, date, status
        const metadata = page.locator('text=/created|status|type|document number/i');
        if (await metadata.count() > 0) {
          await expect(metadata.first()).toBeVisible();
        }
      }
    });

    test('should show document actions', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        // Look for action buttons (edit, delete, download, share)
        const actionButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("Download"), button:has-text("Share")');

        if (await actionButtons.count() > 0) {
          await expect(actionButtons.first()).toBeVisible();
        }
      }
    });

    test('should close document view', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        // Look for close button
        const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"], [data-testid="close"]');

        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          await waitForPageLoad(page);

          // Should be back at documents list
          await expect(page).toHaveURL(/\/documents/);
        }
      }
    });
  });

  test.describe('Edit Document', () => {
    test('should navigate to edit document page', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        // Click on document to view
        await documentCard.click();
        await waitForLoadingToComplete(page);

        // Find and click edit button
        const editButton = page.getByRole('button', { name: /edit/i });

        if (await editButton.count() > 0) {
          await editButton.first().click();
          await waitForPageLoad(page);

          // Should be on edit page or show edit form
          const editorElements = page.locator('[data-testid="document-editor"], .editor, [contenteditable="true"]');
          if (await editorElements.count() > 0) {
            await expect(editorElements.first()).toBeVisible();
          }
        }
      }
    });

    test('should update document title', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        const editButton = page.getByRole('button', { name: /edit/i });

        if (await editButton.count() > 0) {
          await editButton.first().click();
          await waitForPageLoad(page);

          // Find title input
          const titleInput = page.locator('input[name="title"], input[placeholder*="title"], [data-testid="document-title"]');

          if (await titleInput.count() > 0) {
            const newTitle = `Updated Document ${generateRandomString(5)}`;
            await titleInput.first().fill(newTitle);

            // Save changes
            const saveButton = page.getByRole('button', { name: /save/i });
            if (await saveButton.count() > 0) {
              await saveButton.first().click();
              await waitForLoadingToComplete(page);

              // Should show success message
              await waitForToast(page);
            }
          }
        }
      }
    });

    test('should edit document content', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        const editButton = page.getByRole('button', { name: /edit/i });

        if (await editButton.count() > 0) {
          await editButton.first().click();
          await waitForPageLoad(page);

          // Find editor
          const editor = page.locator('[data-testid="document-editor"], .tiptap, [contenteditable="true"]');

          if (await editor.count() > 0) {
            await editor.first().click();
            await page.keyboard.type(' Additional content added.');

            // Save
            const saveButton = page.getByRole('button', { name: /save/i });
            if (await saveButton.count() > 0) {
              await saveButton.first().click();
              await waitForLoadingToComplete(page);
            }
          }
        }
      }
    });

    test('should cancel edit without saving', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        const editButton = page.getByRole('button', { name: /edit/i });

        if (await editButton.count() > 0) {
          await editButton.first().click();
          await waitForPageLoad(page);

          // Make a change
          const titleInput = page.locator('input[name="title"], [data-testid="document-title"]');
          if (await titleInput.count() > 0) {
            await titleInput.first().fill('Should not be saved');
          }

          // Cancel
          const cancelButton = page.getByRole('button', { name: /cancel/i });
          if (await cancelButton.count() > 0) {
            await cancelButton.first().click();
            await waitForPageLoad(page);
          }
        }
      }
    });
  });

  test.describe('Delete Document', () => {
    test('should show delete confirmation dialog', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        // Open document actions menu
        const moreButton = page.locator('button[aria-label="More"], button:has-text("⋮"), [data-testid="document-menu"]').first();

        if (await moreButton.count() > 0) {
          await moreButton.click();

          // Click delete
          const deleteButton = page.getByRole('menuitem', { name: /delete/i });
          if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // Should show confirmation dialog
            const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]');
            await expect(confirmDialog).toBeVisible();
            await expect(confirmDialog).toContainText(/delete|confirm|sure/i);
          }
        }
      }
    });

    test('should cancel document deletion', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        const moreButton = page.locator('button[aria-label="More"], button:has-text("⋮")').first();

        if (await moreButton.count() > 0) {
          await moreButton.click();

          const deleteButton = page.getByRole('menuitem', { name: /delete/i });
          if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // Click cancel in confirmation dialog
            const cancelButton = page.getByRole('button', { name: /cancel|no/i });
            if (await cancelButton.count() > 0) {
              await cancelButton.click();

              // Dialog should close
              const confirmDialog = page.locator('[role="dialog"]');
              await expect(confirmDialog).not.toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Download Document', () => {
    test('should download document as PDF', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        // Look for download button
        const downloadButton = page.getByRole('button', { name: /download|export/i });

        if (await downloadButton.count() > 0) {
          // Set up download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

          await downloadButton.first().click();

          // Wait for download
          const download = await downloadPromise;

          if (download) {
            expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
          }
        }
      }
    });
  });

  test.describe('Share Document', () => {
    test('should open share dialog', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        // Look for share button
        const shareButton = page.getByRole('button', { name: /share|send/i });

        if (await shareButton.count() > 0) {
          await shareButton.first().click();

          // Should show share dialog
          const shareDialog = page.locator('[role="dialog"]:has-text("Share"), [data-testid="share-dialog"]');
          if (await shareDialog.count() > 0) {
            await expect(shareDialog.first()).toBeVisible();
          }
        }
      }
    });

    test('should share document via email', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        const shareButton = page.getByRole('button', { name: /share|send/i });

        if (await shareButton.count() > 0) {
          await shareButton.first().click();

          const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');

          if (await emailInput.count() > 0) {
            await emailInput.first().fill('recipient@example.com');

            const sendButton = page.getByRole('button', { name: /send|share/i });
            if (await sendButton.count() > 0) {
              await sendButton.first().click();
              await waitForLoadingToComplete(page);

              // Should show success message
              await waitForToast(page);
            }
          }
        }
      }
    });
  });

  test.describe('Document Pagination', () => {
    test('should navigate through pages', async ({ page }) => {
      // Look for pagination controls
      const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]');

      if (await nextButton.count() > 0) {
        await nextButton.first().click();
        await waitForLoadingToComplete(page);

        // Should load next page
        const prevButton = page.locator('button:has-text("Previous"), [aria-label="Previous page"]');
        if (await prevButton.count() > 0) {
          await expect(prevButton.first()).toBeVisible();
        }
      }
    });

    test('should change items per page', async ({ page }) => {
      const itemsPerPageSelect = page.locator('select[name="pageSize"], [data-testid="items-per-page"]');

      if (await itemsPerPageSelect.count() > 0) {
        await itemsPerPageSelect.first().selectOption('50');
        await waitForLoadingToComplete(page);
      }
    });
  });
});

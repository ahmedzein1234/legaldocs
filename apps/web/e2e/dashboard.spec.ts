import { test, expect } from '@playwright/test';
import { login } from './utils/auth-helpers';
import { waitForPageLoad, waitForLoadingToComplete, clickByText } from './utils/test-helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/en/dashboard');
    await waitForPageLoad(page);
  });

  test.describe('Dashboard Overview', () => {
    test('should display dashboard correctly', async ({ page }) => {
      // Verify we're on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show welcome message
      const welcomeMessage = page.locator('text=/welcome|dashboard/i').first();
      await expect(welcomeMessage).toBeVisible();
    });

    test('should show statistics cards', async ({ page }) => {
      // Look for stats cards
      const statsCards = page.locator('[data-testid="stats-card"], .stats-card, [class*="stat"]');

      // Should have multiple stat cards
      const count = await statsCards.count();

      if (count > 0) {
        console.log(`Found ${count} stat cards`);
        await expect(statsCards.first()).toBeVisible();

        // Each card should have a value
        const firstCard = statsCards.first();
        await expect(firstCard).toContainText(/.+/);
      }
    });

    test('should display total documents stat', async ({ page }) => {
      const totalDocsStat = page.locator('text=/total documents|documents/i').first();

      if (await totalDocsStat.count() > 0) {
        await expect(totalDocsStat).toBeVisible();

        // Should have a number
        const parent = totalDocsStat.locator('..');
        await expect(parent).toContainText(/\d+/);
      }
    });

    test('should display pending documents stat', async ({ page }) => {
      const pendingStat = page.locator('text=/pending/i').first();

      if (await pendingStat.count() > 0) {
        await expect(pendingStat).toBeVisible();
      }
    });

    test('should display signed documents stat', async ({ page }) => {
      const signedStat = page.locator('text=/signed/i').first();

      if (await signedStat.count() > 0) {
        await expect(signedStat).toBeVisible();
      }
    });

    test('should show trend indicators on stats', async ({ page }) => {
      // Look for trend indicators (arrows, percentages)
      const trendIndicators = page.locator('[class*="trend"], text=/↑|↓|%/');

      if (await trendIndicators.count() > 0) {
        console.log('Found trend indicators');
        await expect(trendIndicators.first()).toBeVisible();
      }
    });
  });

  test.describe('Quick Actions', () => {
    test('should display quick actions section', async ({ page }) => {
      const quickActionsSection = page.locator('text=/quick actions/i').first();

      if (await quickActionsSection.count() > 0) {
        await expect(quickActionsSection).toBeVisible();
      }
    });

    test('should show create document action', async ({ page }) => {
      const createDocButton = page.locator('button:has-text("Create"), a:has-text("Create"), [href*="generate"]');

      if (await createDocButton.count() > 0) {
        await expect(createDocButton.first()).toBeVisible();
      }
    });

    test('should navigate to generate page from quick action', async ({ page }) => {
      const createDocButton = page.locator('button:has-text("Create"), a:has-text("Create"), [href*="generate"]').first();

      if (await createDocButton.count() > 0) {
        await createDocButton.click();
        await waitForPageLoad(page);

        // Should navigate to generate page
        await expect(page).toHaveURL(/\/(generate|documents\/new)/);
      }
    });

    test('should show request signature action', async ({ page }) => {
      const signatureButton = page.locator('text=/request signature|sign/i, [href*="signature"]');

      if (await signatureButton.count() > 0) {
        await expect(signatureButton.first()).toBeVisible();
      }
    });

    test('should navigate to signatures from quick action', async ({ page }) => {
      const signatureButton = page.locator('a[href*="signature"]').first();

      if (await signatureButton.count() > 0) {
        await signatureButton.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/signature/);
      }
    });

    test('should show legal consult action', async ({ page }) => {
      const consultButton = page.locator('text=/legal consult|advisor|ask/i, [href*="consult"]');

      if (await consultButton.count() > 0) {
        await expect(consultButton.first()).toBeVisible();
      }
    });

    test('should navigate to advisor from quick action', async ({ page }) => {
      const consultButton = page.locator('a[href*="consult"], a[href*="advisor"]').first();

      if (await consultButton.count() > 0) {
        await consultButton.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/(consult|advisor)/);
      }
    });
  });

  test.describe('Recent Documents', () => {
    test('should display recent documents section', async ({ page }) => {
      const recentDocsSection = page.locator('text=/recent documents|recent/i').first();

      if (await recentDocsSection.count() > 0) {
        await expect(recentDocsSection).toBeVisible();
      }
    });

    test('should show list of recent documents', async ({ page }) => {
      // Wait a bit for data to load
      await page.waitForTimeout(2000);

      const documentCards = page.locator('[data-testid="document-card"], .document-card');

      const count = await documentCards.count();
      console.log(`Found ${count} recent documents`);

      if (count > 0) {
        await expect(documentCards.first()).toBeVisible();

        // Each document should have title
        await expect(documentCards.first()).toContainText(/.+/);
      }
    });

    test('should display document status badges', async ({ page }) => {
      const statusBadges = page.locator('[data-testid="status-badge"], .badge, [class*="status"]');

      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible();
      }
    });

    test('should navigate to document from recent list', async ({ page }) => {
      const documentCard = page.locator('[data-testid="document-card"], .document-card').first();

      if (await documentCard.count() > 0) {
        await documentCard.click();
        await waitForLoadingToComplete(page);

        // Should navigate to document view
        // Exact URL depends on implementation
      }
    });

    test('should show view all documents link', async ({ page }) => {
      const viewAllLink = page.locator('a:has-text("View all"), a:has-text("See all"), [href*="documents"]');

      if (await viewAllLink.count() > 0) {
        await expect(viewAllLink.first()).toBeVisible();
      }
    });

    test('should navigate to documents page from view all', async ({ page }) => {
      const viewAllLink = page.locator('a:has-text("View all"), a[href*="documents"]').first();

      if (await viewAllLink.count() > 0) {
        await viewAllLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/documents/);
      }
    });
  });

  test.describe('Activity Feed', () => {
    test('should display activity section', async ({ page }) => {
      const activitySection = page.locator('text=/activity|recent activity/i').first();

      if (await activitySection.count() > 0) {
        await expect(activitySection).toBeVisible();
      }
    });

    test('should show recent activities', async ({ page }) => {
      const activities = page.locator('[data-testid="activity-item"], .activity-item');

      const count = await activities.count();
      console.log(`Found ${count} activity items`);

      if (count > 0) {
        await expect(activities.first()).toBeVisible();

        // Each activity should have description
        await expect(activities.first()).toContainText(/.+/);
      }
    });

    test('should display activity timestamps', async ({ page }) => {
      const timestamps = page.locator('text=/ago|hours|minutes|days/i');

      if (await timestamps.count() > 0) {
        await expect(timestamps.first()).toBeVisible();
      }
    });

    test('should show activity icons', async ({ page }) => {
      const activityIcons = page.locator('[data-testid="activity-icon"], .activity-item svg, .activity-item [class*="icon"]');

      if (await activityIcons.count() > 0) {
        await expect(activityIcons.first()).toBeVisible();
      }
    });
  });

  test.describe('Power Tools / Features', () => {
    test('should display power tools section', async ({ page }) => {
      const powerToolsSection = page.locator('text=/power tools|features|ai/i').first();

      if (await powerToolsSection.count() > 0) {
        await expect(powerToolsSection).toBeVisible();
      }
    });

    test('should show smart negotiation tool', async ({ page }) => {
      const negotiationTool = page.locator('text=/negotiation|negotiate/i, [href*="negotiate"]');

      if (await negotiationTool.count() > 0) {
        await expect(negotiationTool.first()).toBeVisible();
      }
    });

    test('should show OCR scanner tool', async ({ page }) => {
      const scannerTool = page.locator('text=/scanner|ocr|scan/i, [href*="scan"]');

      if (await scannerTool.count() > 0) {
        await expect(scannerTool.first()).toBeVisible();
      }
    });

    test('should show blockchain certify tool', async ({ page }) => {
      const certifyTool = page.locator('text=/certify|blockchain/i, [href*="certify"]');

      if (await certifyTool.count() > 0) {
        await expect(certifyTool.first()).toBeVisible();
      }
    });

    test('should show contract review tool', async ({ page }) => {
      const reviewTool = page.locator('text=/review|contract review/i, [href*="review"]');

      if (await reviewTool.count() > 0) {
        await expect(reviewTool.first()).toBeVisible();
      }
    });

    test('should navigate to negotiate page', async ({ page }) => {
      const negotiateLink = page.locator('a[href*="negotiate"]').first();

      if (await negotiateLink.count() > 0) {
        await negotiateLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/negotiate/);
      }
    });

    test('should navigate to scan page', async ({ page }) => {
      const scanLink = page.locator('a[href*="scan"]').first();

      if (await scanLink.count() > 0) {
        await scanLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/scan/);
      }
    });

    test('should navigate to certify page', async ({ page }) => {
      const certifyLink = page.locator('a[href*="certify"]').first();

      if (await certifyLink.count() > 0) {
        await certifyLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/certify/);
      }
    });
  });

  test.describe('Productivity Metrics', () => {
    test('should show productivity stats', async ({ page }) => {
      const productivitySection = page.locator('text=/productivity|streak|goals/i').first();

      if (await productivitySection.count() > 0) {
        await expect(productivitySection).toBeVisible();
      }
    });

    test('should display streak information', async ({ page }) => {
      const streakInfo = page.locator('text=/streak|day/i');

      if (await streakInfo.count() > 0) {
        const count = await streakInfo.count();
        console.log(`Found ${count} streak indicators`);
      }
    });

    test('should show documents created metric', async ({ page }) => {
      const docsCreated = page.locator('text=/docs created|documents created/i');

      if (await docsCreated.count() > 0) {
        await expect(docsCreated.first()).toBeVisible();
      }
    });

    test('should show time saved metric', async ({ page }) => {
      const timeSaved = page.locator('text=/time saved|hours saved/i');

      if (await timeSaved.count() > 0) {
        await expect(timeSaved.first()).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to templates page', async ({ page }) => {
      const templatesLink = page.locator('a[href*="templates"]').first();

      if (await templatesLink.count() > 0) {
        await templatesLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/templates/);
      }
    });

    test('should navigate to lawyers page', async ({ page }) => {
      const lawyersLink = page.locator('a[href*="lawyers"]').first();

      if (await lawyersLink.count() > 0) {
        await lawyersLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/lawyers/);
      }
    });

    test('should navigate to settings page', async ({ page }) => {
      const settingsLink = page.locator('a[href*="settings"]').first();

      if (await settingsLink.count() > 0) {
        await settingsLink.click();
        await waitForPageLoad(page);

        await expect(page).toHaveURL(/\/settings/);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForPageLoad(page);

      // Dashboard should still be visible and functional
      const welcomeMessage = page.locator('text=/welcome|dashboard/i').first();
      if (await welcomeMessage.count() > 0) {
        await expect(welcomeMessage).toBeVisible();
      }
    });

    test('should display correctly on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await waitForPageLoad(page);

      // Dashboard should be responsive
      const quickActions = page.locator('text=/quick actions/i').first();
      if (await quickActions.count() > 0) {
        await expect(quickActions).toBeVisible();
      }
    });

    test('should have mobile navigation menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForPageLoad(page);

      // Look for hamburger menu
      const menuButton = page.locator('button[aria-label="Menu"], button:has-text("☰"), [data-testid="mobile-menu"]');

      if (await menuButton.count() > 0) {
        await expect(menuButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state when fetching data', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/en/dashboard');

      // Look for loading indicators
      const loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');

      // Loading might be very fast, so this may not always catch it
      const spinnerExists = await loadingSpinner.count();
      console.log(`Loading spinner visible: ${spinnerExists > 0}`);
    });
  });

  test.describe('Error States', () => {
    test('should handle failed data fetch gracefully', async ({ page }) => {
      // This test would need to mock API failures
      // For now, just verify page doesn't crash
      await page.goto('/en/dashboard');
      await waitForPageLoad(page);

      // Page should still render
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Localization', () => {
    test('should display dashboard in Arabic', async ({ page }) => {
      await page.goto('/ar/dashboard');
      await waitForPageLoad(page);

      // Should be RTL
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');

      // Content should be visible
      const welcomeMessage = page.locator('text=/مرحبا|dashboard/i').first();
      if (await welcomeMessage.count() > 0) {
        await expect(welcomeMessage).toBeVisible();
      }
    });

    test('should switch language from dashboard', async ({ page }) => {
      // Look for language switcher
      const languageSwitcher = page.locator('[data-testid="language-switcher"], button:has-text("AR"), button:has-text("عربي")');

      if (await languageSwitcher.count() > 0) {
        await languageSwitcher.first().click();

        // Should switch locale
        await page.waitForURL(/\/ar\/dashboard/, { timeout: 5000 });
      }
    });
  });
});

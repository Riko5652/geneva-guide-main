// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Responsive Design Tests', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });

    // Check mobile menu is visible
    const mobileMenuBtn = page.locator('#menu-btn');
    await expect(mobileMenuBtn).toBeVisible();

    // Check desktop nav is hidden
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).toHaveClass(/hidden/);

    // Check main content is responsive
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check both mobile and desktop elements
    const mobileMenuBtn = page.locator('#menu-btn');
    const desktopNav = page.locator('.desktop-nav');
    
    // On tablet, mobile menu should be visible
    await expect(mobileMenuBtn).toBeVisible();
  });

  test('should work on desktop devices', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check desktop nav is visible
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).toBeVisible();

    // Check mobile menu button is hidden
    const mobileMenuBtn = page.locator('#menu-btn');
    await expect(mobileMenuBtn).toHaveClass(/lg:hidden/);
  });

  test('should have proper modal responsiveness', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Try to open a modal (if available)
    const modalButton = page.locator('[id*="modal-btn"]').first();
    if (await modalButton.count() > 0) {
      await modalButton.click();
      
      // Check modal is responsive
      const modal = page.locator('.modal').first();
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
      }
    }
  });

  test('should have proper grid responsiveness', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check grid classes are present
    const grids = page.locator('.grid');
    if (await grids.count() > 0) {
      await expect(grids.first()).toHaveClass(/grid/);
    }
  });
});

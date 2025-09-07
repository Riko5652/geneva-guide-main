// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('User Agent and Device Detection Tests', () => {
  test('should detect mobile user agent', async ({ page }) => {
    // Set mobile user agent using context
    await page.context().setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });

    // Check if mobile classes are applied
    const body = page.locator('body');
    const bodyClasses = await body.getAttribute('class');
    
    // Should have mobile-related classes
    expect(bodyClasses).toContain('mobile');
  });

  test('should detect desktop user agent', async ({ page }) => {
    // Set desktop user agent using context
    await page.context().setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if desktop classes are applied
    const body = page.locator('body');
    const bodyClasses = await body.getAttribute('class');
    
    // Should have desktop-related classes
    expect(bodyClasses).toContain('desktop');
  });

  test('should detect tablet user agent', async ({ page }) => {
    // Set tablet user agent using context
    await page.context().setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if tablet classes are applied
    const body = page.locator('body');
    const bodyClasses = await body.getAttribute('class');
    
    // Should have tablet-related classes
    expect(bodyClasses).toContain('tablet');
  });

  test('should handle different screen sizes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test different screen sizes
    const screenSizes = [
      { width: 320, height: 568 },   // iPhone 5
      { width: 375, height: 667 },   // iPhone SE
      { width: 414, height: 896 },   // iPhone 11 Pro Max
      { width: 768, height: 1024 },  // iPad
      { width: 1024, height: 768 },  // iPad Landscape
      { width: 1920, height: 1080 }  // Desktop
    ];

    for (const size of screenSizes) {
      await page.setViewportSize(size);
      
      // Check that the page still loads correctly
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
      
      // Check that responsive classes are applied
      const body = page.locator('body');
      const bodyClasses = await body.getAttribute('class');
      expect(bodyClasses).toBeTruthy();
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    const mainContentPortrait = page.locator('#main-content');
    await expect(mainContentPortrait).toBeVisible();

    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    const mainContentLandscape = page.locator('#main-content');
    await expect(mainContentLandscape).toBeVisible();
  });

  test('should handle touch events on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test touch events on buttons - use the test button that's always visible
    const testButton = page.locator('#test-modal-btn');
    if (await testButton.count() > 0) {
      await testButton.click();
      // Button should respond to touch
      await expect(testButton).toBeVisible();
    }
  });
});

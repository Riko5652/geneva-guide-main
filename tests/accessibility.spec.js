// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button[aria-label]');
    const links = page.locator('a[aria-label]');
    
    // Should have some elements with ARIA labels
    const buttonCount = await buttons.count();
    const linkCount = await links.count();
    
    expect(buttonCount + linkCount).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    // Should have at least one h1
    await expect(h1.first()).toBeVisible();
    
    // Should have some h2 elements
    if (await h2.count() > 0) {
      await expect(h2.first()).toBeVisible();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img');
    
    if (await images.count() > 0) {
      const firstImage = images.first();
      const altText = await firstImage.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = page.locator('input');
    
    if (await inputs.count() > 0) {
      const firstInput = inputs.first();
      const inputId = await firstInput.getAttribute('id');
      
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        if (await label.count() > 0) {
          await expect(label).toBeVisible();
        }
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check if high contrast mode styles are available
    const highContrastStyles = await page.evaluate(() => {
      const style = document.querySelector('style');
      return style ? style.textContent.includes('prefers-contrast') : false;
    });
    
    expect(highContrastStyles).toBe(true);
  });

  test('should have proper reduced motion support', async ({ page }) => {
    // Check if reduced motion styles are available
    const reducedMotionStyles = await page.evaluate(() => {
      const style = document.querySelector('style');
      return style ? style.textContent.includes('prefers-reduced-motion') : false;
    });
    
    expect(reducedMotionStyles).toBe(true);
  });

  test('should have proper skip links', async ({ page }) => {
    const skipLinks = page.locator('.skip-link');
    
    if (await skipLinks.count() > 0) {
      const firstSkipLink = skipLinks.first();
      await expect(firstSkipLink).toBeVisible();
    }
  });

  test('should have proper screen reader support', async ({ page }) => {
    const srOnlyElements = page.locator('.sr-only');
    
    if (await srOnlyElements.count() > 0) {
      const firstSrOnly = srOnlyElements.first();
      await expect(firstSrOnly).toBeVisible();
    }
  });

  test('should have proper role attributes', async ({ page }) => {
    // Check for proper role attributes
    const elementsWithRoles = page.locator('[role]');
    
    if (await elementsWithRoles.count() > 0) {
      const firstElement = elementsWithRoles.first();
      const role = await firstElement.getAttribute('role');
      expect(role).toBeTruthy();
    }
  });
});

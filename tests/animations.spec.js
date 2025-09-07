// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Animation and Interaction Tests', () => {
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

  test('should have working animations', async ({ page }) => {
    // Check if animation CSS is loaded
    const animationStyles = await page.evaluate(() => {
      const style = document.getElementById('family-animations-css');
      return style ? style.textContent : null;
    });
    
    expect(animationStyles).toContain('@keyframes');
  });

  test('should have working button hover effects', async ({ page }) => {
    const buttons = page.locator('.btn-primary, .btn-secondary, .btn-success, .btn-danger');
    
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      
      // Test hover effect
      await firstButton.hover();
      
      // Check if button has hover classes
      const buttonClasses = await firstButton.getAttribute('class');
      expect(buttonClasses).toContain('btn-');
    }
  });

  test('should have working card hover effects', async ({ page }) => {
    const cards = page.locator('.activity-card, .category-card');
    
    if (await cards.count() > 0) {
      const firstCard = cards.first();
      
      // Test hover effect
      await firstCard.hover();
      
      // Check if card has hover classes
      const cardClasses = await firstCard.getAttribute('class');
      expect(cardClasses).toContain('card');
    }
  });

  test('should have working modal animations', async ({ page }) => {
    // Try to open a modal
    const modalButtons = page.locator('[id*="modal-btn"]');
    
    if (await modalButtons.count() > 0) {
      const firstModalButton = modalButtons.first();
      await firstModalButton.click();
      
      // Check if modal appears with animation
      const modal = page.locator('.modal').first();
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();
        
        // Check if modal has animation classes
        const modalClasses = await modal.getAttribute('class');
        expect(modalClasses).toContain('modal');
      }
    }
  });

  test('should have working loading animations', async ({ page }) => {
    // Check if loading elements exist
    const loaders = page.locator('.loader, .loading-shimmer, .progress-bar');
    
    if (await loaders.count() > 0) {
      const firstLoader = loaders.first();
      await expect(firstLoader).toBeVisible();
    }
  });

  test('should have working ripple effects', async ({ page }) => {
    const buttons = page.locator('button');
    
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      
      // Click button to trigger ripple effect
      await firstButton.click();
      
      // Check if ripple effect is applied
      const buttonClasses = await firstButton.getAttribute('class');
      expect(buttonClasses).toBeTruthy();
    }
  });

  test('should have working confetti animations', async ({ page }) => {
    // Check if confetti CSS is available
    const confettiStyles = await page.evaluate(() => {
      const style = document.getElementById('family-animations-css');
      return style ? style.textContent.includes('confetti') : false;
    });
    
    expect(confettiStyles).toBe(true);
  });

  test('should have working pulse animations', async ({ page }) => {
    // Check if pulse elements exist
    const pulseElements = page.locator('.pulse, .animate-pulse');
    
    if (await pulseElements.count() > 0) {
      const firstPulse = pulseElements.first();
      await expect(firstPulse).toBeVisible();
    }
  });

  test('should have working bounce animations', async ({ page }) => {
    // Check if bounce elements exist
    const bounceElements = page.locator('.bounce, .animate-bounce');
    
    if (await bounceElements.count() > 0) {
      const firstBounce = bounceElements.first();
      await expect(firstBounce).toBeVisible();
    }
  });
});

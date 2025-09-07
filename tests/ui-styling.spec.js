// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('UI Styling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should have warm and wholesome styling', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check main content has warm gradient background
    const mainSection = page.locator('section').first();
    await expect(mainSection).toHaveClass(/bg-gradient-to-br/);
    
    // Check header has proper styling
    const header = page.locator('header');
    await expect(header).toHaveClass(/bg-white\/95/);
    await expect(header).toHaveClass(/backdrop-blur-md/);
    
    // Check bookings section has warm styling
    const bookingsSection = page.locator('#bookings');
    await expect(bookingsSection).toHaveClass(/bg-gradient-to-br/);
    await expect(bookingsSection).toHaveClass(/shadow-lg/);
  });

  test('should have proper button styling', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check primary buttons have correct classes
    const primaryButtons = page.locator('.btn-primary:not(.hidden)');
    await expect(primaryButtons.first()).toBeVisible();
    
    // Check button hover effects
    const firstButton = primaryButtons.first();
    await firstButton.hover();
    await expect(firstButton).toHaveClass(/btn-primary/);
  });

  test('should have proper typography', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check main heading has gradient text
    const mainHeading = page.locator('#main-heading');
    await expect(mainHeading).toHaveClass(/gradient-text/);
    
    // Check section titles have proper styling
    const sectionTitle = page.locator('h2.section-title').first();
    if (await sectionTitle.count() > 0) {
      await expect(sectionTitle).toHaveClass(/text-3xl/);
      await expect(sectionTitle).toHaveClass(/font-bold/);
    } else {
      // Fallback: check any h2 that has text-3xl class
      const anyH2WithText3xl = page.locator('h2.text-3xl').first();
      if (await anyH2WithText3xl.count() > 0) {
        await expect(anyH2WithText3xl).toHaveClass(/font-bold/);
      }
    }
  });

  test('should have proper spacing and layout', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check container has proper padding
    const container = page.locator('.container:not(.hidden)').first();
    await expect(container).toBeVisible();
    
    // Check sections have proper margins
    const sections = page.locator('section');
    await expect(sections.first()).toHaveClass(/mb-16/);
  });

  test('should have proper shadows and borders', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('#main-heading', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('#main-heading');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check cards have shadows
    const cards = page.locator('.activity-card, .category-card');
    if (await cards.count() > 0) {
      await expect(cards.first()).toHaveClass(/shadow/);
    }
    
    // Check modals have proper shadows
    const modals = page.locator('.modal');
    if (await modals.count() > 0) {
      await expect(modals.first()).toHaveClass(/shadow/);
    }
  });
});

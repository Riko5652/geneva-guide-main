// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('UI Styling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should have clean and professional styling', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('h1');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check header has proper styling (like the Desktop version)
    const header = page.locator('header');
    await expect(header).toHaveClass(/bg-white/);
    await expect(header).toHaveClass(/sticky/);
    await expect(header).toHaveClass(/top-0/);
    
    // Check navigation has proper styling (target the main nav specifically)
    const mainNav = page.locator('nav[role="navigation"]').first();
    await expect(mainNav).toHaveClass(/container/);
    await expect(mainNav).toHaveClass(/mx-auto/);
    
    // Check main content has proper background
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-primary/);
  });

  test('should have proper button styling', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('h1');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check primary buttons have correct classes (like Desktop version)
    const primaryButtons = page.locator('.btn-primary:not(.hidden)');
    if (await primaryButtons.count() > 0) {
      await expect(primaryButtons.first()).toBeVisible();
      
      // Check button has proper styling
      const firstButton = primaryButtons.first();
      await expect(firstButton).toHaveClass(/btn-primary/);
    }
    
    // Check filter buttons exist (like Desktop version)
    const filterButtons = page.locator('.btn-filter');
    if (await filterButtons.count() > 0) {
      await expect(filterButtons.first()).toBeVisible();
    }
  });

  test('should have proper typography', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('h1');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check main heading has proper styling (original expectation)
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toHaveClass(/font-bold/);
    await expect(mainHeading).toHaveClass(/text-gray-800/);
    
    // Check section titles have proper styling
    const sectionTitle = page.locator('h2.section-title').first();
    if (await sectionTitle.count() > 0) {
      await expect(sectionTitle).toHaveClass(/text-3xl/);
      await expect(sectionTitle).toHaveClass(/font-bold/);
    }
    
    // Check accent text styling exists
    const accentText = page.locator('.text-accent').first();
    if (await accentText.count() > 0) {
      await expect(accentText).toHaveClass(/text-accent/);
    }
  });

  test('should have proper spacing and layout', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('h1');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check container has proper padding (like Desktop version)
    const container = page.locator('.container:not(.hidden)').first();
    await expect(container).toBeVisible();
    
    // Check main content has proper structure
    const main = page.locator('main');
    await expect(main).toHaveClass(/container/);
    await expect(main).toHaveClass(/mx-auto/);
    
    // Check sections exist
    const sections = page.locator('section');
    await expect(sections.first()).toBeVisible();
  });

  test('should have proper shadows and borders', async ({ page }) => {
    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle');
    
    // Wait for the actual content to load (not the loading state)
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForFunction(() => {
      const heading = document.querySelector('h1');
      return heading && !heading.textContent.includes('טוען');
    }, { timeout: 10000 });
    
    // Check cards have shadows (like Desktop version)
    const cards = page.locator('.card');
    if (await cards.count() > 0) {
      await expect(cards.first()).toHaveClass(/shadow/);
    }
    
    // Check sections have proper styling
    const sections = page.locator('section');
    if (await sections.count() > 0) {
      const firstSection = sections.first();
      // Check if it has shadow or rounded corners (like Desktop version)
      const hasShadow = await firstSection.evaluate(el => 
        el.classList.contains('shadow-lg') || 
        el.classList.contains('shadow-md') ||
        el.classList.contains('rounded-2xl')
      );
      expect(hasShadow).toBeTruthy();
    }
    
    // Check modals have proper shadows
    const modals = page.locator('.modal');
    if (await modals.count() > 0) {
      await expect(modals.first()).toHaveClass(/shadow/);
    }
  });
});

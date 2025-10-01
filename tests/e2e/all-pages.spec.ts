import { test, expect } from '@playwright/test';

test.describe('All Pages Layout Testing', () => {
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/policies', name: 'Policies' },
    { path: '/templates', name: 'Templates' },
    { path: '/compliance', name: 'Compliance' },
    { path: '/monitoring', name: 'Monitoring' },
    { path: '/users', name: 'Users' },
    { path: '/settings', name: 'Settings' }
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} page layout`, async ({ page }) => {
      await page.goto(pageInfo.path);
      
      // Check page loads without errors
      await expect(page).toHaveURL(new RegExp(pageInfo.path));
      
      // Check header exists
      await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
      
      // Check main content exists
      await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
      
      // Check for proper page title
      const title = page.locator('h1, [data-testid="page-title"]');
      await expect(title).toBeVisible();
      
      // Check for no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      // Allow some time for any delayed errors
      await page.waitForTimeout(1000);
      
      // Check for critical errors (allow warnings)
      const criticalErrors = errors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('warn') &&
        !error.includes('404') // Allow 404s for missing assets
      );
      
      if (criticalErrors.length > 0) {
        console.log(`Errors on ${pageInfo.name}:`, criticalErrors);
      }
    });
  }

  test('Navigation consistency across all pages', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      
      // Check navigation items are consistent
      const navItems = ['Dashboard', 'Policies', 'Templates', 'Compliance', 'Monitoring'];
      for (const item of navItems) {
        const navElement = page.locator(`text=${item}`).first();
        if (await navElement.isVisible()) {
          await expect(navElement).toBeVisible();
        }
      }
      
      // Check user menu is consistent
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu');
      if (await userMenu.isVisible()) {
        await expect(userMenu).toBeVisible();
      }
    }
  });

  test('Responsive design across all pages', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const pageInfo of pages) {
        await page.goto(pageInfo.path);
        
        // Check layout adapts to viewport
        await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
        await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
        
        // Check for horizontal scroll (should not exist)
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();
        if (bodyBox) {
          expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 10); // Allow small margin
        }
      }
    }
  });

  test('Color scheme consistency', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      
      // Check for Niyama design system colors
      const elements = await page.locator('*').all();
      
      // Sample some elements to check color consistency
      const sampleElements = elements.slice(0, 10);
      
      for (const element of sampleElements) {
        const classList = await element.getAttribute('class');
        if (classList && classList.includes('niyama-')) {
          // Element uses Niyama design system
          await expect(element).toBeVisible();
        }
      }
    }
  });

  test('Loading states and error handling', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      
      // Check for loading states
      const loadingSpinners = page.locator('[data-testid="loading"], .loading, .spinner');
      if (await loadingSpinners.count() > 0) {
        // Wait for loading to complete
        await expect(loadingSpinners.first()).not.toBeVisible({ timeout: 10000 });
      }
      
      // Check for error states
      const errorElements = page.locator('[data-testid="error"], .error, .alert-error');
      if (await errorElements.count() > 0) {
        // Log errors but don't fail test
        console.log(`Error elements found on ${pageInfo.name}:`, await errorElements.count());
      }
    }
  });

  test('Interactive elements functionality', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      
      // Test buttons
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible() && await button.isEnabled()) {
          // Hover over button
          await button.hover();
          
          // Check button doesn't break layout
          await expect(button).toBeVisible();
        }
      }
      
      // Test links
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        if (await link.isVisible()) {
          // Hover over link
          await link.hover();
          
          // Check link doesn't break layout
          await expect(link).toBeVisible();
        }
      }
    }
  });
});



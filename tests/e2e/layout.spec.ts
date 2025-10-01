import { test, expect } from '@playwright/test';

test.describe('Layout Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('Header layout and navigation', async ({ page }) => {
    // Check if header exists
    await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
    
    // Check logo/brand
    await expect(page.locator('[data-testid="logo"], .logo, h1')).toBeVisible();
    
    // Check navigation menu
    await expect(page.locator('nav, [data-testid="navigation"]')).toBeVisible();
    
    // Check user menu/profile
    await expect(page.locator('[data-testid="user-menu"], .user-menu')).toBeVisible();
  });

  test('Sidebar layout and functionality', async ({ page }) => {
    // Navigate to a page with sidebar
    await page.goto('/dashboard');
    
    // Check sidebar exists
    await expect(page.locator('[data-testid="sidebar"], .sidebar, nav')).toBeVisible();
    
    // Check sidebar navigation items
    const navItems = ['Dashboard', 'Policies', 'Templates', 'Compliance', 'Monitoring', 'Users'];
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
    
    // Test sidebar collapse/expand (if applicable)
    const toggleButton = page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      // Verify sidebar state change
    }
  });

  test('Main content area layout', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check main content area
    await expect(page.locator('main, [data-testid="main-content"], .main-content')).toBeVisible();
    
    // Check content is not overlapping with sidebar
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar');
    const mainContent = page.locator('main, [data-testid="main-content"]');
    
    if (await sidebar.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      const mainBox = await mainContent.boundingBox();
      
      if (sidebarBox && mainBox) {
        // Main content should start after sidebar
        expect(mainBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width);
      }
    }
  });

  test('Footer layout', async ({ page }) => {
    // Check if footer exists
    const footer = page.locator('footer, [data-testid="footer"]');
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
      
      // Check footer content
      await expect(footer.locator('text=©')).toBeVisible();
    }
  });

  test('Responsive layout - Mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // Check mobile header
    await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
    
    // Check if sidebar is hidden or transformed for mobile
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar');
    if (await sidebar.isVisible()) {
      // Should be collapsible or hidden on mobile
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        // Sidebar should be narrow or hidden
        expect(sidebarBox.width).toBeLessThan(300);
      }
    }
    
    // Check main content takes full width on mobile
    const mainContent = page.locator('main, [data-testid="main-content"]');
    const mainBox = await mainContent.boundingBox();
    if (mainBox) {
      expect(mainBox.width).toBeGreaterThan(300);
    }
  });

  test('Responsive layout - Tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/dashboard');
    
    // Check layout adapts to tablet size
    await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
    await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
  });

  test('Responsive layout - Desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/dashboard');
    
    // Check full desktop layout
    await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"], .sidebar')).toBeVisible();
    await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
  });

  test('Navigation between pages maintains layout', async ({ page }) => {
    const pages = ['/dashboard', '/policies', '/templates', '/compliance', '/monitoring'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Check header is consistent
      await expect(page.locator('header, [data-testid="header"]')).toBeVisible();
      
      // Check sidebar is consistent
      await expect(page.locator('[data-testid="sidebar"], .sidebar')).toBeVisible();
      
      // Check main content area
      await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
    }
  });

  test('Layout accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for proper navigation landmarks
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check for proper focus management
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Layout performance', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for layout shift
    const layoutShift = await page.evaluate(() => {
      return new Promise((resolve) => {
        let maxShift = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              maxShift = Math.max(maxShift, entry.value);
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(maxShift);
        }, 3000);
      });
    });
    
    // Layout shift should be minimal
    expect(layoutShift).toBeLessThan(0.1);
  });
});



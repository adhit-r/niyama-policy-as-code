import { test, expect } from '@playwright/test';

test.describe('UI Audit - Layout and Component Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('Document and verify padding inconsistencies', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/ui-audit-full-page-before.png',
      fullPage: true 
    });

    // Check header padding
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    console.log('Header dimensions:', headerBox);

    // Check sidebar padding
    const sidebar = page.locator('[class*="sidebar"], nav.flex.flex-col');
    const sidebarBox = await sidebar.boundingBox();
    console.log('Sidebar dimensions:', sidebarBox);

    // Check main content padding
    const mainContent = page.locator('main');
    const mainBox = await mainContent.boundingBox();
    console.log('Main content dimensions:', mainBox);

    // Check logo section
    const logo = page.locator('[class*="logo"], h1:has-text("NIYAMA")').first();
    const logoBox = await logo.boundingBox();
    console.log('Logo dimensions:', logoBox);

    // Document the current state
    await page.evaluate(() => {
      const elements = {
        header: document.querySelector('header'),
        sidebar: document.querySelector('[class*="sidebar"], nav'),
        main: document.querySelector('main'),
        logo: document.querySelector('h1')
      };

      const report: any = {};

      Object.entries(elements).forEach(([key, el]) => {
        if (el) {
          const styles = window.getComputedStyle(el);
          report[key] = {
            padding: styles.padding,
            margin: styles.margin,
            width: styles.width,
            height: styles.height,
            overflow: styles.overflow
          };
        }
      });

      console.log('Element Styles Report:', JSON.stringify(report, null, 2));
    });

    expect(header).toBeVisible();
  });

  test('Verify scroll behavior - should be restricted to main content', async ({ page }) => {
    // Check if the entire page is scrollable (it should NOT be)
    const pageScrollHeight = await page.evaluate(() => {
      return {
        bodyScrollHeight: document.body.scrollHeight,
        bodyClientHeight: document.body.clientHeight,
        htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
        bodyOverflow: window.getComputedStyle(document.body).overflow
      };
    });

    console.log('Page scroll info:', pageScrollHeight);

    // Check main content scrollability
    const mainScrollable = await page.locator('main').evaluate((el: HTMLElement) => {
      const styles = window.getComputedStyle(el);
      return {
        overflow: styles.overflow,
        overflowY: styles.overflowY,
        height: styles.height,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        isScrollable: el.scrollHeight > el.clientHeight
      };
    });

    console.log('Main content scroll info:', mainScrollable);

    // The main content should be scrollable, not the body
    expect(mainScrollable.overflowY).toBe('auto');
  });

  test('Verify side navigation functionality', async ({ page }) => {
    // Check all navigation items are visible and clickable
    const navItems = [
      'Dashboard',
      'Policies', 
      'Templates',
      'Monitoring',
      'Analytics',
      'Compliance',
      'Settings'
    ];

    for (const itemText of navItems) {
      const navItem = page.locator(`button:has-text("${itemText}")`).first();
      
      // Check visibility
      await expect(navItem).toBeVisible();
      
      // Check if clickable
      const isEnabled = await navItem.isEnabled();
      console.log(`${itemText} button enabled:`, isEnabled);
      expect(isEnabled).toBe(true);

      // Check hover state
      await navItem.hover();
      await page.waitForTimeout(100);

      // Try clicking
      const currentUrl = page.url();
      await navItem.click();
      await page.waitForTimeout(500);
      const newUrl = page.url();
      console.log(`Clicked ${itemText}: ${currentUrl} -> ${newUrl}`);
    }

    // Take screenshot after navigation tests
    await page.screenshot({ 
      path: 'test-results/ui-audit-navigation-test.png',
      fullPage: true 
    });
  });

  test('Verify profile section layout', async ({ page }) => {
    // Check profile section structure
    const profileSection = page.locator('[class*="UserButton"], button:has([class*="avatar"])').first();
    
    if (await profileSection.isVisible()) {
      const profileBox = await profileSection.boundingBox();
      console.log('Profile section dimensions:', profileBox);

      // Take screenshot of profile area
      await page.screenshot({
        path: 'test-results/ui-audit-profile-section.png',
        clip: profileBox ? {
          x: Math.max(0, profileBox.x - 20),
          y: Math.max(0, profileBox.y - 20),
          width: Math.min(400, profileBox.width + 40),
          height: Math.min(200, profileBox.height + 40)
        } : undefined
      });

      // Check profile section styles
      const profileStyles = await profileSection.evaluate((el: HTMLElement) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          alignItems: styles.alignItems,
          justifyContent: styles.justifyContent,
          padding: styles.padding,
          gap: styles.gap,
          flexDirection: styles.flexDirection
        };
      });

      console.log('Profile section styles:', profileStyles);
    }
  });

  test('Verify logo and site name alignment', async ({ page }) => {
    // Check header logo and title alignment
    const headerLogo = page.locator('header div:has(> div)').first();
    const headerTitle = page.locator('header h1').first();

    if (await headerLogo.isVisible() && await headerTitle.isVisible()) {
      const logoBox = await headerLogo.boundingBox();
      const titleBox = await headerTitle.boundingBox();

      console.log('Header logo position:', logoBox);
      console.log('Header title position:', titleBox);

      // Check vertical alignment
      if (logoBox && titleBox) {
        const logoCenter = logoBox.y + logoBox.height / 2;
        const titleCenter = titleBox.y + titleBox.height / 2;
        const verticalDiff = Math.abs(logoCenter - titleCenter);
        
        console.log('Vertical alignment difference:', verticalDiff);
        console.log('Logo center Y:', logoCenter, 'Title center Y:', titleCenter);
      }
    }

    // Check sidebar logo and title alignment
    const sidebarLogo = page.locator('div.bg-niyama-black').first();
    const sidebarTitle = page.locator('h1:has-text("NIYAMA")').first();

    if (await sidebarLogo.isVisible() && await sidebarTitle.isVisible()) {
      const sidebarLogoBox = await sidebarLogo.boundingBox();
      const sidebarTitleBox = await sidebarTitle.boundingBox();

      console.log('Sidebar logo position:', sidebarLogoBox);
      console.log('Sidebar title position:', sidebarTitleBox);

      // Take screenshot of sidebar logo area
      if (sidebarLogoBox) {
        await page.screenshot({
          path: 'test-results/ui-audit-logo-alignment.png',
          clip: {
            x: 0,
            y: 0,
            width: 300,
            height: Math.min(200, (sidebarTitleBox?.y || 0) + (sidebarTitleBox?.height || 100) + 20)
          }
        });
      }
    }
  });

  test('Comprehensive layout measurements', async ({ page }) => {
    // Get comprehensive measurements
    const measurements = await page.evaluate(() => {
      const getElementInfo = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);

        return {
          selector,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            padding: styles.padding,
            margin: styles.margin,
            display: styles.display,
            flexDirection: styles.flexDirection,
            alignItems: styles.alignItems,
            justifyContent: styles.justifyContent,
            overflow: styles.overflow,
            overflowY: styles.overflowY,
            position: styles.position,
            top: styles.top,
            left: styles.left,
            right: styles.right,
            bottom: styles.bottom
          }
        };
      };

      return {
        body: getElementInfo('body'),
        html: getElementInfo('html'),
        mainContainer: getElementInfo('div.min-h-screen'),
        header: getElementInfo('header'),
        sidebar: getElementInfo('nav'),
        main: getElementInfo('main'),
        headerLogo: getElementInfo('header div.bg-niyama-black'),
        headerTitle: getElementInfo('header h1'),
        sidebarLogo: getElementInfo('nav div.bg-niyama-black'),
        sidebarTitle: getElementInfo('nav h1'),
        profileSection: getElementInfo('[class*="UserButton"]')
      };
    });

    console.log('Comprehensive measurements:', JSON.stringify(measurements, null, 2));

    // Save measurements to file
    await page.evaluate((data) => {
      console.log('=== UI AUDIT REPORT ===');
      console.log(JSON.stringify(data, null, 2));
    }, measurements);
  });

  test('Test responsive behavior at different viewports', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `test-results/ui-audit-${viewport.name.toLowerCase()}.png`,
        fullPage: true
      });

      console.log(`Screenshot taken for ${viewport.name}`);
    }
  });
});


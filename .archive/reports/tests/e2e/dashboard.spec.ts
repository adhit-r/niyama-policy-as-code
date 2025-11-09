import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays dashboard content correctly', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify stats cards are visible
    await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
    
    // Verify quick actions are visible
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    
    // Verify system health section
    await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
  });

  test('stats cards display correct information', async ({ page }) => {
    // Check active policies card
    await expect(page.locator('[data-testid="active-policies-card"]')).toContainText('Active Policies');
    
    // Check violations card
    await expect(page.locator('[data-testid="violations-card"]')).toContainText('Policy Violations');
    
    // Check compliance score card
    await expect(page.locator('[data-testid="compliance-score-card"]')).toContainText('Compliance Score');
    
    // Check evaluations card
    await expect(page.locator('[data-testid="evaluations-card"]')).toContainText('Evaluations Today');
  });

  test('quick actions work correctly', async ({ page }) => {
    // Test create policy action
    await page.click('[data-testid="create-policy-action"]');
    await expect(page).toHaveURL('/policies/new');
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Test view templates action
    await page.click('[data-testid="view-templates-action"]');
    await expect(page).toHaveURL('/templates');
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Test AI assistant action
    await page.click('[data-testid="ai-assistant-action"]');
    // Should open AI assistant modal or navigate to AI page
    await expect(page.locator('[data-testid="ai-assistant-modal"]')).toBeVisible();
  });

  test('refresh button works', async ({ page }) => {
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');
    
    // Verify loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for loading to complete
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/metrics', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Reload page to trigger API call
    await page.reload();
    
    // Verify error state is shown
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    
    // Verify stats cards stack vertically
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4);
    
    // Verify quick actions are accessible
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
  });
});

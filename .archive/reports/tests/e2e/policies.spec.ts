import { test, expect } from '@playwright/test';

test.describe('Policy Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('can view policies list', async ({ page }) => {
    // Navigate to policies page
    await page.click('[data-testid="policies-nav"]');
    await expect(page).toHaveURL('/policies');
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Policies');
    
    // Verify policies table is visible
    await expect(page.locator('[data-testid="policies-table"]')).toBeVisible();
    
    // Verify create policy button
    await expect(page.locator('[data-testid="create-policy-button"]')).toBeVisible();
  });

  test('can create a new policy', async ({ page }) => {
    // Navigate to create policy page
    await page.goto('/policies/new');
    
    // Fill in policy form
    await page.fill('[data-testid="policy-name-input"]', 'Test Policy');
    await page.fill('[data-testid="policy-description-input"]', 'This is a test policy');
    await page.selectOption('[data-testid="policy-category-select"]', 'security');
    await page.selectOption('[data-testid="policy-language-select"]', 'rego');
    
    // Add policy content
    await page.fill('[data-testid="policy-content-textarea"]', `
package niyama

default allow := false

allow {
    input.user.role == "admin"
}
    `);
    
    // Save policy
    await page.click('[data-testid="save-policy-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Policy created successfully');
    
    // Verify redirect to policies list
    await expect(page).toHaveURL('/policies');
  });

  test('can edit existing policy', async ({ page }) => {
    // Navigate to policies list
    await page.goto('/policies');
    
    // Click on first policy edit button
    await page.click('[data-testid="edit-policy-button"]:first-child');
    
    // Verify edit form is loaded
    await expect(page.locator('[data-testid="policy-name-input"]')).toHaveValue('Test Policy');
    
    // Update policy name
    await page.fill('[data-testid="policy-name-input"]', 'Updated Test Policy');
    
    // Save changes
    await page.click('[data-testid="save-policy-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Policy updated successfully');
  });

  test('can test policy with sample input', async ({ page }) => {
    // Navigate to policy editor
    await page.goto('/policies/1/edit');
    
    // Click test policy button
    await page.click('[data-testid="test-policy-button"]');
    
    // Fill in test input
    await page.fill('[data-testid="test-input-textarea"]', JSON.stringify({
      user: { role: "admin" },
      resource: { type: "document" }
    }));
    
    // Run test
    await page.click('[data-testid="run-test-button"]');
    
    // Verify test results
    await expect(page.locator('[data-testid="test-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-decision"]')).toContainText('allow');
  });

  test('can delete policy with confirmation', async ({ page }) => {
    // Navigate to policies list
    await page.goto('/policies');
    
    // Click delete button on first policy
    await page.click('[data-testid="delete-policy-button"]:first-child');
    
    // Verify confirmation modal
    await expect(page.locator('[data-testid="confirm-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-message"]')).toContainText('Are you sure you want to delete this policy?');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Policy deleted successfully');
  });

  test('can search and filter policies', async ({ page }) => {
    // Navigate to policies list
    await page.goto('/policies');
    
    // Search for specific policy
    await page.fill('[data-testid="search-input"]', 'Test Policy');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="policies-table"] tbody tr')).toHaveCount(1);
    
    // Clear search
    await page.fill('[data-testid="search-input"]', '');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify all policies are shown
    await expect(page.locator('[data-testid="policies-table"] tbody tr')).toHaveCount.greaterThan(1);
  });

  test('can view policy details', async ({ page }) => {
    // Navigate to policies list
    await page.goto('/policies');
    
    // Click on first policy name
    await page.click('[data-testid="policy-name-link"]:first-child');
    
    // Verify policy details page
    await expect(page.locator('[data-testid="policy-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="policy-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="policy-metadata"]')).toBeVisible();
  });

  test('handles policy validation errors', async ({ page }) => {
    // Navigate to create policy page
    await page.goto('/policies/new');
    
    // Try to save policy with invalid content
    await page.fill('[data-testid="policy-name-input"]', 'Invalid Policy');
    await page.fill('[data-testid="policy-content-textarea"]', 'invalid rego syntax');
    
    // Save policy
    await page.click('[data-testid="save-policy-button"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Invalid Rego syntax');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Bulk Update Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the grid to load
    await page.waitForSelector('[role="grid"]');
  });

  test('should bulk assign status to multiple suggestions', async ({ page }) => {
    await expect(page.locator('text=MSK Suggestion Board')).toBeVisible();
    await expect(page.locator('text=Total Rows: 13')).toBeVisible();

    // Bulk assign button should be disabled with no selections
    const bulkAssignButton = page.getByRole('button', { name: /bulk update/i });
    await expect(bulkAssignButton).toBeDisabled();

    // Select the first two rows
    const checkboxes = page.locator('[type="checkbox"]');
    await checkboxes.nth(1).check(); 
    await checkboxes.nth(2).check();
    
    // Verify selection count shows "2 selected"
    await expect(page.locator('text=/2 rows selected/i')).toBeVisible();
    
    // Click "Bulk Update" button
    await page.getByRole('button', { name: /bulk update/i }).click();
    
    // Select status from dropdown
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/bulk update status/i)).toBeVisible();
    
    await page.getByLabel(/status/i).click();
    await page.getByRole('option', { name: /in progress/i }).click();
    
    // Verify the confirmation message shows correct count
    await expect(page.locator('text=/change status for 2 selected suggestions/i')).toBeVisible();
    
    // Click confirm button
    await page.getByRole('button', { name: /update/i }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify success notification appears
    await expect(page.locator('text=/successfully updated 2 suggestion/i')).toBeVisible();
    
    // Verify selection is cleared
    await expect(page.locator('text=/2 rows selected/i')).not.toBeVisible();
    
    // Verify the rows now show "In Progress" status
    const firstRowStatus = page
      .locator('[role="row"]')
      .filter({ hasText: 'Fatima Al-Rashid' })
      .locator('text=/in progress/i')
      .first();
    
    await expect(firstRowStatus).toBeVisible();
  });

  test('should handle select all functionality', async ({ page }) => {
    await expect(page.locator('text=MSK Suggestion Board')).toBeVisible();
    await expect(page.locator('text=Total Rows: 13')).toBeVisible();

    // Click "select all" checkbox in header
    const selectAllCheckbox = page.locator('[type="checkbox"]').first();
    await selectAllCheckbox.check();
    
    // Should show all rows selected (adjust number based on your data)
    await expect(page.locator('text=/13 rows selected/i')).toBeVisible();
    
    // Click bulk assign
    await page.getByRole('button', { name: /bulk update/i }).click();
    
    // Modal should show correct count
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should allow cancelling bulk assign', async ({ page }) => {
   await expect(page.locator('text=MSK Suggestion Board')).toBeVisible();
    await expect(page.locator('text=Total Rows: 13')).toBeVisible();    

    // Select a row
    const checkboxes = page.locator('[type="checkbox"]');
    await checkboxes.nth(1).check();
    
    // Open bulk assign modal
    await page.getByRole('button', { name: /bulk update/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Selection should remain
    await expect(page.locator('text=/1 row selected/i')).toBeVisible();
  });
});
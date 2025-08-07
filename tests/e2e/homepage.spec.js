const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('CineAI');
  });

  test('should display search interface', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('AI-Powered Content Identification');
  });

  test('should have all search tabs', async ({ page }) => {
    await expect(page.locator('text=Text Search')).toBeVisible();
    await expect(page.locator('text=Image Upload')).toBeVisible();
    await expect(page.locator('text=Video Clip')).toBeVisible();
    await expect(page.locator('text=Actor Search')).toBeVisible();
  });

  test('should switch between search tabs', async ({ page }) => {
    // Click on Image Upload tab
    await page.click('text=Image Upload');
    await expect(page.locator('text=Upload an image')).toBeVisible();

    // Click on Actor Search tab
    await page.click('text=Actor Search');
    await expect(page.locator('input[placeholder*="actor"]')).toBeVisible();
  });

  test('should open AI settings modal', async ({ page }) => {
    await page.click('text=AI Settings');
    await expect(page.locator('text=AI Configuration')).toBeVisible();
    await expect(page.locator('text=OpenAI GPT-4 Vision')).toBeVisible();
    await expect(page.locator('text=Google Gemini Vision')).toBeVisible();
  });

  test('should perform text search', async ({ page }) => {
    // Fill in search query
    await page.fill('input[placeholder*="Search for movies"]', 'The Matrix');
    
    // Click search button
    await page.click('text=Identify with AI');
    
    // Wait for results (this will use fallback data)
    await expect(page.locator('text=AI Results')).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if elements are still visible and properly arranged
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Text Search')).toBeVisible();
    
    // Check if search tabs wrap properly on mobile
    const searchTabs = page.locator('[role="button"]:has-text("Search")');
    await expect(searchTabs.first()).toBeVisible();
  });
});
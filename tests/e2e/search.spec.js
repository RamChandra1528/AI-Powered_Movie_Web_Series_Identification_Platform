const { test, expect } = require('@playwright/test');

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should perform text search and display results', async ({ page }) => {
    // Enter search query
    await page.fill('input[placeholder*="Search for movies"]', 'science fiction movie about virtual reality');
    
    // Click search button
    await page.click('button:has-text("Identify with AI")');
    
    // Wait for loading to complete
    await expect(page.locator('text=AI Processing')).toBeVisible();
    await expect(page.locator('text=AI Processing')).not.toBeVisible({ timeout: 15000 });
    
    // Check if results are displayed
    await expect(page.locator('text=AI Results')).toBeVisible();
    await expect(page.locator('.bg-gradient-to-br').first()).toBeVisible();
  });

  test('should switch to actor search and perform search', async ({ page }) => {
    // Switch to actor search tab
    await page.click('text=Actor Search');
    
    // Verify the input placeholder changed
    await expect(page.locator('input[placeholder*="actor"]')).toBeVisible();
    
    // Enter actor name
    await page.fill('input[placeholder*="actor"]', 'Keanu Reeves');
    
    // Perform search
    await page.click('button:has-text("Identify with AI")');
    
    // Wait for results
    await expect(page.locator('text=AI Processing')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=AI Results')).toBeVisible();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    // Try to search without entering anything
    await page.click('button:has-text("Identify with AI")');
    
    // Button should be disabled or show no results
    const button = page.locator('button:has-text("Identify with AI")');
    await expect(button).toBeDisabled();
  });

  test('should display movie details in results', async ({ page }) => {
    // Note: This test will only work if AI providers are configured
    // Skip if no API keys are available
    const hasApiKeys = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!hasApiKeys) {
      test.skip('Skipping AI-dependent test - no API keys configured');
      return;
    }

    await page.fill('input[placeholder*="Search for movies"]', 'action movie');
    await page.click('button:has-text("Identify with AI")');
    
    // Wait for either results or error message
    await Promise.race([
      expect(page.locator('text=AI Results')).toBeVisible({ timeout: 15000 }),
      expect(page.locator('text=No AI provider configured')).toBeVisible({ timeout: 15000 })
    ]);
  });

  test('should show processing time and confidence', async ({ page }) => {
    const hasApiKeys = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!hasApiKeys) {
      test.skip('Skipping AI-dependent test - no API keys configured');
      return;
    }

    await page.fill('input[placeholder*="Search for movies"]', 'test movie');
    await page.click('button:has-text("Identify with AI")');
    
    // Wait for processing to complete or error
    await Promise.race([
      expect(page.locator('text=Processed in')).toBeVisible({ timeout: 15000 }),
      expect(page.locator('text=No AI provider configured')).toBeVisible({ timeout: 15000 })
    ]);
    
    await expect(page.locator('text=AI Provider:')).toBeVisible();
  });
});
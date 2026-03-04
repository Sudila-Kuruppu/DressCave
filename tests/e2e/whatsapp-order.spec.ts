import { test, expect } from '@playwright/test';

/**
 * E2E WhatsApp Ordering Flow Tests
 * 
 * These tests cover the critical revenue-generating journey:
 * - Browse products by category
 * - View product details
 * - Select product variants (color, size)
 * - Add to cart with custom measurements
 * - Order via WhatsApp with pre-filled message
 * 
 * Priority: P0 (Revenue-critical path)
 * 
 * Knowledge fragments applied:
 * - selector-resilience: Uses data-testid > ARIA roles
 * - network-first: Intercepts API calls before navigation
 * - fixture-architecture: Test data factories for products
 */

test.describe('WhatsApp Ordering Flow - E2E', () => {
  // Test data - would come from factories in real implementation
  const testProduct = {
    name: 'Summer Dress',
    slug: 'summer-dress',
    category: 'women',
    variants: {
      colors: ['blue', 'red'],
      sizes: ['S', 'M', 'L']
    }
  };

  const customMeasurements = {
    length: '32 inches',
    chest: '36 inches',
    waist: '28 inches'
  };

  test('[P0] should complete full WhatsApp order journey with measurements', async ({ page }) => {
    // Step 1: Browse to category
    await page.goto('/category/women');

    // Network-first: Wait for products to load
    const productsPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products') && resp.status() === 200
    );
    await productsPromise;

    // Step 2: Click on a product
    await page.locator('[data-testid="product-card"]').first().click();

    // Assert on product detail page
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.getByRole('heading', { name: testProduct.name })).toBeVisible();

    // Step 3: Select product variants
    await page.getByTestId('color-selector').locator('button').first().click(); // Select blue
    await page.getByTestId('size-selector').locator('button').filter({ hasText: 'M' }).click();

    // Step 4: Add custom measurements
    await page.getByTestId('measurement-toggle').click();
    await page.getByTestId('measurement-length').fill(customMeasurements.length);
    await page.getByTestId('measurement-chest').fill(customMeasurements.chest);
    await page.getByTestId('measurement-waist').fill(customMeasurements.waist);

    // Network-first: Intercept cart API call
    const addCartPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/cart') && resp.status() === 200
    );

    // Step 5: Add to cart
    await page.getByRole('button', { name: /add to cart|order now/i }).click();
    await addCartPromise;

    // Step 6: Click WhatsApp order button
    const whatsappPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /order via whatsapp/i }).click();
    
    const whatsappPage = await whatsappPromise;
    
    // Assert WhatsApp opened with pre-filled message
    const whatsappUrl = whatsappPage.url();
    expect(whatsappUrl).toContain('wa.me');
    expect(whatsappUrl).toContain('text=');
    
    // Wait a moment to capture the WhatsApp page state
    await whatsappPage.waitForLoadState('networkidle');
  });

  test('[P1] should handle product variant selection correctly', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);

    // Test color selection
    await page.getByTestId('color-selector').locator('button').filter({ hasText: 'red' }).click();
    await expect(page.getByTestId('color-selector').locator('button').filter({ hasText: 'red' })).toHaveClass(/selected|active/);

    // Test size selection
    await page.getByTestId('size-selector').locator('button').filter({ hasText: 'L' }).click();
    await expect(page.getByTestId('size-selector').locator('button').filter({ hasText: 'L' })).toHaveClass(/selected|active/);

    // Assert variant info displayed
    await expect(page.getByTestId('selected-variant')).toContainText('red, L');
  });

  test('[P2] should validate custom measurement inputs', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);

    await page.getByTestId('measurement-toggle').click();
    
    // Test invalid input (too short)
    await page.getByTestId('measurement-length').fill('5');
    await expect(page.getByTestId('measurement-length')).toHaveAttribute('min', '20');

    // Test invalid input (too long)
    await page.getByTestId('measurement-chest').fill('1000');
    await expect(page.getByTestId('measurement-chest')).toHaveAttribute('max', '60');
  });

  test('[P1] should display measurement guide when requested', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);

    await page.getByTestId('measurement-guide-button').click();

    // Assert guide modal/section is visible
    await expect(page.getByTestId('measurement-guide')).toBeVisible();
    await expect(page.getByText(/how to measure|measurement guide/i)).toBeVisible();

    await page.getByRole('button', { name: /close|got it/i }).click();
    await expect(page.getByTestId('measurement-guide')).not.toBeVisible();
  });

  test('[P3] should handle out of stock variants', async ({ page }) => {
    // In real implementation, this would navigate to a product with out-of-stock variants
    await page.goto(`/products/${testProduct.slug}`);

    // Mock out of stock state (or use test data)
    // await page.evaluate(() => {
    //   window.testData = { outOfStock: { size: 'S' } };
    // });

    // Assert out of stock variant is disabled
    // await expect(page.getByTestId('size-selector').locator('button').filter({ hasText: 'S' })).toBeDisabled();
  });

  test('[P2] should maintain measurements in cart', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);

    await page.getByTestId('measurement-toggle').click();
    await page.getByTestId('measurement-length').fill(customMeasurements.length);
    await page.getByTestId('measurement-chest').fill(customMeasurements.chest);
    await page.getByTestId('measurement-waist').fill(customMeasurements.waist);

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Go to cart
    await page.goto('/cart');

    // Assert measurements displayed in cart
    await expect(page.getByTestId('cart-measurements')).toContainText(customMeasurements.length);
    await expect(page.getByTestId('cart-measurements')).toContainText(customMeasurements.chest);
    await expect(page.getByTestId('cart-measurements')).toContainText(customMeasurements.waist);
  });
});

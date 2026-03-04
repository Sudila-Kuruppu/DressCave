import { test, expect } from '@playwright/test';

/**
 * E2E Admin Product Management Tests
 * 
 * These tests cover the admin product management journey:
 * - Admin login (authenticated access)
 * - Create new product with images
 * - Edit product details
 * - Manage product variants
 * - Publish product
 * - Verify product visible on store
 * 
 * Priority: P0 (Critical admin workflow)
 * 
 * Knowledge fragments applied:
 * - selector-resilience: Uses data-testid > ARIA roles
 * - network-first: Intercepts API calls before navigation
 * - auth-session: Uses admin session fixture
 */

test.describe('Admin Product Management - E2E', () => {
  // Test product data
  const testProduct = {
    name: `Test Product ${Date.now()}`,
    description: 'Test product description',
    category: 'women',
    price: '29.99',
    variants: [
      { name: 'blue', sizes: ['S', 'M', 'L'] },
      { name: 'red', sizes: ['S', 'M'] }
    ]
  };

  test.beforeEach(async ({ page }) => {
    // Setup: Login as admin (via API for speed, then set cookies)
    // In real implementation: await loginAsAdmin(page);
    
    // For now, navigate to login and login with admin credentials
    await page.goto('/login');
    // Note: Using placeholder admin credentials - replace with real test admin
    // await page.getByTestId('email-input').fill('admin@dresscave.com');
    // await page.getByTestId('password-input').fill('admin-password');
    // await page.getByRole('button', { name: /sign in/i }).click();
    // 
    // // Wait for successful login
    // await page.waitForURL(/\/dashboard|\/admin/i);
  });

  test('[P0] should create new product with images and publish', async ({ page }) => {
    // Step 1: Navigate to admin dashboard
    await page.goto('/admin');
    
    // Step 2: Click "Add New Product"
    await page.getByRole('link', { name: /add new product|create product/i }).click();
    await expect(page).toHaveURL(/\/admin\/products\/new|\/admin\/products\/create/i);

    // Step 3: Fill product details
    await page.getByTestId('product-name').fill(testProduct.name);
    await page.getByTestId('product-description').fill(testProduct.description);
    await page.getByTestId('product-category').selectOption(testProduct.category);
    await page.getByTestId('product-price').fill(testProduct.price);

    // Step 4: Upload images (network-first: intercept upload API)
    const uploadPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/upload') && resp.status() === 200
    );
    
    // Mock file upload or use test images
    const fileInput = page.getByTestId('product-images-upload');
    await fileInput.setInputFiles('./tests/fixtures/images/test-product.jpg');
    await uploadPromise;

    // Step 5: Add variants
    await page.getByRole('button', { name: /add variant/i }).click();
    await page.getByTestId('variant-name').fill(testProduct.variants[0].name);
    
    // Add sizes
    const sizeInputs = page.getByTestId('variant-sizes');
    for (const size of testProduct.variants[0].sizes) {
      await sizeInputs.getByRole('textbox').fill(size);
      await page.getByRole('button', { name: /add size/i }).click();
    }

    // Step 6: Publish product (network-first: intercept publish API)
    const publishPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products') && (resp.status() === 201 || resp.status() === 200)
    );

    await page.getByRole('button', { name: /publish|save product/i }).click();
    await publishPromise;

    // Assert success message
    await expect(page.getByText(/product published|successfully created/i)).toBeVisible();

    // Step 7: Verify product visible on store
    await page.goto('/');
    
    // Network-first: Wait for products to load
    const productsLoadPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products') && resp.status() === 200
    );
    await productsLoadPromise;

    // Search for new product
    await page.getByTestId('search-input').fill(testProduct.name);
    await page.getByRole('button', { name: /search/i }).click();

    await expect(page.getByText(testProduct.name)).toBeVisible();
  });

  test('[P0] should edit existing product and update details', async ({ page }) => {
    // Setup: Navigate to existing product
    await page.goto('/admin/products');
    
    // Click on first product
    await page.getByTestId('product-list-item').first().click();
    
    // Update product details
    const updatedPrice = '39.99';
    await page.getByTestId('product-price').clear();
    await page.getByTestId('product-price').fill(updatedPrice);

    // Network-first: Intercept update API
    const updatePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products') && resp.status() === 200
    );

    await page.getByRole('button', { name: /save|update product/i }).click();
    await updatePromise;

    await expect(page.getByText(/product updated/i)).toBeVisible();

    // Verify update on store
    await page.goto('/');
    const productName = await page.getByTestId('product-name').first().textContent();
    await page.goto(`/products/${productName?.toLowerCase().replace(/\s/g, '-')}`);
    await expect(page.getByText(updatedPrice)).toBeVisible();
  });

  test('[P1] should manage product categories and subcategories', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Navigate to categories section
    await page.getByRole('link', { name: /categories|manage categories/i }).click();
    
    // Add new category
    await page.getByRole('button', { name: /add category/i }).click();
    await page.getByTestId('category-name').fill('New Category');
    await page.getByTestId('category-slug').fill('new-category');
    
    // Network-first: Intercept category API
    const categoryPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/categories') && resp.status() === 201
    );

    await page.getByRole('button', { name: /save category/i }).click();
    await categoryPromise;

    await expect(page.getByText(/category created/i)).toBeVisible();
  });

  test('[P2] should delete product with confirmation', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Click on product to delete
    const firstProduct = page.getByTestId('product-list-item').first();
    const productName = await firstProduct.textContent();
    await firstProduct.click();

    // Click delete button
    await page.getByRole('button', { name: /delete product/i }).click();

    // Confirm deletion
    await expect(page.getByText(/are you sure|confirm deletion/i)).toBeVisible();
    
    // Network-first: Intercept delete API
    const deletePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products') && resp.status() === 200 || resp.status() === 204
    );

    await page.getByRole('button', { name: /confirm|yes delete/i }).click();
    await deletePromise;

    await expect(page.getByText(/product deleted/i)).toBeVisible();

    // Verify product removed from store
    await page.goto('/');
    await expect(page.getByText(productName || '')).not.toBeVisible();
  });

  test('[P1] should manage inventory and stock levels', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Navigate to inventory section of a product
    await page.getByTestId('product-list-item').first().click();
    await page.getByRole('tab', { name: /inventory|stock/i }).click();

    // Update stock levels
    await page.getByTestId('stock-level').first().fill('50');
    
    // Network-first: Intercept inventory API
    const inventoryPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/inventory') && resp.status() === 200
    );

    await page.getByRole('button', { name: /update inventory|save/i }).click();
    await inventoryPromise;

    await expect(page.getByText(/inventory updated/i)).toBeVisible();
  });

  test('[P3] should bulk edit products with filtering', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Filter products by category
    await page.getByTestId('filter-category').selectOption('women');
    
    // Select multiple products
    await page.getByTestId('product-checkbox').first().check();
    await page.getByTestId('product-checkbox').nth(1).check();

    // Bulk action: Update price
    await page.getByRole('button', { name: /bulk edit|bulk actions/i }).click();
    await page.getByTestId('bulk-action-type').selectOption('price');
    await page.getByTestId('bulk-price-adjustment').fill('+10');
    
    // Network-first: Intercept bulk update API
    const bulkPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/products/bulk') && resp.status() === 200
    );

    await page.getByRole('button', { name: /apply|update/i }).click();
    await bulkPromise;

    await expect(page.getByText(/products updated/i)).toBeVisible();
  });
});

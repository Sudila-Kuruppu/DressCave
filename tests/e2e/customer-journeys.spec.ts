import { test, expect } from '@playwright/test';

/**
 * E2E Customer Journey Tests
 * 
 * These tests cover customer-specific journeys:
 * - Wishlist management
 * - AI Q&A on product pages
 * - Reviews and ratings
 * - Profile management with measurements
 * 
 * Priority: P1 (Core customer features)
 * 
 * Knowledge fragments applied:
 * - selector-resilience: Uses data-testid > ARIA roles
 * - network-first: Intercepts API calls before navigation
 * - fixture-architecture: Customer session fixture
 */

test.describe('Customer Journeys - E2E', () => {
  const testProduct = {
    name: 'Test Product',
    slug: 'test-product'
  };

  test.beforeEach(async ({ page }) => {
    // Setup: Login as customer
    // await loginAsCustomer(page);
    await page.goto('/login');
    // await page.getByTestId('email-input').fill('customer@test.com');
    // await page.getByTestId('password-input').fill('password');
    // await page.getByRole('button', { name: /sign in/i }).click();
  });

  test('[P1] should add product to wishlist and view wishlist', async ({ page }) => {
    // Step 1: Navigate to product page
    await page.goto(`/products/${testProduct.slug}`);
    
    // Step 2: Add to wishlist
    const wishlistPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/wishlist')
    );
    await page.getByRole('button', { name: /add to wishlist|♥/i }).click();
    await wishlistPromise;
    
    // Assert button state changed (filled heart)
    await expect(page.getByRole('button', { name: /remove from wishlist/i })).toBeVisible();
    
    // Step 3: View wishlist
    await page.goto('/wishlist');
    
    // Network-first: Wait for wishlist data
    const wishlistDataPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/wishlist')
    );
    await wishlistDataPromise;
    
    // Assert product is in wishlist
    await expect(page.getByText(testProduct.name)).toBeVisible();
  });

  test('[P1] should ask AI question about product', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);
    
    // Step 1: Open AI Q&A section
    await page.getByRole('button', { name: /ask ai|ai assistant/i }).click();
    
    // Step 2: Type question
    const question = 'What size should I get for a 32 inch waist?';
    await page.getByTestId('ai-question-input').fill(question);
    
    // Step 3: Submit question
    const aiResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/ai') && resp.status() === 200
    );
    await page.getByRole('button', { name: /send|ask/i }).click();
    aiResponsePromise;
    
    // Step 4: Assert AI response displayed
    await expect(page.getByTestId('ai-response')).toBeVisible();
    await expect(page.getByTestId('ai-response')).toContainText(/size/i);
  });

  test('[P2] should submit product review with rating', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);
    
    // Step 1: Scroll to reviews section
    await page.getByRole('heading', { name: /reviews|customer reviews/i }).scrollIntoViewIfNeeded();
    
    // Step 2: Click "Write Review"
    await page.getByRole('button', { name: /write review|add review/i }).click();
    
    // Step 3: Fill review form
    await page.getByTestId('review-rating').locator('button').nth(4).click(); // 5 stars
    await page.getByTestId('review-title').fill('Great product');
    await page.getByTestId('review-text').fill('Really loved this dress. Fits perfectly!');
    
    // Step 4: Submit review
    const reviewPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/reviews') && resp.status() === 201
    );
    await page.getByRole('button', { name: /submit review/i }).click();
    const reviewResponse = await reviewPromise;
    expect(reviewResponse.status()).toBe(201);
    
    // Step 5: Assert review displayed
    await expect(page.getByText('Great product')).toBeVisible();
    await expect(page.locator('[aria-label="5 stars"]')).toBeVisible();
  });

  test('[P1] should manage profile with saved measurements', async ({ page }) => {
    // Step 1: Navigate to profile
    await page.goto('/profile');
    
    // Step 2: Add custom measurements
    await page.getByRole('tab', { name: /measurements|size profile/i }).click();
    
    const measurements = {
      length: '32',
      chest: '36',
      waist: '28',
      hips: '38'
    };
    
    await page.getByTestId('measurement-length').fill(measurements.length);
    await page.getByTestId('measurement-chest').fill(measurements.chest);
    await page.getByTestId('measurement-waist').fill(measurements.waist);
    await page.getByTestId('measurement-hips').fill(measurements.hips);
    
    // Save measurements
    const measurementsPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/measurements') && resp.status() === 200
    );
    await page.getByRole('button', { name: /save measurements/i }).click();
    await measurementsPromise;
    
    await expect(page.getByText(/measurements saved|profile updated/i)).toBeVisible();
    
    // Step 3: Verify measurements persisted
    await page.reload();
    await expect(page.getByTestId('measurement-length')).toHaveValue(measurements.length);
    await expect(page.getByTestId('measurement-chest')).toHaveValue(measurements.chest);
  });

  test('[P2] should filter and sort reviews', async ({ page }) => {
    await page.goto(`/products/${testProduct.slug}`);
    
    await page.getByRole('heading', { name: /reviews/i }).scrollIntoViewIfNeeded();
    
    // Step 1: Filter by rating (5 stars only)
    await page.getByTestId('review-filter-5').click();
    
    // Network-first: Wait for filtered reviews
    const filteredPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/reviews')
    );
    await filteredPromise;
    
    // Step 2: Sort by most recent
    await page.getByTestId('review-sort').selectOption('most-recent');
    
    const sortedPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/reviews')
    );
    await sortedPromise;
    
    // Assert reviews are filtered and sorted
    const reviews = page.getByTestId('review-card');
    const count = await reviews.count();
    expect(count).toBeGreaterThan(0);
  });

  test('[P1] should remove product from wishlist', async ({ page }) => {
    // Setup: Add product to wishlist first
    await page.goto(`/products/${testProduct.slug}`);
    const addPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/wishlist')
    );
    await page.getByRole('button', { name: /add to wishlist/i }).click();
    await addPromise;
    
    // Navigate to wishlist
    await page.goto('/wishlist');
    
    // Remove product
    const removePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/wishlist')
    );
    await page.getByTestId('wishlist-remove-button').click();
    await removePromise;
    
    // Assert product removed
    await expect(page.getByText(testProduct.name)).not.toBeVisible();
  });

  test('[P3] should view order history', async ({ page }) => {
    await page.goto('/profile');
    
    await page.getByRole('tab', { name: /orders|order history/i }).click();
    
    // Network-first: Wait for orders data
    const ordersPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/orders')
    );
    await ordersPromise;
    
    // Assert orders section displayed (may be empty for new account)
    await expect(page.getByTestId('order-history')).toBeVisible();
  });
});

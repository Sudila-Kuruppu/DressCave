/**
 * Network Mock Fixtures
 * 
 * Mock API responses for E2E tests
 * Enables deterministic testing without real backend
 */

import { Page } from '@playwright/test';

/**
 * Mock successful API responses
 */
export const apiResponseMocks = {
  /**
   * Mock product list response
   */
  productsList: (count: number = 10) => ({
    products: Array.from({ length: count }, (_, i) => ({
      id: `prod-${i + 1}`,
      name: `Product ${i + 1}`,
      slug: `product-${i + 1}`,
      price: 29.99 + (i * 10),
      category: i % 2 === 0 ? 'women' : 'men',
      images: [`https://example.com/products/${i + 1}.jpg`]
    })),
    total: count,
    page: 1,
    pageSize: count
  }),
  
  /**
   * Mock single product response
   */
  productDetail: (id: string = 'prod-1') => ({
    product: {
      id,
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test product description',
      price: 29.99,
      category: 'women',
      images: ['https://example.com/products/main.jpg'],
      variants: [
        { id: 'var-1', color: 'blue', size: 'M', stock: 10 },
        { id: 'var-2', color: 'red', size: 'L', stock: 5 }
      ]
    }
  }),
  
  /**
   * Mock category list response
   */
  categoriesList: () => ({
    categories: [
      { id: 'cat-1', name: 'Women', slug: 'women' },
      { id: 'cat-2', name: 'Men', slug: 'men' },
      { id: 'cat-3', name: 'Kids', slug: 'kids' }
    ]
  }),
  
  /**
   * Mock auth signup response
   */
  authSignup: () => ({
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    },
    token: 'test-token-abc123',
    message: 'User created successfully'
  }),
  
  /**
   * Mock auth login response
   */
  authLogin: () => ({
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    },
    token: 'test-token-abc123',
    message: 'Login successful'
  }),
  
  /**
   * Mock wishlist response
   */
  wishlistItems: () => ({
    items: [
      { id: 'wish-1', product_id: 'prod-1', added_at: '2024-01-01' },
      { id: 'wish-2', product_id: 'prod-2', added_at: '2024-01-02' }
    ]
  }),
  
  /**
   * Mock cart response
   */
  cartItems: () => ({
    items: [
      {
        id: 'cart-1',
        product_id: 'prod-1',
        variant_id: 'var-1',
        quantity: 2,
        product: {
          name: 'Product 1',
          price: 29.99,
          images: ['https://example.com/products/1.jpg']
        }
      }
    ],
    total: 59.98
  }),
  
  /**
   * Mock reviews response
   */
  productReviews: () => ({
    reviews: [
      { id: 'rev-1', rating: 5, title: 'Great!', text: 'Love this product' },
      { id: 'rev-2', rating: 4, title: 'Good', text: 'Nice product' }
    ],
    average: 4.5,
    total: 2
  })
};

/**
 * Mock payment success response
 */
export const mockPaymentSuccess = async (page: Page) => {
  await page.route('/api/payment/**', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        transactionId: 'tx-' + Date.now(),
        amount: 99.99,
        currency: 'USD',
        status: 'completed'
      })
    });
  });
};

/**
 * Mock payment failure response
 */
export const mockPaymentFailure = async (page: Page) => {
  await page.route('/api/payment/**', (route) => {
    route.fulfill({
      status: 400,
      body: JSON.stringify({
        success: false,
        error: 'Payment declined',
        code: 'PAYMENT_DECLINED'
      })
    });
  });
};

/**
 * Mock upload success
 */
export const mockUploadSuccess = async (page: Page) => {
  await page.route('/api/upload**', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        url: 'https://res.cloudinary.com/dresscave/test.jpg',
        publicId: 'test-upload',
        secureUrl: 'https://res.cloudinary.com/dresscave/test.jpg'
      })
    });
  });
};

/**
 * Mock upload failure
 */
export const mockUploadFailure = async (page: Page) => {
  await page.route('/api/upload**', (route) => {
    route.fulfill({
      status: 400,
      body: JSON.stringify({
        error: 'Invalid file type',
        code: 'INVALID_FILE_TYPE'
      })
    });
  });
};

/**
 * Mock API response based on URL pattern
 */
export const mockApiResponse = async (page: Page, pattern: string, mockFn: () => any) => {
  await page.route(`**${pattern}**`, (route) => {
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockFn())
    });
  });
};

/**
 * Mock API error response
 */
export const mockApiError = async (page: Page, pattern: string, status: number = 500, error: string = 'Internal Server Error') => {
  await page.route(`**${pattern}**`, (route) => {
    route.fulfill({
      status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error })
    });
  });
};

/**
 * Mock slow API response for testing loading states
 */
export const mockSlowApiResponse = async (page: Page, pattern: string, delay: number = 2000) => {
  await page.route(`**${pattern}**`, async (route) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    route.fulfill({
      status: 200,
      body: JSON.stringify({ data: 'test' })
    });
  });
};

/**
 * Clear all route mocks
 */
export const clearRouteMocks = async (page: Page) => {
  // Playwright routes are automatically cleared when context is closed
  // This is a placeholder for any additional cleanup needed
};

/**
 * Mock multiple endpoints at once
 */
export const mockMultipleEndpoints = async (page: Page, mocks: Array<{ pattern: string, response: any, status?: number }>) => {
  for (const mock of mocks) {
    await page.route(`**${mock.pattern}**`, (route) => {
      route.fulfill({
        status: mock.status || 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mock.response)
      });
    });
  }
};

/**
 * Intercept and log all API requests (for debugging)
 */
export const logApiRequests = async (page: Page) => {
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`API Request: ${request.method()} ${request.url()}`);
      const postData = request.postData();
      if (postData) {
        console.log('Payload:', JSON.parse(postData));
      }
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`API Response: ${response.status()} ${response.url()}`);
      response.json().then(data => console.log('Data:', data)).catch(() => {});
    }
  });
};

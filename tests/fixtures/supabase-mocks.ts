/**
 * Supabase Mock Fixtures
 * 
 * Mock Supabase client for unit tests without real DB connection
 * Provides predictable, controlled responses for testing
 */

import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  gte: vi.fn(() => mockSupabaseClient),
  lte: vi.fn(() => mockSupabaseClient),
  order: vi.fn(() => mockSupabaseClient),
  limit: vi.fn(() => mockSupabaseClient),
  range: vi.fn(() => mockSupabaseClient),
  single: vi.fn(() => mockSupabaseClient),
  maybeSingle: vi.fn(() => mockSupabaseClient),
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn()
  },
  rpc: vi.fn(() => mockSupabaseClient)
};

/**
 * Factory for creating mock product data
 */
export const mockDbProducts = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `prod-${i + 1}`,
    name: `Product ${i + 1}`,
    slug: `product-${i + 1}`,
    description: `Description for product ${i + 1}`,
    price: 29.99 + (i * 10),
    category: i % 2 === 0 ? 'women' : 'men',
    images: [`https://example.com/products/${i + 1}.jpg`],
    created_at: new Date().toISOString()
  }));
};

/**
 * Factory for creating mock category data
 */
export const mockDbCategories = (count = 4) => {
  return [
    { id: 'cat-1', name: 'Women', slug: 'women', description: "Women's fashion" },
    { id: 'cat-2', name: 'Men', slug: 'men', description: "Men's fashion" },
    { id: 'cat-3', name: 'Kids', slug: 'kids', description: "Kids' fashion" },
    { id: 'cat-4', name: 'Accessories', slug: 'accessories', description: 'Fashion accessories' }
  ].slice(0, count);
};

/**
 * Factory for creating mock user data
 */
export const mockDbUsers = (count = 3) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    role: i === 0 ? 'admin' : 'user',
    created_at: new Date().toISOString()
  }));
};

/**
 * Factory for creating mock review data
 */
export const mockDbReviews = (productId: string, count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `review-${i + 1}`,
    product_id: productId,
    user_id: `user-${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    title: `Review ${i + 1}`,
    text: `This is review ${i + 1} for the product.`,
    verified_purchase: Math.random() > 0.5,
    created_at: new Date().toISOString()
  }));
};

/**
 * Factory for creating mock error responses
 */
export const mockErrorResponses = {
  connectionError: {
    error: {
      message: 'Failed to connect to database',
      code: 'CONNECTION_ERROR',
      hint: 'Check your database connection settings'
    },
    data: null,
    count: null,
    status: 500,
    statusText: 'Internal Server Error'
  },
  timeoutError: {
    error: {
      message: 'Query timeout',
      code: 'TIMEOUT_ERROR',
      hint: 'Query exceeded 30 second limit'
    },
    data: null,
    count: null,
    status: 408,
    statusText: 'Request Timeout'
  },
  nullDataError: {
    data: null,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK'
  },
  malformedDataError: {
    data: { invalid: 'data' },
    error: null,
    count: null,
    status: 200,
    statusText: 'OK'
  }
};

/**
 * Console error spy for testing error logging
 */
export const consoleErrorSpy = () => {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
};

/**
 * Test environment configuration
 */
export const testEnvironmentConfig = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
  TEST_MODE: true
};

/**
 * Reset all mocks before each test
 */
export const resetMocks = () => {
  vi.clearAllMocks();
  mockSupabaseClient.from.mockReset();
  mockSupabaseClient.select.mockReset();
  mockSupabaseClient.insert.mockReset();
  mockSupabaseClient.update.mockReset();
  mockSupabaseClient.delete.mockReset();
  mockSupabaseClient.eq.mockReset();
  mockSupabaseClient.single.mockReset();
  mockSupabaseClient.auth.signUp.mockReset();
  mockSupabaseClient.auth.signInWithPassword.mockReset();
  mockSupabaseClient.auth.signOut.mockReset();
  mockSupabaseClient.auth.getSession.mockReset();
};

/**
 * Setup mock responses for successful queries
 */
export const mockSuccessfulQuery = (data: any) => {
  mockSupabaseClient.data = data;
  mockSupabaseClient.error = null;
  mockSupabaseClient.count = data.length || 1;
};

/**
 * Setup mock responses for failed queries
 */
export const mockFailedQuery = (error: any) => {
  mockSupabaseClient.data = null;
  mockSupabaseClient.error = error;
  mockSupabaseClient.count = null;
};

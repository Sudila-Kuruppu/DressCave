/**
 * Authentication Fixtures
 * 
 * Provides authentication setup for API and E2E tests
 * Supports admin, customer, and guest user scenarios
 */

import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Types
type AuthFixtures = {
  authToken: string;
  adminToken: string;
  authenticatedUser: any;
  adminUser: any;
};

/**
 * Auth token fixture for API tests
 * Generates test auth tokens for Supabase client
 */
export const authToken = async ({}, use) => {
  // In production, this would generate real tokens via Supabase Auth
  // For now, return test token
  const token = process.env.TEST_AUTH_TOKEN || 'test-token-abc123';
  await use(token);
};

/**
 * Admin token fixture for admin API tests
 */
export const adminToken = async ({}, use) => {
  const token = process.env.TEST_ADMIN_TOKEN || 'admin-token-xyz789';
  await use(token);
};

/**
 * Authenticated user fixture for E2E tests
 * Logs in a test user and provides the browser context
 */
export const authenticatedUser = async ({ page, request }, use) => {
  // Test user credentials
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Test User'
  };

  // Login via API (faster than UI)
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: testUser.email,
      password: testUser.password
    }
  });

  if (loginResponse.status() === 401) {
    // User doesn't exist, create them first
    await request.post('/api/auth/signup', {
      data: testUser
    });

    // Now login
    await request.post('/api/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
  }

  // Store auth session in browser context
  const { token } = await loginResponse.json();
  await page.evaluate((authToken) => {
    localStorage.setItem('auth_token', authToken);
  }, token);

  await use({ page, user: testUser });
};

/**
 * Admin user fixture for admin E2E tests
 */
export const adminUser = async ({ page, request }, use) => {
  const adminUser = {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@dresscave.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin-password'
  };

  // Login as admin
  const loginResponse = await request.post('/api/auth/login', {
    data: adminUser
  });

  const { token } = await loginResponse.json();
  await page.evaluate((authToken) => {
    localStorage.setItem('auth_token', authToken);
  }, token);

  await use({ page, user: adminUser });
};

/**
 * Create authenticated Supabase client for API tests
 */
export const createAuthenticatedClient = (token: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: {
        getItem: (key) => {
          if (key === 'sb-access-token') return token;
          return null;
        },
        setItem: () => {},
        removeItem: () => {}
      }
    }
  });
};

/**
 * Create admin Supabase client with service role
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Create/guest Supabase client with anon key
 */
export const createAnonClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
  
  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Test Helpers
 * 
 * Utility functions for common test operations
 */

import { expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Wait for API response with URL pattern
 */
export const waitForApiResponse = async (page: Page, urlPattern: string, timeout = 30000) => {
  return page.waitForResponse(
    (response) => response.url().includes(urlPattern) && response.ok(),
    { timeout }
  );
};

/**
 * Wait for API response with status check
 */
export const waitForApiResponseWithStatus = async (page: Page, urlPattern: string, expectedStatus: number, timeout = 30000) => {
  return page.waitForResponse(
    (response) => response.url().includes(urlPattern) && response.status() === expectedStatus,
    { timeout }
  );
};

/**
 * Retry helper for flaky operations
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Poll helper for async operations
 */
export const poll = async <T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  timeout = 10000,
  interval = 500
): Promise<T> => {
  const startTime = Date.now();
  let result: T;
  
  while (Date.now() - startTime < timeout) {
    result = await fn();
    
    if (condition(result)) {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Poll timeout: condition not met within ${timeout}ms`);
};

/**
 * Clean up test data after test
 */
export const cleanupTestData = async (supabase: any, tables: string[] = []) => {
  if (tables.length === 0) return;
  
  for (const table of tables) {
    try {
      // Delete test data with test_ prefix in IDs
      const { error } = await supabase
        .from(table)
        .delete()
        .like('id', 'test-%');
      
      if (error) {
        console.error(`Failed to cleanup ${table}:`, error);
      }
    } catch (error) {
      console.error(`Failed to cleanup ${table}:`, error);
    }
  }
};

/**
 * Helper for common Supabase query patterns
 */
export const queryHelper = {
  /**
   * Paginated query
   */
  paginated: async (supabase: any, table: string, options = {}) => {
    const { page = 1, pageSize = 10, ...filters } = options;
    
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },
  
  /**
   * Filtered query
   */
  filtered: async (supabase: any, table: string, filters: Record<string, any>) => {
    let query = supabase.from(table).select('*');
    
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  },
  
  /**
   * Search query ILIKE case-insensitive
   */
  search: async (supabase: any, table: string, searchTerm: string, columns: string[] = []) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .or(columns.map(col => `${col}.ilike.%${searchTerm}%`).join(','));
    
    if (error) throw error;
    
    return data || [];
  }
};

/**
 * Verify element is visible
 */
export const verifyElementVisible = async (page: Page, selector: string, timeout = 5000) => {
  await expect(page.locator(selector)).toBeVisible({ timeout });
};

/**
 * Verify element is hidden
 */
export const verifyElementHidden = async (page: Page, selector: string, timeout = 5000) => {
  await expect(page.locator(selector)).toBeHidden({ timeout });
};

/**
 * Get text content safely
 */
export const getTextContent = async (page: Page, selector: string): Promise<string> => {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  return await element.textContent() || '';
};

/**
 * Fill form field
 */
export const fillFormField = async (page: Page, selector: string, value: string) => {
  await page.locator(selector).fill(value);
};

/**
 * Click button
 */
export const clickButton = async (page: Page, selector: string | RegExp) => {
  await page.getByRole('button', { name: selector }).click();
};

/**
 * Navigate to URL
 */
export const navigateTo = async (page: Page, url: string) => {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
};

/**
 * Take screenshot on failure
 */
export const captureScreenshot = async (page: Page, testName: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-screenshots/${testName}-${timestamp}.png`,
    fullPage: true
  });
};

/**
 * Clear local storage
 */
export const clearLocalStorage = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.clear();
  });
};

/**
 * Set local storage item
 */
export const setLocalStorageItem = async (page: Page, key: string, value: any) => {
  await page.evaluate(([k, v]) => {
    localStorage.setItem(k, JSON.stringify(v));
  }, [key, value]);
};

/**
 * Get local storage item
 */
export const getLocalStorageItem = async (page: Page, key: string) => {
  return await page.evaluate((k) => {
    const item = localStorage.getItem(k);
    return item ? JSON.parse(item) : null;
  }, key);
};

/**
 * [P1] Integration Tests for Backend Error Handling Patterns
 *
 * Tests error handling patterns across the backend:
 * - Database query error handling
 * - Null data handling
 * - Error logging
 * - Graceful degradation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProducts,
  getProductBySlug,
  getNewArrivals,
} from '@/lib/supabase/products';

describe('Backend Error Handling - Integration Tests', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Spy on console.error to verify error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Database Connection Errors', () => {
    it('[P0] should handle database connection errors gracefully in getProducts', async () => {
      // Arrange
      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockRejectedValue(new Error('Connection refused'));

      // Act
      const result = await getProducts();

      // Assert
      expect(result).toEqual([]);
      // The function should handle the error internally
    });

    it('[P0] should log database errors', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database query failed'),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      await getProducts();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching products:',
        expect.any(Error)
      );
    });

    it('[P1] should handle query timeout errors', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Query timeout'),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      const result = await getProducts();

      // Assert
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Null Data Handling', () => {
    it('[P0] should handle null data response in getProductBySlug', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      const result = await getProductBySlug('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('[P1] should handle undefined fields in mapped data', async () => {
      // Arrange
      const mockProduct: any = {
        id: '1',
        name: 'Product 1',
        slug: 'product-1',
        description: undefined,
        price: 100,
        category_id: undefined,
        is_featured: false,
        is_new_arrival: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockProduct,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      const result = await getProductBySlug('product-1');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.description).toBe(''); // Should default to empty string
    });

    it('[P2] should handle empty data arrays', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      const result = await getProducts();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Error Logging Patterns', () => {
    it('[P1] should include context in error logs for getNewArrivals', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Failed to fetch new arrivals'),
                }),
              }),
            }),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      await getNewArrivals();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching new arrivals:',
        expect.any(Error)
      );
    });

    it('[P2] should not throw errors from data access layer', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act & Assert - should not throw, should return empty array
      const result = await getProducts();
      expect(result).toBeDefined();
    });
  });

  describe('Graceful Degradation', () => {
    it('[P0] should fall back to empty array when all products fail', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Service unavailable'),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      const result = await getProducts();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      // Should be usable as empty array without errors
      result.forEach(() => {
        // Should not throw even though array is empty
      });
    });

    it('[P1] should return partial results when category exists but products fail', async () => {
      // Arrange
      const mockCategory = {
        id: 'cat1',
        name: 'Category 1',
        slug: 'category-1',
        description: 'Test',
        parent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let callCount = 0;
      const mockSingle = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: mockCategory, error: null });
        }
        return Promise.resolve({ data: null, error: new Error('Products failed') });
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: mockSingle,
        }),
      };

      const { getProductsByCategory } = require('@/lib/supabase/products');
      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValueOnce(mockSupabase).mockResolvedValueOnce(mockSupabase);

      // Act
      const result = await getProductsByCategory('category-1');

      // Assert
      expect(result.category).toBeDefined();
      expect(result.category).not.toBeNull();
      expect(result.products).toEqual([]);
    });

    it('[P2] should handle malformed data without crashing', async () => {
      // Arrange
      const malformedProduct: any = {
        id: '1',
        // Missing required fields
        name: undefined,
        price: 'not-a-number', // Wrong type
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: malformedProduct,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act - should not throw
      const result = await getProductBySlug('product-1');

      // Assert - handle gracefully
      // The function should not crash, though result may be null or have issues
      expect(result).toBeDefined();
    });
  });

  describe('Error Context Preservation', () => {
    it('[P2] should preserve original error in logs', async () => {
      // Arrange
      const originalError = new Error('Original database error');
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: originalError,
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      await getProducts();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching products:',
        originalError
      );
    });

    it('[P2] should log meaningful error messages', async () => {
      // Arrange
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Connection timeout'),
          }),
        }),
      };

      const { createClient } = require('@/lib/supabase/server-client');
      createClient.mockResolvedValue(mockSupabase);

      // Act
      await getProducts();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching'),
        expect.any(Error)
      );
    });
  });
});

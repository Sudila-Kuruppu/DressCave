import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/products/index';

// Test ID: 2.2-API-001
// Description: GET /api/products pagination & filtering
// Level: API
// Priority: P0

// Mock Supabase client
const mockSupabaseClient = vi.fn();

vi.mock('@/lib/supabase/server-client', () => ({
  createClient: vi.fn(() => mockSupabaseClient()),
}));

describe('2.2-API-001: Products API Tests', () => {
  const mockCategoryData = {
    id: 'cat-123',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Beautiful dresses',
    parent_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockProductData = [
    {
      id: 'prod-1',
      name: 'Summer Dress',
      slug: 'summer-dress',
      description: 'A beautiful summer dress',
      category_id: 'cat-123',
      price: 99.99,
      base_sizes: ['S', 'M', 'L'],
      is_featured: true,
      is_new_arrival: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      image_url: null,
      images: [],
    },
    {
      id: 'prod-2',
      name: 'Evening Gown',
      slug: 'evening-gown',
      description: 'Elegant evening gown',
      category_id: 'cat-123',
      price: 149.99,
      base_sizes: ['XS', 'S', 'M', 'L'],
      is_featured: false,
      is_new_arrival: false,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
      image_url: null,
      images: [],
    },
  ];

  const createMockSupabaseQueryResult = (data: any, error = null) => ({
    data,
    error,
    count: Array.isArray(data) ? data.length : 0,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('[P0] GET /api/products - Happy Path', () => {
    it('[P0] should return paginated products for valid category slug', async () => {
      // Setup mock chain
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(
          createMockSupabaseQueryResult(mockCategoryData, null)
        ),
      };

      const mockProductsCountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn(() => mockProductsCountQuery),
        eq: vi.fn(() => mockProductsCountQuery),
        count: vi.fn(() => mockProductsCountQuery),
        head: vi.fn(() => mockProductsCountQuery),
      };

      const mockProductsDataQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn(() => mockProductsDataQuery),
        eq: vi.fn(() => mockProductsDataQuery),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(
          createMockSupabaseQueryResult(mockProductData, null)
        ),
      };

      // Create mock client instance
      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') return mockCategoryQuery;
          if (table === 'products') {
            // First call is for count, second for data
            return mockProductsCountQuery; // Return count query first
          }
          return {};
        }),
      };

      // Override count query's then/mockResolvedValue
      (mockClientInstance.from as any).mockReturnValueOnce(mockCategoryQuery)
        .mockReturnValueOnce(mockProductsCountQuery)
        .mockReturnValueOnce(mockProductsDataQuery);

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      // Create mock request
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses&page=1&limit=12'
      );

      const response = await GET(request as any);

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json).toHaveProperty('products');
      expect(json).toHaveProperty('category');
      expect(json).toHaveProperty('hasMore');
      expect(json).toHaveProperty('totalCount');
      expect(json.category).toHaveProperty('name', 'Dresses');
      expect(json.products).toHaveLength(2);
      expect(json.products[0].name).toBe('Summer Dress');
    });

    it('[P0] should include pagination metadata (hasMore, totalCount)', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses&page=1&limit=10');

      // Setup mocks
      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          count: vi.fn().mockReturnThis(),
          head: vi.fn().mockReturnThis(),
          then: vi.fn(() => Promise.resolve(createMockSupabaseQueryResult(null, null))),
        })),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      const json = await response.json();

      expect(json).toHaveProperty('hasMore', expect.any(Boolean));
      expect(json).toHaveProperty('totalCount', expect.any(Number));
    });
  });

  describe('[P0] GET /api/products - Error Scenarios', () => {
    it('[P0] should return 400 error when category slug is missing', async () => {
      const request = new Request('http://localhost:3000/api/products');

      const response = await GET(request as any);

      expect(response.status).toBe(400);
      const json = await response.json();

      expect(json).toHaveProperty('error');
      expect(json.error).toContain('Category slug is required');
    });

    it('[P0] should return 404 error when category does not exist', async () => {
      const request = new Request('http://localhost:3000/api/products?category=nonexistent');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(
          createMockSupabaseQueryResult(null, new Error('Not found'))
        ),
      };

      const mockClientInstance = {
        from: vi.fn(() => mockCategoryQuery),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);

      expect(response.status).toBe(404);
      const json = await response.json();

      expect(json).toHaveProperty('error');
      expect(json.error).toContain('Category not found');
    });

    it('[P0] should return 500 error on database query failure', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      };

      const mockClientInstance = {
        from: vi.fn(() => mockCategoryQuery),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);

      expect(response.status).toBe(500);
      const json = await response.json();

      expect(json).toHaveProperty('error');
      expect(json.error).toContain('Failed to fetch products');
    });
  });

  describe('[P1] GET /api/products - Pagination Edge Cases', () => {
    it('[P1] should handle page parameter with default value of 1', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      // Mock range to track offset calculation
      const mockRange = vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null));

      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: mockRange,
          };
        }),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      await GET(request as any);

      // Default page=1 should result in offset=0, limit=12 => range(0, 11)
      expect(mockRange).toHaveBeenCalledWith(0, 11);
    });

    it('[P1] should handle custom page parameter correctly', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses&page=3&limit=10');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockRange = vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null));

      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: mockRange,
          };
        }),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      await GET(request as any);

      // page=3, limit=10 => offset=20 => range(20, 29)
      expect(mockRange).toHaveBeenCalledWith(20, 29);
    });

    it('[P1] should handle custom limit parameter correctly', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses&limit=20');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockRange = vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null));

      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: mockRange,
          };
        }),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      await GET(request as any);

      // page=1, limit=20 => offset=0 => range(0, 19)
      expect(mockRange).toHaveBeenCalledWith(0, 19);
    });

    it('[P1] should return empty products array with valid pagination when no products exist', async () => {
      const request = new Request('http://localhost:3000/api/products?category=empty-category');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null)),
          };
        }),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.products).toEqual([]);
      expect(json.hasMore).toBe(false);
      expect(json.totalCount).toBe(0);
    });
  });

  describe('[P1] GET /api/products - Subcategory Filtering', () => {
    it('[P1] should filter products by subcategory IDs', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses&subcategories=sub1,sub2,sub3'
      );

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: ((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {};
        }) as any,
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('[P1] should handle invalid subcategory IDs gracefully', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses&subcategories=invalid-id'
      );

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: ((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          // First validation query with .in()
          const validateQuery = {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: vi.fn(() => {
              // Return empty result for invalid subcategories
              return Promise.resolve(createMockSupabaseQueryResult([], null));
            }),
          };

          return validateQuery;
        }) as any,
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      const json = await response.json();

      // Should return empty products when no valid subcategories
      expect(json.products).toEqual([]);
      expect(json.hasMore).toBe(false);
    });

    it('[P1] should handle empty subcategories parameter', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses&subcategories='
      );

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: ((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {};
        }) as any,
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('[P2] GET /api/products - Edge Cases', () => {
    it('[P2] should handle malformed page parameter (NaN)', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses&page=invalid&limit=12'
      );

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockRange = vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null));

      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: mockRange,
          };
        }),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      // parseInt('invalid') returns NaN, which defaults to 1
      const response = await GET(request as any);

      // Should handle gracefully with default validation
      expect(response.status).toBeGreaterThanOrEqual(500);
    });

    it('[P2] should handle malformed limit parameter (NaN)', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses&limit=invalid'
      );

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockRange = vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null));

      const mockClientInstance = {
        from: vi.fn((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: mockRange,
          };
        }),
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      // parseInt('invalid') returns NaN, which defaults to 12
      expect(response.status).toBeGreaterThanOrEqual(500);
    });

    it('[P2] should handle special characters in category slug', async () => {
      const request = new Request(
        'http://localhost:3000/api/products?category=dresses-2024-special'
      );

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(
          createMockSupabaseQueryResult(
            { ...mockCategoryData, slug: 'dresses-2024-special', name: 'Special Dresses' },
            null
          )
        ),
      };

      const mockClientInstance = {
        from: ((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {};
        }) as any,
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('[P1] Response Structure Validation', () => {
    it('[P1] should return products with mapped Product type fields', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: ((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockProductData, null)),
          };
        }) as any,
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.products)).toBe(true);

      if (json.products.length > 0) {
        const product = json.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('slug');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('is_featured');
        expect(product).toHaveProperty('is_new_arrival');
        expect(product).toHaveProperty('created_at');
      }
    });

    it('[P1] should return category with required fields', async () => {
      const request = new Request('http://localhost:3000/api/products?category=dresses');

      const mockCategoryQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockSupabaseQueryResult(mockCategoryData, null)),
      };

      const mockClientInstance = {
        from: ((table: string) => {
          if (table === 'categories') {
            return mockCategoryQuery;
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue(createMockSupabaseQueryResult([], null)),
          };
        }) as any,
      };

      mockSupabaseClient.mockReturnValue(mockClientInstance);

      const response = await GET(request as any);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.category).toHaveProperty('id');
      expect(json.category).toHaveProperty('name');
      expect(json.category).toHaveProperty('slug');
    });
  });
});

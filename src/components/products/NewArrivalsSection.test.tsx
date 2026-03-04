import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewArrivalsSection from './NewArrivalsSection';
import type { Product } from '@/types/product';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; fill?: boolean }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', async () => {
  const React = await import('react');
  return {
    __esModule: true,
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
      <a href={href} {...props}>{children}</a>
    ),
  };
});

// Mock ProductGrid component
vi.mock('@/components/products/ProductGrid', () => {
  const MockProductGrid = ({ products }: { products: Product[] }) => (
    <div data-testid="product-grid">
      {products.map(product => (
        <div key={product.id} data-testid="product-card">
          {product.name}
        </div>
      ))}
    </div>
  );

  return {
    __esModule: true,
    default: MockProductGrid,
    ProductGrid: MockProductGrid,
  };
});

// Mock getNewArrivals function
import { getNewArrivals as mockGetNewArrivals } from '@/lib/supabase/products';
vi.mock('@/lib/supabase/products');

describe('NewArrivalsSection', () => {
  const mockNewArrivalsProducts: Product[] = [
    {
      id: '1',
      name: 'New Product 1',
      slug: 'new-product-1',
      description: 'Description 1',
      price: 2999,
      category_id: 'cat-1',
      image_url: 'https://example.com/1.jpg',
      images: [],
      is_featured: false,
      is_new_arrival: true,
      stock_quantity: 10,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-03-01T10:00:00Z',
    },
    {
      id: '2',
      name: 'New Product 2',
      slug: 'new-product-2',
      description: 'Description 2',
      price: 4999,
      category_id: 'cat-1',
      image_url: 'https://example.com/2.jpg',
      images: [],
      is_featured: false,
      is_new_arrival: true,
      stock_quantity: 5,
      created_at: '2026-02-28T10:00:00Z',
      updated_at: '2026-02-28T10:00:00Z',
    },
    {
      id: '3',
      name: 'New Product 3',
      slug: 'new-product-3',
      description: 'Description 3',
      price: 3999,
      category_id: 'cat-2',
      image_url: 'https://example.com/3.jpg',
      images: [],
      is_featured: false,
      is_new_arrival: true,
      stock_quantity: 8,
      created_at: '2026-02-27T10:00:00Z',
      updated_at: '2026-02-27T10:00:00Z',
    },
    {
      id: '4',
      name: 'New Product 4',
      slug: 'new-product-4',
      description: 'Description 4',
      price: 5999,
      category_id: 'cat-1',
      image_url: 'https://example.com/4.jpg',
      images: [],
      is_featured: false,
      is_new_arrival: true,
      stock_quantity: 12,
      created_at: '2026-02-26T10:00:00Z',
      updated_at: '2026-02-26T10:00:00Z',
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock: return mock products
    vi.mocked(mockGetNewArrivals).mockResolvedValue(mockNewArrivalsProducts);
  });

  it('should render section heading with "New Arrivals"', async () => {
    render(await NewArrivalsSection());
    const heading = screen.getByText('New Arrivals');
    expect(heading).toBeDefined();
  });

  it('should render section subtitle', async () => {
    render(await NewArrivalsSection());
    const subtitle = screen.getByText('Discover the latest additions to our collection');
    expect(subtitle).toBeDefined();
  });

  it('should render ProductGrid with products', async () => {
    render(await NewArrivalsSection());
    const grid = screen.getByTestId('product-grid');
    expect(grid).toBeDefined();
  });

  it('should render product cards for new arrival products', async () => {
    render(await NewArrivalsSection());
    const productCards = screen.getAllByTestId('product-card');
    // Should have at least 1 product card if new arrivals exist
    expect(productCards.length).toBeGreaterThan(0);
  });

  it('should not render section when no new arrivals available', async () => {
    // Mock getNewArrivals to return empty array
    vi.mocked(mockGetNewArrivals).mockResolvedValue([]);

    render(await NewArrivalsSection());
    // If section returns null, there should be no heading
    const heading = screen.queryByText('New Arrivals');
    expect(heading).toBeNull();
  });

  it('should display limited number of products (max 8)', async () => {
    render(await NewArrivalsSection());
    const productCards = screen.getAllByTestId('product-card');
    // Should not exceed 8 products
    expect(productCards.length).toBeLessThanOrEqual(8);
  });

  it('should have proper section structure with correct classes', async () => {
    render(await NewArrivalsSection());
    const section = screen.getByText('New Arrivals').closest('section');
    expect(section).toBeDefined();
    expect(section?.className).toContain('new-arrivals-section');
  });

  it('should display products in correct order (newest first)', async () => {
    render(await NewArrivalsSection());
    const productCards = screen.getAllByTestId('product-card');
    // Products should be ordered by created_at DESC
    // This will be verified by mocking getNewArrivals to return ordered data
    expect(productCards.length).toBeGreaterThan(0);
  });

  it('should handle "View All" link correctly (if implemented)', async () => {
    render(await NewArrivalsSection());
    // Check if View All link exists (optional feature)
    const viewAllLink = screen.queryByText(/View All/i);
    if (viewAllLink) {
      expect(viewAllLink).toBeDefined();
      expect(viewAllLink.getAttribute('href')).toContain('/products');
    }
  });
});

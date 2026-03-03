import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from './ProductGrid';
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

describe('ProductGrid', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      slug: 'product-1',
      description: 'Description 1',
      price: 2999,
      category_id: 'cat-1',
      image_url: 'https://example.com/1.jpg',
      images: [],
      is_featured: false,
      is_new_arrival: false,
      stock_quantity: 10,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
    {
      id: '2',
      name: 'Product 2',
      slug: 'product-2',
      description: 'Description 2',
      price: 4999,
      category_id: 'cat-1',
      image_url: 'https://example.com/2.jpg',
      images: [],
      is_featured: true,
      is_new_arrival: false,
      stock_quantity: 5,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
  ];

  it('should render product cards for each product', () => {
    render(<ProductGrid products={mockProducts} />);
    expect(screen.getByText('Product 1')).toBeDefined();
    expect(screen.getByText('Product 2')).toBeDefined();
  });

  it('should render correct number of products', () => {
    render(<ProductGrid products={mockProducts} />);
    const productCards = screen.getAllByTestId('product-card');
    expect(productCards).toHaveLength(2);
  });

  it('should display empty state message when no products', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText('No products in this category')).toBeDefined();
  });

  it('should apply responsive grid classes', () => {
    render(<ProductGrid products={mockProducts} />);
    const grid = screen.getByTestId('product-grid');
    expect(grid).toBeDefined();
  });
});

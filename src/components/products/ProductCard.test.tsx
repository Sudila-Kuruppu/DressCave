import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';
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

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product description',
    price: 2999, // in cents
    category_id: '123e4567-e89b-12d3-a456-426614174001',
    image_url: 'https://example.com/image.jpg',
    images: ['https://example.com/image.jpg'],
    is_featured: false,
    is_new_arrival: false,
    stock_quantity: 10,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeDefined();
  });

  it('should render product price formatted correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$29.99')).toBeDefined();
  });

  it('should render product image', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByRole('img');
    expect(image).toBeDefined();
    expect(image.getAttribute('alt')).toBe('Test Product');
  });

  it('should show placeholder when image is not available', () => {
    const productWithoutImage = {
      ...mockProduct,
      image_url: null,
      images: [],
    };
    render(<ProductCard product={productWithoutImage} />);
    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toContain('placeholder');
  });

  it('should link to product detail page', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/products/test-product');
  });
});

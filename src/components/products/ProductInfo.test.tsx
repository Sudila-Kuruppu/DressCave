import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductInfo } from './ProductInfo';
import type { Product } from '@/types/product';

describe('ProductInfo', () => {
  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A beautiful test product description',
    price: 2999, // in cents
    compare_at_price: 3999, // in cents
    category_id: '123e4567-e89b-12d3-a456-426614174001',
    image_url: 'https://example.com/image.jpg',
    images: ['https://example.com/image.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Blue', 'Green'],
    is_featured: false,
    is_new_arrival: false,
    stock_quantity: 10,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('should render product name', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeDefined();
  });

  it('should render product description', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('A beautiful test product description')).toBeDefined();
  });

  it('should render current price formatted correctly', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('$29.99')).toBeDefined();
  });

  it('should render original price struck through when compare_at_price exists', () => {
    render(<ProductInfo product={mockProduct} />);
    const originalPrice = screen.getByText('$39.99');
    expect(originalPrice).toBeDefined();
  });

  it('should not render original price when compare_at_price is lower', () => {
    const productWithoutDiscount = {
      ...mockProduct,
      compare_at_price: 1999,
    };
    render(<ProductInfo product={productWithoutDiscount} />);
    expect(screen.queryByText('$19.99')).toBeNull();
  });

  it('should render color options when product has colors', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('Color')).toBeDefined();
    expect(screen.getByText('Red')).toBeDefined();
  });

  it('should render size options when product has sizes', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('Size')).toBeDefined();
    expect(screen.getByText('M')).toBeDefined();
  });

  it('should show in stock when stock_quantity > 0', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('In Stock')).toBeDefined();
  });

  it('should show out of stock when stock_quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock_quantity: 0 };
    render(<ProductInfo product={outOfStockProduct} />);
    expect(screen.getByText('Out of Stock')).toBeDefined();
  });

  it('should not render color selection when product has no colors', () => {
    const productWithoutColors = { ...mockProduct, colors: undefined };
    render(<ProductInfo product={productWithoutColors} />);
    expect(screen.queryByText('Color')).toBeNull();
  });

  it('should not render size selection when product has no sizes', () => {
    const productWithoutSizes = { ...mockProduct, sizes: undefined };
    render(<ProductInfo product={productWithoutSizes} />);
    expect(screen.queryByText('Size')).toBeNull();
  });

  it('should call onColorChange when color is selected', () => {
    const onColorChange = vi.fn();
    render(<ProductInfo product={mockProduct} onColorChange={onColorChange} />);
    
    // Find color buttons by their aria-label
    const colorButtons = screen.getAllByLabelText(/Select /);
    if (colorButtons.length > 0) {
      colorButtons[0].click();
      expect(onColorChange).toHaveBeenCalledWith('Red');
    }
  });

  it('should call onSizeChange when size is selected', () => {
    const onSizeChange = vi.fn();
    render(<ProductInfo product={mockProduct} onSizeChange={onSizeChange} />);
    
    // Find size buttons
    const sizeButtons = screen.getAllByRole('button', { name: 'M' });
    if (sizeButtons.length > 0) {
      sizeButtons[0].click();
      expect(onSizeChange).toHaveBeenCalledWith('M');
    }
  });
});

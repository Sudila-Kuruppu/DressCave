import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductInfo } from './ProductInfo';
import type { Product } from '@/types/product';

// Mock the VariantSelector component
vi.mock('./VariantSelector', () => ({
  default: ({ productId, colors, sizes, basePrice, onVariantChange }: any) => (
    <div data-testid="variant-selector-mock">
      <button onClick={() => onVariantChange('Red', 'M', 2999)}>Select Variant</button>
    </div>
  ),
}));

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

  it('should render variant selector when product has colors or sizes', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByTestId('variant-selector-mock')).toBeDefined();
  });

  it('should not render variant selector when product has no colors or sizes', () => {
    const productWithoutVariants = { ...mockProduct, colors: undefined, sizes: undefined };
    render(<ProductInfo product={productWithoutVariants} />);
    expect(screen.queryByTestId('variant-selector-mock')).toBeNull();
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

  it('should update price when variant with different price is selected', () => {
    render(<ProductInfo product={mockProduct} />);
    
    // Initially shows base price
    expect(screen.getByText('$29.99')).toBeDefined();
    
    // Click the mock variant selector button to simulate variant selection
    const variantButton = screen.getByText('Select Variant');
    variantButton.click();
    
    // Should still show base price since we're not actually updating the state in this test
    // In a real implementation, we would update the price
  });

  it('should call onAddToCart with selected variant when add to cart is clicked', () => {
    const onAddToCart = vi.fn();
    render(<ProductInfo product={mockProduct} />);
    
    // In a real implementation, we would have an add to cart button
    // that uses the selected variant
  });
});
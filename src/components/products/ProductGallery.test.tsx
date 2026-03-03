import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductGallery } from './ProductGallery';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; priority?: boolean }) => (
    <img src={src} alt={alt} data-priority={priority} {...props} />
  ),
}));

describe('ProductGallery', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ];
  const mockProductName = 'Test Product';

  it('should render main image', () => {
    render(<ProductGallery images={mockImages} productName={mockProductName} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].alt).toBe('Test Product - Image 1');
  });

  it('should render thumbnail strip when multiple images', () => {
    render(<ProductGallery images={mockImages} productName={mockProductName} />);
    const thumbnails = screen.getAllByRole('button');
    expect(thumbnails.length).toBe(3);
  });

  it('should update main image when thumbnail is clicked', () => {
    render(<ProductGallery images={mockImages} productName={mockProductName} />);
    
    const thumbnails = screen.getAllByRole('button');
    // Click second thumbnail
    fireEvent.click(thumbnails[1]);
    
    const images = screen.getAllByRole('img');
    expect(images[0].alt).toBe('Test Product - Image 2');
  });

  it('should not render thumbnail strip for single image', () => {
    render(<ProductGallery images={['https://example.com/image1.jpg']} productName={mockProductName} />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('should show placeholder when images array is empty', () => {
    render(<ProductGallery images={[]} productName={mockProductName} />);
    const images = screen.getAllByRole('img');
    expect(images[0].src).toContain('placeholder');
  });

  it('should show placeholder when images is null', () => {
    // @ts-expect-error - testing null case
    render(<ProductGallery images={null} productName={mockProductName} />);
    const images = screen.getAllByRole('img');
    expect(images[0].src).toContain('placeholder');
  });
});

'use client';

import type { Product } from '@/types/product';

// Color mapping for CSS - maps color names to hex values
const colorMap: Record<string, string> = {
  red: '#E74C3C',
  blue: '#3498DB',
  green: '#27AE60',
  yellow: '#F1C40F',
  orange: '#E67E22',
  purple: '#9B59B6',
  pink: '#E91E63',
  black: '#2C3E50',
  white: '#ECF0F1',
  gray: '#95A5A6',
  grey: '#95A5A6',
  navy: '#1A252F',
  coral: '#FF6F61',
  teal: '#4FA1A0',
  beige: '#F5F5DC',
  brown: '#8B4513',
  cream: '#FFFDD0',
  burgundy: '#800020',
  mint: '#98FF98',
  lavender: '#E6E6FA',
};

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#CCCCCC';
}

interface ProductInfoProps {
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  onColorChange?: (color: string) => void;
  onSizeChange?: (size: string) => void;
}

export function ProductInfo({ 
  product, 
  selectedColor, 
  selectedSize,
  onColorChange,
  onSizeChange 
}: ProductInfoProps) {
  // Format price with currency
  const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`;
  
  // Check if we should show discount
  const showDiscount = product.compare_at_price && product.compare_at_price > product.price;
  
  return (
    <div className="product-info" data-testid="product-info">
      <h1 data-testid="product-name">{product.name}</h1>
      
      {/* Price */}
      <div className="price" data-testid="price-container">
        {showDiscount && (
          <span className="original-price" data-testid="original-price">
            {formatPrice(product.compare_at_price!)}
          </span>
        )}
        <span className="current-price" data-testid="current-price">
          {formatPrice(product.price)}
        </span>
      </div>
      
      {/* Description */}
      {product.description && (
        <div className="description" data-testid="description">
          <p>{product.description}</p>
        </div>
      )}
      
      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div className="color-selection" data-testid="color-selection">
          <h3>Color</h3>
          <div className="color-options" data-testid="color-options">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange?.(color)}
                className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: getColorHex(color) }}
                aria-label={`Select ${color}`}
                data-testid={`color-${color}`}
              >
                <span className="color-name">{color}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="size-selection" data-testid="size-selection">
          <h3>Size</h3>
          <div className="size-options" data-testid="size-options">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange?.(size)}
                className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                data-testid={`size-${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Stock Status */}
      <div className="stock-status" data-testid="stock-status">
        {product.stock_quantity > 0 ? (
          <span className="in-stock" data-testid="in-stock">In Stock</span>
        ) : (
          <span className="out-of-stock" data-testid="out-of-stock">Out of Stock</span>
        )}
      </div>

      {/* Placeholder Buttons - To be implemented in Stories 4.1 and 4.3 */}
      <div className="action-buttons" data-testid="action-buttons">
        <button
          className="add-to-cart-btn bg-[#FF6F61] text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#e55a50]"
          disabled
          data-testid="add-to-cart-placeholder"
          title="Coming in Story 4.3: Add to Cart"
        >
          Add to Cart (Coming Soon)
        </button>
        <button
          className="wishlist-btn border-2 border-[#FF6F61] text-[#FF6F61] px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#FF6F61] hover:text-white"
          disabled
          data-testid="wishlist-placeholder"
          title="Coming in Story 4.1: Add to Wishlist"
        >
          ♥ Wishlist (Coming Soon)
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;

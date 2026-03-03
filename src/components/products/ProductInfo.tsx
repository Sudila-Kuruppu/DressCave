'use client';

import { useState } from 'react';
import type { Product } from '@/types/product';
import VariantSelector from './VariantSelector';

interface ProductInfoProps {
  product: Product;
  onAddToCart?: (selectedColor: string, selectedSize: string) => void;
  onAddToWishlist?: (selectedColor: string, selectedSize: string) => void;
}

export function ProductInfo({ 
  product,
  onAddToCart,
  onAddToWishlist
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(product.price);

  // Format price with currency
  const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`;
  
  // Check if we should show discount
  const showDiscount = product.compare_at_price && product.compare_at_price > product.price;

  // Handle variant change from VariantSelector
  const handleVariantChange = (color: string, size: string, price: number) => {
    setSelectedColor(color);
    setSelectedSize(size);
    setCurrentPrice(price);
  };
  
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
          {formatPrice(currentPrice)}
        </span>
      </div>
      
      {/* Description */}
      {product.description && (
        <div className="description" data-testid="description">
          <p>{product.description}</p>
        </div>
      )}
      
      {/* Variant Selector */}
      {(product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0) ? (
        <VariantSelector
          productId={product.id}
          colors={product.colors || []}
          sizes={product.sizes || []}
          basePrice={product.price}
          onVariantChange={handleVariantChange}
        />
      ) : null}
      
      {/* Stock Status */}
      <div className="stock-status" data-testid="stock-status">
        {product.stock_quantity > 0 ? (
          <span className="in-stock" data-testid="in-stock">In Stock</span>
        ) : (
          <span className="out-of-stock" data-testid="out-of-stock">Out of Stock</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons" data-testid="action-buttons">
        <button
          className="add-to-cart-btn bg-[#FF6F61] text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#e55a50]"
          disabled={!selectedColor || !selectedSize}
          data-testid="add-to-cart"
          onClick={() => {
            if (selectedColor && selectedSize) {
              onAddToCart?.(selectedColor, selectedSize);
            }
          }}
        >
          Add to Cart
        </button>
        <button
          className="wishlist-btn border-2 border-[#FF6F61] text-[#FF6F61] px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#FF6F61] hover:text-white"
          disabled={!selectedColor || !selectedSize}
          data-testid="add-to-wishlist"
          onClick={() => {
            if (selectedColor && selectedSize) {
              onAddToWishlist?.(selectedColor, selectedSize);
            }
          }}
        >
          ♥ Wishlist
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;
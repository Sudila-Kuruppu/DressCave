'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  price: number | null;
  stock_quantity: number;
}

interface VariantSelectorProps {
  productId: string;
  colors: string[];
  sizes: string[];
  basePrice: number;
  onVariantChange?: (selectedColor: string, selectedSize: string, variantPrice: number) => void;
}

export default function VariantSelector({
  productId,
  colors,
  sizes,
  basePrice,
  onVariantChange
}: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all variants for this product on mount
  useEffect(() => {
    async function fetchVariants() {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);
      
      if (!error && data) {
        setVariants(data);
      }
      setLoading(false);
    }
    fetchVariants();
  }, [productId]);

  // Check if specific combination is available
  const isCombinationAvailable = (color: string, size: string): boolean => {
    const variant = variants.find(v => v.color === color && v.size === size);
    return variant ? variant.stock_quantity > 0 : false;
  };

  // Get variant-specific price
  const getVariantPrice = (color: string, size: string): number => {
    const variant = variants.find(v => v.color === color && v.size === size);
    return variant?.price ?? basePrice;
  };

  // Handle color selection
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedSize) {
      const price = getVariantPrice(color, selectedSize);
      onVariantChange?.(color, selectedSize, price);
    }
  };

  // Handle size selection
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (selectedColor) {
      const price = getVariantPrice(selectedColor, size);
      onVariantChange?.(selectedColor, size, price);
    }
  };

  // Determine if current combination is available
  const isCurrentCombinationAvailable = selectedColor && selectedSize
    ? isCombinationAvailable(selectedColor, selectedSize)
    : true;

  // Color mapping for CSS - maps color names to hex values
  const colorMap: Record<string, string> = {
    'red': '#E74C3C',
    'blue': '#3498DB',
    'green': '#27AE60',
    'black': '#2C3E50',
    'white': '#ECF0F1',
    'yellow': '#F1C40F',
    'orange': '#E67E22',
    'purple': '#9B59B6',
    'pink': '#E91E63',
    'gray': '#95A5A6',
    'grey': '#95A5A6',
    'navy': '#1A252F',
    'beige': '#F5F5DC',
    'brown': '#795548',
    'coral': '#FF6F61',
    'teal': '#008080',
  };

  // Helper function to map color names to hex values
  function getColorHex(colorName: string): string {
    return colorMap[colorName.toLowerCase()] || colorName.toLowerCase();
  }

  if (loading) {
    return <div>Loading variants...</div>;
  }

  return (
    <div className="variant-selector">
      {/* Color Selection */}
      <div className="color-selection">
        <h3>Color</h3>
        <div className="color-options">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: getColorHex(color) }}
              aria-label={`Select ${color}`}
              title={color}
              data-testid={`color-${color}`}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="size-selection">
        <h3>Size</h3>
        <div className="size-options">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`size-button ${selectedSize === size ? 'selected' : ''}`}
              disabled={!!(selectedColor && !isCombinationAvailable(selectedColor, size))}
              data-testid={`size-${size}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Unavailable Combination Message */}
      {!isCurrentCombinationAvailable && (
        <div className="unavailable-message text-red-500 mt-2">
          This combination is not available. Please select different options.
        </div>
      )}
    </div>
  );
}
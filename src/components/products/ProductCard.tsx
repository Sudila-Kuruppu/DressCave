'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import LoginPrompt from '@/components/auth/LoginPrompt';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const imageUrl = product.image_url || product.images?.[0] || '/images/placeholder.png';
  const formattedPrice = (product.price / 100).toFixed(2);

  const handleAddToWishlist = () => {
    setShowLoginPrompt(true);
  };

  const handleAddToCart = () => {
    setShowLoginPrompt(true);
  };

  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        className="product-card group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg"
        data-testid="product-card"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="truncate text-base font-medium text-gray-900">
            {product.name}
          </h3>
          <p className="mt-1 text-lg font-semibold text-[#FF6F61]">
            ${formattedPrice}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddToWishlist();
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              ♥ Wishlist
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="flex-1 px-3 py-2 text-sm bg-[#FF6F61] text-white rounded hover:bg-[#E55A4D] transition-colors"
            >
              + Cart
            </button>
          </div>
        </div>
      </Link>

      {showLoginPrompt && (
        <LoginPrompt
          message="Sign in to save items to your wishlist and cart"
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </>
  );
}

export default ProductCard;

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[] | null;
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Handle empty images array or null
  const displayImages = (images && images.length > 0) 
    ? images 
    : ['/images/placeholder.png'];
  
  return (
    <div className="product-gallery" data-testid="product-gallery">
      {/* Main Image */}
      <div className="main-image-container" data-testid="main-image-container">
        <Image
          src={displayImages[selectedIndex]}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          width={600}
          height={800}
          priority
          className="main-image"
          data-testid="main-image"
        />
      </div>
      
      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="thumbnail-strip" data-testid="thumbnail-strip">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`thumbnail ${index === selectedIndex ? 'selected' : ''}`}
              aria-label={`View image ${index + 1}`}
              data-testid={`thumbnail-${index}`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                width={80}
                height={100}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;

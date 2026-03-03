'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Product detail page error:', error);
  }, [error]);

  return (
    <main className="product-detail-page">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'Failed to load product details'}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-[#FF6F61] text-white rounded-lg hover:bg-[#e55a50] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}

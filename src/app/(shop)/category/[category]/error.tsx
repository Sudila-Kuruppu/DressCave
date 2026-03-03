'use client';

import { useEffect } from 'react';

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Category page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the products for this category.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[#FF6F61] text-white rounded-lg hover:bg-[#e55a4f] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';
import { useInView } from 'framer-motion';
import type { Product, Category } from '@/types/product';
import { ProductGrid } from './ProductGrid';

interface CategoryProductsClientProps {
  initialProducts: Product[];
  initialCategory: Category;
  hasMore: boolean;
  totalCount: number;
}

export function CategoryProductsClient({
  initialProducts,
  initialCategory,
  hasMore: initialHasMore,
  totalCount,
}: CategoryProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef, { margin: '100px' });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      const response = await fetch(
        `/api/products?category=${initialCategory.slug}&page=${nextPage}&limit=12`
      );
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts(prev => [...prev, ...data.products]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, initialCategory.slug]);

  // Trigger load more when scrolled into view
  if (isInView && hasMore && !loading) {
    loadMore();
  }

  return (
    <div>
      <ProductGrid products={products} />
      
      {/* Load more trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="mt-8 flex justify-center py-4"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#FF6F61]" />
              <span>Loading more products...</span>
            </div>
          ) : (
            <span className="text-gray-400">Scroll for more</span>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && products.length > 0 && (
        <p className="mt-8 text-center text-gray-500">
          Showing all {totalCount} products
        </p>
      )}
    </div>
  );
}

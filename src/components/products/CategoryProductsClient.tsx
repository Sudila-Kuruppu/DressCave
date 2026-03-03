'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import type { Product, Category } from '@/types/product';
import { ProductGrid } from './ProductGrid';
import { FilterPanel } from './FilterPanel';
import { ActiveFilterDisplay } from './ActiveFilterDisplay';

interface CategoryProductsClientProps {
  initialProducts: Product[];
  initialCategory: Category;
  categoryId: string; // Added for FilterPanel
  hasMore: boolean;
  totalCount: number;
}

export function CategoryProductsClient({
  initialProducts,
  initialCategory,
  categoryId,
  hasMore: initialHasMore,
  totalCount: initialTotalCount,
}: CategoryProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef, { margin: '100px' });

  // Filter state
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  const [subcategoryDetails, setSubcategoryDetails] = useState<Category[]>([]);

  // Fetch subcategory details when active filters change
  useEffect(() => {
    async function fetchSubcategoryDetails() {
      if (activeSubcategories.length === 0) {
        setSubcategoryDetails([]);
        return;
      }

      const { data } = await supabase
        .from('categories')
        .select('*')
        .in('id', activeSubcategories);

      if (data) {
        const mappedCategories: Category[] = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          parent_id: cat.parent_id,
          image_url: null,
          display_order: 0,
        }));
        setSubcategoryDetails(mappedCategories);
      }
    }
    fetchSubcategoryDetails();
  }, [activeSubcategories]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      // Build URL with subcategory filters if active
      const subcategoryParam = activeSubcategories.length > 0
        ? `&subcategories=${activeSubcategories.join(',')}`
        : '';

      const response = await fetch(
        `/api/products?category=${initialCategory.slug}&page=${nextPage}&limit=12${subcategoryParam}`
      );
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts(prev => [...prev, ...data.products]);
        setHasMore(data.hasMore);
        setPage(nextPage);
        if (data.totalCount !== undefined) {
          setTotalCount(data.totalCount);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, initialCategory.slug, activeSubcategories, totalCount]);

  // Trigger load more when scrolled into view
  useEffect(() => {
    if (isInView && hasMore && !loading) {
      loadMore();
    }
  }, [isInView, hasMore, loading, loadMore]);

  // Handle filter change
  const handleFilterChange = useCallback(async (subcategoryIds: string[]) => {
    setActiveSubcategories(subcategoryIds);

    // Reset to first page when filters change
    setPage(1);
    setLoading(true);

    try {
      const subcategoryParam = subcategoryIds.length > 0
        ? `&subcategories=${subcategoryIds.join(',')}`
        : '';

      const response = await fetch(
        `/api/products?category=${initialCategory.slug}&page=1&limit=12${subcategoryParam}`
      );
      const data = await response.json();

      setProducts(data.products || []);
      setHasMore(data.hasMore);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      setProducts([]);
      setHasMore(false);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [initialCategory.slug]);

  // Handle remove individual filter
  const handleRemoveFilter = (subcategoryId: string) => {
    const newFilters = activeSubcategories.filter(id => id !== subcategoryId);
    handleFilterChange(newFilters);
  };

  // Handle clear all filters
  const handleClearAll = () => {
    handleFilterChange([]);
  };

  return (
    <div>
      {/* Filters section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <FilterPanel
            categoryId={initialCategory.id}
            activeSubcategories={activeSubcategories}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Active filters display */}
        <ActiveFilterDisplay
          activeSubcategories={subcategoryDetails}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Product grid */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#FF6F61]" />
            <span>Loading products...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your filters.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      {/* Load more trigger */}
      {hasMore && !loading && products.length > 0 && (
        <div
          ref={loadMoreRef}
          className="mt-8 flex justify-center py-4"
        >
          <span className="text-gray-400">Scroll for more</span>
        </div>
      )}

      {/* Loading indicator for load more */}
      {loading && products.length > 0 && (
        <div className="mt-8 flex justify-center py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#FF6F61]" />
            <span>Loading more products...</span>
          </div>
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

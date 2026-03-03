'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Category } from '@/types/product';

export interface FilterPanelProps {
  categoryId: string;
  activeSubcategories?: string[];
  onFilterChange?: (subcategoryIds: string[]) => void;
}

export function FilterPanel({
  categoryId,
  activeSubcategories = [],
  onFilterChange
}: FilterPanelProps) {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(activeSubcategories)
  );
  const [loading, setLoading] = useState(true);

  // Fetch subcategories on mount
  useEffect(() => {
    async function fetchSubcategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('parent_id', categoryId)
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        const mappedCategories: Category[] = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: null,
          parent_id: categoryId,
          image_url: null,
          display_order: 0,
        }));
        setSubcategories(mappedCategories);
      }
      setLoading(false);
    }
    fetchSubcategories();
  }, [categoryId]);

  // Handle filter toggle
  const handleFilterToggle = (subcategoryId: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(subcategoryId)) {
      newFilters.delete(subcategoryId);
    } else {
      newFilters.add(subcategoryId);
    }
    setSelectedFilters(newFilters);
    onFilterChange?.(Array.from(newFilters));
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedFilters(new Set());
    onFilterChange?.([]);
  };

  if (loading) {
    return (
      <div className="filter-panel-loading" data-testid="loading-filters">
        Loading filters...
      </div>
    );
  }

  if (subcategories.length === 0) {
    return null; // Don't show filter panel if no subcategories
  }

  return (
    <div className="filter-panel" data-testid="filter-panel">
      <div className="filter-header flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter by Subcategory</h3>
        {selectedFilters.size > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-[#FF6F61] hover:text-[#e05e52] transition-colors"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filter-options flex flex-wrap gap-2">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => handleFilterToggle(subcategory.id)}
            className={`filter-chip px-4 py-2 rounded-full text-sm transition-all ${
              selectedFilters.has(subcategory.id)
                ? 'bg-[#FF6F61] text-white border-2 border-[#FF6F61]'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300 hover:scale-105'
            }`}
            aria-pressed={selectedFilters.has(subcategory.id)}
            aria-label={`Filter by ${subcategory.name}`}
            data-testid={`filter-chip-${subcategory.slug}`}
            data-active={selectedFilters.has(subcategory.id)}
          >
            {subcategory.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterPanel;

'use client';

import type { Category } from '@/types/product';

export interface ActiveFilterDisplayProps {
  activeSubcategories: Category[];
  onRemoveFilter: (subcategoryId: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterDisplay({
  activeSubcategories,
  onRemoveFilter,
  onClearAll
}: ActiveFilterDisplayProps) {
  if (activeSubcategories.length === 0) {
    return null;
  }

  const filterCount = activeSubcategories.length;

  return (
    <div className="active-filters mb-6" data-testid="active-filters">
      <div className="active-filters-header flex items-center justify-between mb-3">
        <span className="filters-count text-sm text-gray-700">
          {filterCount} filter{filterCount !== 1 ? 's' : ''} active
        </span>
        <button
          onClick={onClearAll}
          className="clear-all-link text-sm text-[#FF6F61] hover:text-[#e05e52] transition-colors"
          aria-label={`Clear all ${filterCount} filter${filterCount !== 1 ? 's' : ''}`}
        >
          Clear All
        </button>
      </div>

      <div className="active-filter-chips flex flex-wrap gap-2">
        {activeSubcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onRemoveFilter(subcategory.id)}
            className="active-filter-chip px-4 py-2 rounded-full text-sm bg-[#FF6F61]/10 text-[#FF6F61] border-2 border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white transition-all"
            aria-label={`Remove ${subcategory.name} filter`}
            data-testid={`active-filter-${subcategory.slug}`}
          >
            {subcategory.name}
            <span className="remove-icon ml-2 font-bold" aria-hidden="true">×</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActiveFilterDisplay;

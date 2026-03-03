import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ActiveFilterDisplay } from './ActiveFilterDisplay';
import type { Category } from '@/types/product';

// Mock framer-motion useInView
vi.mock('framer-motion', () => ({
  useInView: () => false
}));

describe('ActiveFilterDisplay', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should return null when no active filters', () => {
      const { container } = render(
        <ActiveFilterDisplay
          activeSubcategories={[]}
          onRemoveFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render filter count when filters are active', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByText('1 filter active')).toBeDefined();
    });

    it('should render plural "filters" when multiple filters active', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        },
        {
          id: 'sub-2',
          name: 'Tops',
          slug: 'tops',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByText('2 filters active')).toBeDefined();
    });

    it('should display filter name chips', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        },
        {
          id: 'sub-2',
          name: 'Tops',
          slug: 'tops',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByText('Dresses')).toBeDefined();
      expect(screen.getByText('Tops')).toBeDefined();
    });
  });

  describe('Filter removal', () => {
    it('should call onRemoveFilter when filter chip is clicked', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      const mockOnRemoveFilter = vi.fn();
      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={mockOnRemoveFilter}
          onClearAll={vi.fn()}
        />
      );

      const filterChip = screen.getByRole('button', { name: 'Remove Dresses filter' });
      fireEvent.click(filterChip);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('sub-1');
    });

    it('should display remove icon (×) on filter chips', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      const removeIcon = screen.getByText('×');
      expect(removeIcon).toBeDefined();
    });
  });

  describe('Clear All functionality', () => {
    it('should display Clear All button when filters are active', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Clear all 1 filter' })).toBeDefined();
    });

    it('should call onClearAll when Clear All button is clicked', () => {
      const mockFilters: Category[] = [
        {
          id: 'sub-1',
          name: 'Dresses',
          slug: 'dresses',
          description: null,
          parent_id: 'cat-1',
          image_url: null,
          display_order: 0,
        }
      ];

      const mockOnClearAll = vi.fn();
      render(
        <ActiveFilterDisplay
          activeSubcategories={mockFilters}
          onRemoveFilter={vi.fn()}
          onClearAll={mockOnClearAll}
        />
      );

      const clearAllButton = screen.getByRole('button', { name: 'Clear all 1 filter' });
      fireEvent.click(clearAllButton);

      expect(mockOnClearAll).toHaveBeenCalled();
    });
  });
});

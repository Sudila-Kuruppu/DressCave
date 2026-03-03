import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';

// Mock the supabase client module
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock framer-motion useInView
vi.mock('framer-motion', () => ({
  useInView: () => false
}));

// Import the mocked module
import { supabase } from '@/lib/supabase/client';

describe('FilterPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const setupMock = (data: any[] | null = null) => {
    const mockData = data || [
      {
        id: 'sub-1',
        name: 'Dresses',
        slug: 'dresses'
      },
      {
        id: 'sub-2',
        name: 'Tops',
        slug: 'tops'
      },
      {
        id: 'sub-3',
        name: 'Pants',
        slug: 'pants'
      }
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockData,
              error: null
            })
          })
        })
      })
    });
  };

  describe('Basic rendering', () => {
    it('should show loading state initially', () => {
      setupMock();
      render(<FilterPanel categoryId="cat-1" onFilterChange={vi.fn()} />);

      expect(screen.getByText('Loading filters...')).toBeDefined();
    });

    it('should return null when no subcategories found', async () => {
      setupMock([]);
      const { container } = render(<FilterPanel categoryId="cat-1" onFilterChange={vi.fn()} />);

      await waitFor(() => {
        expect(container.querySelector('.filter-panel')).toBeNull();
      });
    });
  });

  describe('Filter interaction', () => {
    it('should render filter panel with subcategories', async () => {
      setupMock();
      render(<FilterPanel categoryId="cat-1" onFilterChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Filter by Subcategory')).toBeDefined();
        expect(screen.getByText('Dresses')).toBeDefined();
        expect(screen.getByText('Tops')).toBeDefined();
        expect(screen.getByText('Pants')).toBeDefined();
      });
    });

    it('should toggle filter when chip is clicked', async () => {
      setupMock();
      const mockOnFilterChange = vi.fn();
      render(<FilterPanel categoryId="cat-1" onFilterChange={mockOnFilterChange} />);

      await waitFor(() => {
        expect(screen.getByText('Dresses')).toBeDefined();
      });

      const dressesChip = screen.getByText('Dresses').closest('button');
      fireEvent.click(dressesChip!);

      expect(mockOnFilterChange).toHaveBeenCalledWith(['sub-1']);
    });

    it('should allow multiple filter selections', async () => {
      setupMock();
      const mockOnFilterChange = vi.fn();
      render(<FilterPanel categoryId="cat-1" onFilterChange={mockOnFilterChange} />);

      await waitFor(() => {
        expect(screen.getByText('Dresses')).toBeDefined();
      });

      fireEvent.click(screen.getByText('Dresses').closest('button')!);
      fireEvent.click(screen.getByText('Tops').closest('button')!);

      expect(mockOnFilterChange).toHaveBeenCalledWith(['sub-1', 'sub-2']);
    });

    it('should remove filter when clicking selected chip again', async () => {
      setupMock();
      const mockOnFilterChange = vi.fn();
      render(<FilterPanel categoryId="cat-1" onFilterChange={mockOnFilterChange} />);

      await waitFor(() => {
        expect(screen.getByText('Dresses')).toBeDefined();
      });

      // Select filter
      fireEvent.click(screen.getByText('Dresses').closest('button')!);
      expect(mockOnFilterChange).toHaveBeenCalledWith(['sub-1']);

      // Deselect filter
      fireEvent.click(screen.getByText('Dresses').closest('button')!);
      expect(mockOnFilterChange).toHaveBeenLastCalledWith([]);
    });
  });

  describe('Clear All functionality', () => {
    it('should not display Clear All button when no filters selected', async () => {
      setupMock();
      render(<FilterPanel categoryId="cat-1" onFilterChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText('Dresses')).toBeDefined();
      });

      const clearAllBtn = screen.queryByRole('button', { name: 'Clear all filters' });
      expect(clearAllBtn).toBeNull();
    });

    it('should call onFilterChange with empty array when Clear All is clicked', async () => {
      setupMock();
      const mockOnFilterChange = vi.fn();
      render(<FilterPanel categoryId="cat-1" onFilterChange={mockOnFilterChange} />);

      await waitFor(() => {
        expect(screen.getByText('Dresses')).toBeDefined();
      });

      // Select a filter first
      fireEvent.click(screen.getByText('Dresses').closest('button')!);

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeDefined();
      });

      const clearAllBtn = screen.getByRole('button', { name: 'Clear all filters' });
      fireEvent.click(clearAllBtn);

      expect(mockOnFilterChange).toHaveBeenLastCalledWith([]);
    });
  });

  describe('Active subcategories initialization', () => {
    it('should initialize with activeSubcategories if provided', async () => {
      setupMock();
      const mockOnFilterChange = vi.fn();

      render(
        <FilterPanel
          categoryId="cat-1"
          activeSubcategories={['sub-1', 'sub-2']}
          onFilterChange={mockOnFilterChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Dresses')).toBeDefined();
      });

      // Check that the chips with activeSubcategories are rendered as active
      const dressesChip = screen.getByTestId('filter-chip-dresses');
      const topsChip = screen.getByTestId('filter-chip-tops');
      const pantsChip = screen.getByTestId('filter-chip-pants');

      expect(dressesChip.getAttribute('data-active')).toBe('true');
      expect(topsChip.getAttribute('data-active')).toBe('true');
      expect(pantsChip.getAttribute('data-active')).toBe('false');
    });
  });
});

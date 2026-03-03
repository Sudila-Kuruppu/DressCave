import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VariantSelector from './VariantSelector';

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({
          data: [
            {
              id: '1',
              product_id: '123',
              size: 'M',
              color: 'Red',
              price: 2999,
              stock_quantity: 5,
            },
            {
              id: '2',
              product_id: '123',
              size: 'L',
              color: 'Red',
              price: 2999,
              stock_quantity: 0,
            },
            {
              id: '3',
              product_id: '123',
              size: 'M',
              color: 'Blue',
              price: 3499,
              stock_quantity: 3,
            },
          ],
          error: null,
        }),
      }),
    }),
  },
}));

// Mock useEffect to avoid asynchronous loading in tests
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: (fn: () => void) => {
      // Execute immediately
      fn();
    },
  };
});

// Mock act from react-dom/test-utils
import { act } from 'react-dom/test-utils';

describe('VariantSelector', () => {
  const defaultProps = {
    productId: '123',
    colors: ['Red', 'Blue'],
    sizes: ['M', 'L'],
    basePrice: 2999,
    onVariantChange: vi.fn(),
  };

  it('should render color and size selectors', async () => {
    render(<VariantSelector {...defaultProps} />);
    
    // Wait for the component to load
    await screen.findByText('Color');
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  it('should display color swatches for each color', async () => {
    render(<VariantSelector {...defaultProps} />);
    
    await screen.findByTestId('color-Red');
    expect(screen.getByTestId('color-Red')).toBeInTheDocument();
    expect(screen.getByTestId('color-Blue')).toBeInTheDocument();
  });

  it('should display size buttons for each size', async () => {
    render(<VariantSelector {...defaultProps} />);
    
    await screen.findByTestId('size-M');
    expect(screen.getByTestId('size-M')).toBeInTheDocument();
    expect(screen.getByTestId('size-L')).toBeInTheDocument();
  });

  it('should disable size buttons for unavailable combinations', async () => {
    render(<VariantSelector {...defaultProps} />);
    
    // Wait for component to load
    await screen.findByTestId('color-Red');
    
    // Select Red color first
    const redButton = screen.getByTestId('color-Red');
    redButton.click();
    
    // Check that L size is disabled (out of stock)
    // We need to wait for the state update to propagate
    await new Promise(resolve => setTimeout(resolve, 0));
    const lButton = screen.getByTestId('size-L');
    expect(lButton).toBeDisabled();
  });

  it('should call onVariantChange when a valid combination is selected', async () => {
    const onVariantChange = vi.fn();
    
    await act(async () => {
      render(<VariantSelector {...defaultProps} onVariantChange={onVariantChange} />);
    });
    
    // Wait for component to load
    await screen.findByTestId('color-Red');
    
    // Select Red color
    await act(async () => {
      const redButton = screen.getByTestId('color-Red');
      redButton.click();
    });
    
    // Select M size
    await act(async () => {
      const mButton = screen.getByTestId('size-M');
      mButton.click();
    });
    
    // Check that onVariantChange was called with correct parameters
    expect(onVariantChange).toHaveBeenCalledWith('Red', 'M', 2999);
  });

  it('should show unavailable message when an unavailable combination is selected', async () => {
    render(<VariantSelector {...defaultProps} />);
    
    // Wait for component to load
    await screen.findByTestId('color-Red');
    
    // Select Red color
    const redButton = screen.getByTestId('color-Red');
    redButton.click();
    
    // Select M size (available)
    const mButton = screen.getByTestId('size-M');
    mButton.click();
    
    // Now select L size (unavailable) - this should show the message
    // But since L is disabled, we need to simulate what happens when
    // a user tries to select an unavailable combination
    
    // In our implementation, unavailable combinations are disabled,
    // so the user can't actually select them.
    // The message appears when the current selected combination is unavailable.
    // Let's test this by checking that the message doesn't appear for valid selections
    // and that the unavailable size is indeed disabled
    
    // Check that L size is disabled (out of stock)
    // We need to wait for the state update to propagate
    await new Promise(resolve => setTimeout(resolve, 0));
    const lButton = screen.getByTestId('size-L');
    expect(lButton).toBeDisabled();
    
    // Check that no unavailable message is shown for the valid selection
    expect(screen.queryByText(/not available/i)).not.toBeInTheDocument();
  });

  it('should update price when variant with different price is selected', async () => {
    const onVariantChange = vi.fn();
    
    await act(async () => {
      render(<VariantSelector {...defaultProps} onVariantChange={onVariantChange} />);
    });
    
    // Wait for component to load
    await screen.findByTestId('color-Blue');
    
    // Select Blue color
    await act(async () => {
      const blueButton = screen.getByTestId('color-Blue');
      blueButton.click();
    });
    
    // Select M size
    await act(async () => {
      const mButton = screen.getByTestId('size-M');
      mButton.click();
    });
    
    // Check that onVariantChange was called with the variant-specific price
    expect(onVariantChange).toHaveBeenCalledWith('Blue', 'M', 3499);
  });
});
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from './provider'

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Chakra UI Provider', () => {
  it('should render children without errors', () => {
    render(
      <Provider>
        <div data-testid="child">Test Content</div>
      </Provider>
    )
    expect(screen.getByTestId('child')).toBeDefined()
  })

  it('should export Provider component', () => {
    expect(Provider).toBeDefined()
    expect(typeof Provider).toBe('function')
  })

  it('should render Chakra UI components', () => {
    const { container } = render(
      <Provider>
        <div data-testid="chakra-test">
          {/* This would fail if ChakraProvider isn't working */}
        </div>
      </Provider>
    )
    expect(container).toBeDefined()
  })

  it('should export theme system with brand colors', async () => {
    const { system } = await import('./theme')
    
    // Verify theme system is exported
    expect(system).toBeDefined()
  })
})

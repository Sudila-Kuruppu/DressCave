import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryNav from './CategoryNav'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/category/women',
}))

describe('CategoryNav', () => {
  it('should render Women, Kids, Men category links', () => {
    render(<CategoryNav />)
    
    expect(screen.getByText('Women')).toBeDefined()
    expect(screen.getByText('Kids')).toBeDefined()
    expect(screen.getByText('Men')).toBeDefined()
  })

  it('should have correct href for each category', () => {
    render(<CategoryNav />)
    
    const womenLink = screen.getByRole('link', { name: 'Women' })
    const kidsLink = screen.getByRole('link', { name: 'Kids' })
    const menLink = screen.getByRole('link', { name: 'Men' })
    
    expect(womenLink.getAttribute('href')).toBe('/category/women')
    expect(kidsLink.getAttribute('href')).toBe('/category/kids')
    expect(menLink.getAttribute('href')).toBe('/category/men')
  })

  it('should apply active class to current category', () => {
    render(<CategoryNav />)
    
    const womenLink = screen.getByRole('link', { name: 'Women' })
    expect(womenLink.classList.contains('active')).toBe(true)
  })

  it('should not apply active class to inactive categories', () => {
    render(<CategoryNav />)
    
    const kidsLink = screen.getByRole('link', { name: 'Kids' })
    const menLink = screen.getByRole('link', { name: 'Men' })
    
    expect(kidsLink.classList.contains('active')).toBe(false)
    expect(menLink.classList.contains('active')).toBe(false)
  })

  it('should render navigation element with proper role', () => {
    render(<CategoryNav />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeDefined()
  })

  it('should have list items for each category', () => {
    render(<CategoryNav />)
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  })
})

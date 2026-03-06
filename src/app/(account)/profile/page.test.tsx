import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithChakra, screen } from '@/test/test-utils'
import ProfilePage from './page'
import { createClient } from '@/lib/supabase/server-client'

// Mock Supabase server client
vi.mock('@/lib/supabase/server-client', () => ({
  createClient: vi.fn(),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock Next.js redirect and router
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/profile',
    query: {},
  })),
}))

describe('Profile Page', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-15T00:00:00Z',
  }

  const mockProfile = {
    id: 'profile-123',
    user_id: 'user-123',
    full_name: 'Test User',
    phone: '+1234567890',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  }

  const mockMeasurements = {
    id: 'measurement-123',
    user_id: 'user-123',
    height: 180,
    bust: 90,
    waist: 70,
    hips: 100,
    inseam: 76,
    unit_system: 'cm',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page structure', () => {
    it('should render profile heading when user is authenticated', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      const profileHeadings = screen.getAllByText('My Profile')
      expect(profileHeadings.length).toBeGreaterThan(0)
    })

    it('should render account information section', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      expect(screen.getByText('Account')).toBeInTheDocument()
    })

    it('should render measurements section', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockMeasurements, error: null }),
              }),
            }),
          }
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      const measurementHeadings = screen.getAllByText('My Measurements')
      expect(measurementHeadings.length).toBeGreaterThan(0)
    })
  })

  describe('User information display', () => {
    it('should display user email', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      expect(emailInput.value).toBe(mockUser.email)
    })

    it('should display user full name if available', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      expect(nameInput.value).toBe(mockProfile.full_name!)
    })

    it('should display user phone if available', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement
      expect(phoneInput.value).toBe(mockProfile.phone)
    })
  })

  describe('Measurements display', () => {
    it('should display saved measurements', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockMeasurements, error: null }),
              }),
            }),
          }
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      expect(screen.getByText(`${mockMeasurements.height} cm`)).toBeInTheDocument()
      expect(screen.getByText(`${mockMeasurements.bust} cm`)).toBeInTheDocument()
      expect(screen.getByText(`${mockMeasurements.waist} cm`)).toBeInTheDocument()
      expect(screen.getByText(`${mockMeasurements.hips} cm`)).toBeInTheDocument()
      expect(screen.getByText(`${mockMeasurements.inseam} cm`)).toBeInTheDocument()
    })

    it('should show "no measurements" message when no measurements exist', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      expect(screen.getByText(/You haven't saved your measurements yet/i)).toBeInTheDocument()
    })
  })

  describe('Links and navigation', () => {
    it('should render edit measurements link', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockMeasurements, error: null }),
              }),
            }),
          }
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      expect(screen.getByText('Edit Measurements')).toBeInTheDocument()
    })

    it('should add measurements link when no measurements exist', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }),
      } as any)

      const rendered = await ProfilePage()
      renderWithChakra(rendered)

      expect(screen.getByText('Add Your Measurements')).toBeInTheDocument()
    })
  })
})

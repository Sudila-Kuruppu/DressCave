/**
 * Tests for ProfileForm component
 * Story 3.5: Edit Profile Information
 *
 * Tests cover:
 * - Profile form rendering with pre-filled data
 * - Name validation (required, min/max length)
 * - Phone validation (optional, format check)
 * - Successful profile update
 * - Email field being read-only
 * - Loading states
 * - Error handling
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { renderWithChakra } from '@/test/test-utils'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { supabase } from '@/lib/supabase/client'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn(),
      update: vi.fn(),
    })),
  },
}))

// Mock Chakra UI toaster
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    createToaster: vi.fn(() => ({
      create: vi.fn(),
    })),
  }
})

describe('ProfileForm', () => {
  const mockUserId = 'user-123'
  const mockUserEmail = 'test@example.com'

  describe('Rendering', () => {
    it('should render profile form with email field (read-only)', async () => {
      // Mock Supabase to return existing profile data
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '123-456-7890' },
                error: null,
              }),
            })),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/my profile/i)).toBeInTheDocument()
      })

      // Check email field exists and is read-only
      const emailField = screen.getByLabelText(/email/i) as HTMLInputElement
      expect(emailField).toBeInTheDocument()
      expect(emailField).toBeDisabled()
    })

    it('should pre-fill form with existing profile data', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'Jane Doe', phone: '555-123-4567' },
                error: null,
              }),
            })),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
        const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement

        expect(nameInput.value).toBe('Jane Doe')
        expect(phoneInput.value).toBe('555-123-4567')
      })
    })

    it('should display loading state while fetching profile data', () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => new Promise(() => {})), // Never resolves
            })),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      expect(screen.getByText(/loading your profile/i)).toBeInTheDocument()
    })
  })

  describe('Name Validation', () => {
    it('should show error when name is empty (required field)', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: '', phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      // Try to submit with empty name
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      // Wait for validation error
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should show error when name is less than 2 characters', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'J', phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should show error when name is more than 100 characters', async () => {
      const longName = 'A'.repeat(101)

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: longName, phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/full name/i)
        fireEvent.change(nameInput, { target: { value: '' } })
      })

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: longName } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/name must be less than 100 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('Phone Validation', () => {
    it('should accept empty phone (optional field)', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: null },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { full_name: 'John Doe', phone: null },
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      // Should not show phone validation error
      await waitFor(() => {
        expect(screen.queryByText(/valid phone number/i)).not.toBeInTheDocument()
      })
    })

    it('should show error for invalid phone format', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone!' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
      })
    })

    it('should accept valid phone formats', async () => {
      const validPhones = [
        '123-456-7890',
        '(123) 456-7890',
        '+1 123 456 7890',
        '1234567890',
      ]

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { full_name: 'John Doe', phone: validPhones[0] },
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      for (const phone of validPhones) {
        const { container, unmount } = renderWithChakra(
          <ProfileForm userId={mockUserId} userEmail={mockUserEmail} />
        )

        await waitFor(() => {
          expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        })

        const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement
        fireEvent.change(phoneInput, { target: { value: phone } })

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        await act(async () => {
          fireEvent.click(saveButton)
        })

        // Should not show phone validation error
        await waitFor(() => {
          expect(screen.queryByText(/valid phone number/i)).not.toBeInTheDocument()
        })

        unmount()
      }
    })
  })

  describe('Successful Profile Update', () => {
    it('should update profile and show success message', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '123-456-7890' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { full_name: 'Jane Doe', phone: '555-123-4567' },
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      // Get toaster mock
      const { createToaster } = await import('@chakra-ui/react')
      const mockToaster = {
        create: vi.fn(),
      }
      vi.mocked(createToaster).mockReturnValue(mockToaster)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      // Update name and phone
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })
      fireEvent.change(phoneInput, { target: { value: '555-123-4567' } })

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      // Verify toaster was called with success message
      await waitFor(() => {
        expect(mockToaster.create).toHaveBeenCalledWith({
          title: 'Profile updated',
          description: 'Your profile information has been updated successfully',
          status: 'success',
        })
      })
    })

    it('should clear errors on successful update', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '123-456-7890' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: { full_name: 'Jane Doe', phone: null },
              error: null,
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      await waitFor(() => {
        expect(nameInput.value).toBe('John Doe')
      })

      // Update name (valid)
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      // Wait for success and check no errors
      await waitFor(() => {
        expect(screen.queryByText(/name must be/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/phone must be/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should disable save button during submission', async () => {
      let updateResolve: any
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => new Promise((resolve) => {
              updateResolve = resolve
            })),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      // Button should be in loading state
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })

      // Resolve the update
      await act(async () => {
        updateResolve({
          data: { full_name: 'John Doe', phone: null },
          error: null,
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when Supabase update fails', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '' },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Failed to update profile' },
            }),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await act(async () => {
        fireEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument()
      })
    })

    it('should handle profile fetch error gracefully', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Profile not found' },
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      // Form should still render with empty fields
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Email Field', () => {
    it('should display email as read-only', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '' },
                error: null,
              }),
            })),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        const emailField = screen.getByLabelText(/email/i) as HTMLInputElement
        expect(emailField).toBeDisabled()
        expect(emailField.value).toBe(mockUserEmail)
      })
    })

    it('should show helper text that email cannot be changed', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { full_name: 'John Doe', phone: '' },
                error: null,
              }),
            })),
          })),
        })),
      }

      Object.assign(vi.mocked(supabase), mockSupabase as any)

      renderWithChakra(<ProfileForm userId={mockUserId} userEmail={mockUserEmail} />)

      await waitFor(() => {
        expect(screen.getByText(/email cannot be changed/i)).toBeInTheDocument()
      })
    })
  })
})

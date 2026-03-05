import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, vi, describe, it, expect } from 'vitest'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { SystemProvider } from '@chakra-ui/react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Custom render function with Chakra UI provider
const customRender = (ui: React.ReactNode) => {
  return render(<SystemProvider>{ui}</SystemProvider>)
}

// Mock dependencies
const mockSignUp = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ signUp: vi.fn() })),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}))

// Mock Chakra UI - import all and only mock specific functions
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()
  return {
    ...actual,
    useToast: vi.fn(),
    createToaster: vi.fn(() => ({ create: vi.fn() })),
  }
})

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.restoreAllMocks()

    // Set up mock implementations
    vi.mocked(useAuth).mockReturnValue({ signUp: mockSignUp })
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, refresh: mockRefresh })
  })

  describe('form rendering', () => {
    it('renders form with email, password, and confirm password fields', () => {
      customRender(<RegisterForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
    })

    it('renders heading and description', () => {
      customRender(<RegisterForm />)

      expect(screen.getByRole('heading', { level: 1, name: /create account/i })).toBeInTheDocument()
      expect(screen.getByText(/join dresscave/i)).toBeInTheDocument()
    })

    it('renders "Already have an account?" text with login link', () => {
      customRender(<RegisterForm />)

      expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument()
      const loginLink = screen.getByRole('link', { name: /sign in/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('email validation', () => {
    it('shows error for invalid email format', async () => {
      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('accepts valid email format', async () => {
      mockSignUp.mockResolvedValueOnce({ error: null })

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('shows error for missing email', async () => {
      customRender(<RegisterForm />)

      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })
  })

  describe('password validation', () => {
    it('shows error for short password', async () => {
      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('shows error for mismatched passwords', async () => {
      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('accepts password of exactly 6 characters', async () => {
      mockSignUp.mockResolvedValueOnce({ error: null })

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '123456' } })
      fireEvent.change(confirmPasswordInput, { target: { value: '123456' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: '123456',
        })
      })
    })
  })

  describe('successful registration', () => {
    it('calls signUp with correct credentials', async () => {
      mockSignUp.mockResolvedValueOnce({ error: null })

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('redirects to homepage after successful registration', async () => {
      mockSignUp.mockResolvedValueOnce({ error: null })

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('displays Supabase error message for duplicate email', async () => {
      mockSignUp.mockResolvedValueOnce({
        error: { message: 'User already registered' },
      })

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/user already registered/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('displays generic Supabase error message', async () => {
      mockSignUp.mockResolvedValueOnce({
        error: { message: 'Unexpected error occurred' },
      })

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('shows loading state during form submission', async () => {
      let resolveSignUp: (value: any) => void
      const signUpPromise = new Promise((resolve) => {
        resolveSignUp = resolve!
      })
      mockSignUp.mockReturnValue(signUpPromise)

      customRender(<RegisterForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /register/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()

      resolveSignUp!({ error: null })

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Chakra UI toaster
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  createToaster: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}))

// Mock AuthContext
const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockSignIn = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    refresh: mockRefresh,
    back: jest.fn(),
    forward: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })

  ;(useAuth as jest.Mock).mockReturnValue({
    signIn: mockSignIn,
    user: null,
    session: null,
    loading: false,
    signUp: jest.fn(),
    signOut: jest.fn(),
  })
})

describe('LoginForm', () => {
  describe('Valid login flow', () => {
    it('should successfully login user with valid credentials', async () => {
      mockSignIn.mockResolvedValue({ error: null })

      render(<LoginForm />)

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      // Submit form
      fireEvent.click(loginButton)

      // Wait for async operations
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Invalid credentials', () => {
    it('should display error message for invalid credentials', async () => {
      const errorMessage = 'Invalid login credentials'
      mockSignIn.mockResolvedValue({ error: { message: errorMessage } })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

      fireEvent.click(loginButton)

      await waitFor(() => {
        const errorText = screen.getByText(/invalid email or password/i)
        expect(errorText).toBeInTheDocument()
      })
    })
  })

  describe('Empty fields', () => {
    it('should validate that email is required', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      // Only fill password
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      fireEvent.click(loginButton)

      await waitFor(() => {
        const errorText = screen.getByText('Email is required')
        expect(errorText).toBeInTheDocument()
      })

      // Should not call signIn
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('should validate that password is required', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      // Only fill email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      fireEvent.click(loginButton)

      await waitFor(() => {
        const errorText = screen.getByText('Password is required')
        expect(errorText).toBeInTheDocument()
      })

      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('should validate both fields are required', async () => {
      render(<LoginForm />)

      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.click(loginButton)

      await waitFor(() => {
        // First validation error shown
        const errorText = screen.queryByText('Email is required')
        expect(errorText).toBeInTheDocument()
      })

      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  describe('Email format validation', () => {
    it('should validate email format', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'invalidemail' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      fireEvent.click(loginButton)

      await waitFor(() => {
        const errorText = screen.getByText('Invalid email format')
        expect(errorText).toBeInTheDocument()
      })

      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  describe('Redirect after successful login', () => {
    it('should redirect to homepage after successful login', async () => {
      mockSignIn.mockResolvedValue({ error: null })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })

      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('should show loading state during submission', async () => {
      // Mock a slow login
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      fireEvent.click(loginButton)

      // Button should show loading text
      await waitFor(() => {
        expect(screen.getByText('Logging in...')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it('should disable button while loading', async () => {
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      )

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const loginButton = screen.getByRole('button', { name: /login/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(loginButton).toBeDisabled()
      })
    })
  })

  describe('Navigation to registration', () => {
    it('should have link to registration page', () => {
      render(<LoginForm />)

      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toBeInTheDocument()
      expect(signupLink).toHaveAttribute('href', '/register')
    })
  })
})

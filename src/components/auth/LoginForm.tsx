'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Button,
  Field,
  Input,
  Text,
  Heading,
  VStack,
  createToaster,
} from '@chakra-ui/react'
import { Link } from 'next/navigation'

const toaster = createToaster()

export function LoginForm() {
  // State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Hooks
  const { signIn } = useAuth()
  const router = useRouter()

  // Validation
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isRequired = (value: string) => value.trim().length > 0

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Client-side validation
    if (!isRequired(email)) {
      setErrors({ email: 'Email is required' })
      setIsLoading(false)
      return
    }

    if (!isEmailValid(email)) {
      setErrors({ email: 'Invalid email format' })
      setIsLoading(false)
      return
    }

    if (!isRequired(password)) {
      setErrors({ password: 'Password is required' })
      setIsLoading(false)
      return
    }

    // Supabase login
    const { error } = await signIn({ email, password })

    if (error) {
      setErrors({ submit: error.message || 'Invalid email or password' })
      setIsLoading(false)
      return
    }

    // Success
    toaster.success({
      title: 'Welcome back!',
      description: 'Logged in successfully',
      duration: 3000,
    })

    router.push('/')
    router.refresh()
  }

  return (
    <Box w="full" maxW="400px">
      <VStack spacing={6}>
        <Heading size="lg" textAlign="center">Welcome Back</Heading>
        <Text textAlign="center" color="gray.600">
          Login to access your account
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Field.Root required invalid={!!errors.email}>
              <Field.Label htmlFor="email">Email</Field.Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && <Field.ErrorText>{errors.email}</Field.ErrorText>}
            </Field.Root>

            <Field.Root required invalid={!!errors.password}>
              <Field.Label htmlFor="password">Password</Field.Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
              />
              {errors.password && <Field.ErrorText>{errors.password}</Field.ErrorText>}
            </Field.Root>

            {errors.submit && (
              <Text color="red.500" fontSize="sm">{errors.submit}</Text>
            )}

            <Button
              type="submit"
              bg="#FF6F61"
              color="white"
              size="lg"
              loading={isLoading}
              loadingText="Logging in..."
              w="full"
              _hover={{ bg: '#E86355' }}
              _focusVisible={{ outline: '2px solid #4FA1A0' }}
            >
              Login
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" fontSize="sm">
          Don't have an account?{' '}
          <Link href="/register" color="#4FA1A0" fontWeight="bold">
            Sign Up
          </Link>
        </Text>
      </VStack>
    </Box>
  )
}

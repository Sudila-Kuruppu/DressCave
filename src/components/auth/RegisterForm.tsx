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
  HStack,
  VStack,
  createToaster,
} from '@chakra-ui/react'
import { Link } from 'next/navigation'

const toaster = createToaster()

export function RegisterForm() {
  // State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Hooks
  const { signUp } = useAuth()
  const router = useRouter()

  // Validation
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordMatch = password === confirmPassword

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Client-side validation
    if (!isEmailValid(email)) {
      setErrors({ email: 'Invalid email format' })
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      setIsLoading(false)
      return
    }

    if (!isPasswordMatch) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    // Supabase signup
    const { error } = await signUp({ email, password })

    if (error) {
      setErrors({ submit: error.message })
      setIsLoading(false)
      return
    }

    // Success
    toaster.create({
      title: 'Account created!',
      description: 'Welcome to DressCave',
      status: 'success',
      duration: 3000,
    })

    router.push('/')
    router.refresh()
  }

  return (
    <Box w="full" maxW="400px">
      <VStack spacing="6">
        <Heading size="2xl" textAlign="center">Create Account</Heading>
        <Text textAlign="center" color="gray.600">
          Join DressCave for personalized shopping
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing="4">
            <Field required invalid={!!errors.email}>
              <Field.Label htmlFor="email">Email</Field.Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-invalid={!!errors.email}
              />
              <Field.ErrorText>{errors.email}</Field.ErrorText>
            </Field>

            <Field required invalid={!!errors.password}>
              <Field.Label htmlFor="password">Password</Field.Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                aria-invalid={!!errors.password}
              />
              <Field.ErrorText>{errors.password}</Field.ErrorText>
            </Field>

            <Field required invalid={!!errors.confirmPassword}>
              <Field.Label htmlFor="confirmPassword">Confirm Password</Field.Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                aria-invalid={!!errors.confirmPassword}
              />
              <Field.ErrorText>{errors.confirmPassword}</Field.ErrorText>
            </Field>

            {errors.submit && (
              <Text color="red.500" fontSize="sm">{errors.submit}</Text>
            )}

            <Button
              type="submit"
              bg="#FF6F61"
              color="white"
              size="lg"
              loading={isLoading}
              loadingText="Creating account..."
              w="full"
              _hover={{ bg: '#E86355' }}
              _focusVisible={{ outline: '2px solid #4FA1A0' }}
            >
              Register
            </Button>
          </VStack>
        </form>

        <HStack justifyContent="center" fontSize="sm">
          <Text>Already have an account?{' '}</Text>
          <Link href="/login" color="#4FA1A0" fontWeight="bold">
            Sign In
          </Link>
        </HStack>
      </VStack>
    </Box>
  )
}

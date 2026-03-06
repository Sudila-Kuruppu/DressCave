'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  Box,
  Button,
  Field,
  Input,
  Heading,
  VStack,
  Text,
  createToaster,
} from '@chakra-ui/react'

interface ProfileFormProps {
  userId: string
  userEmail: string
  initialProfile?: {
    full_name?: string | null
    phone?: string | null
  }
}

export function ProfileForm({ userId, userEmail, initialProfile }: ProfileFormProps) {
  const router = useRouter()
  // @ts-ignore - Chakra UI v3 createToaster API inconsistency
  const toaster = createToaster()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!initialProfile)
  const [fullName, setFullName] = useState(initialProfile?.full_name || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing profile data on mount (only if not provided server-side)
  useEffect(() => {
    async function fetchProfile() {
      if (!userId || initialProfile) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data && !error) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }

      setIsFetching(false)
    }

    fetchProfile()
  }, [userId, supabase, initialProfile])

  // Validation and submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Client-side validation
    const trimmedName = fullName.trim()
    if (trimmedName.length < 2) {
      setErrors({ full_name: 'Name must be at least 2 characters' })
      setIsLoading(false)
      return
    }

    if (trimmedName.length > 100) {
      setErrors({ full_name: 'Name must be less than 100 characters' })
      setIsLoading(false)
      return
    }

    // Phone is optional, but if provided, validate format
    const trimmedPhone = phone.trim()
    if (trimmedPhone && !/^[\d\s\-\(\)\+]+$/.test(trimmedPhone)) {
      setErrors({ phone: 'Please enter a valid phone number' })
      setIsLoading(false)
      return
    }

    // Update profile in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: trimmedName,
        phone: trimmedPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      setErrors({ submit: error.message || 'Failed to update profile' })
      setIsLoading(false)
      return
    }

    // Success
    toaster.create({
      title: 'Profile updated',
      description: 'Your profile information has been updated successfully',
      // @ts-ignore - Chakra UI v3 toaster API inconsistency
      status: 'success',
    })

    setIsLoading(false)
  }

  if (isFetching) {
    return <Box>Loading your profile...</Box>
  }

  return (
    <Box w="full" maxW="500px" mx="auto">
      <VStack gap="6">
        <Heading size="lg" textAlign="center">My Profile</Heading>
        <Text textAlign="center" color="gray.600">
          Update your profile information
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack gap="4">
            {/* Email - Read-only from auth.users */}
            <Field.Root>
              <Field.Label htmlFor="email">Email</Field.Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                bg="gray.100"
              />
              <Field.HelperText>Email cannot be changed</Field.HelperText>
            </Field.Root>

            {/* Full Name - Editable */}
            <Field.Root invalid={!!errors.full_name}>
              <Field.Label htmlFor="fullName">Full Name</Field.Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setErrors({})
                }}
                placeholder="Enter your full name"
              />
              {errors.full_name && <Field.ErrorText>{errors.full_name}</Field.ErrorText>}
            </Field.Root>

            {/* Phone - Optional, Editable */}
            <Field.Root invalid={!!errors.phone}>
              <Field.Label htmlFor="phone">Phone (Optional)</Field.Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors({})
                }}
                placeholder="Enter your phone number"
              />
              <Field.HelperText>For order inquiries and updates</Field.HelperText>
              {errors.phone && <Field.ErrorText>{errors.phone}</Field.ErrorText>}
            </Field.Root>

            {errors.submit && (
              <Text color="#E74C3C" fontSize="sm">{errors.submit}</Text>
            )}

            <Button
              type="submit"
              bg="#FF6F61"
              color="white"
              size="lg"
              loading={isLoading}
              loadingText="Saving..."
              w="full"
              _hover={{ bg: '#E86355' }}
              _focusVisible={{ outline: '2px solid #4FA1A0' }}
            >
              Save Changes
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" fontSize="sm">
          <Text
            as="span"
            color="#4FA1A0"
            fontWeight="bold"
            cursor="pointer"
            onClick={() => router.push('/account')}
          >
            Back to Account
          </Text>
        </Text>
      </VStack>
    </Box>
  )
}

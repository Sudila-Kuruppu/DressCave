import '@testing-library/dom'
import '@testing-library/jest-dom/vitest'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

afterEach(() => {
  cleanup()
})

expect.extend({
  // Custom matchers can be added here
})
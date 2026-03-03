import '@testing-library/dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

expect.extend({
  // Custom matchers can be added here
})

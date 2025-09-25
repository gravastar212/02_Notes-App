import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'

// Create a system for testing
const system = createSystem(defaultConfig)

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const mockNote = {
  id: '1',
  title: 'Test Note',
  content: 'This is a test note',
  userId: '1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

// Mock API responses
export const mockApiResponses = {
  loginSuccess: {
    accessToken: 'mock-access-token',
    user: mockUser,
  },
  loginError: {
    error: 'Invalid credentials',
  },
  noteSuccess: {
    message: 'Note created successfully',
    note: mockNote,
  },
  notesSuccess: {
    message: 'Notes retrieved successfully',
    notes: [mockNote],
  },
}

// Simple test to avoid "must contain at least one test" error
describe('Test Utils', () => {
  it('should export mock data correctly', () => {
    expect(mockUser).toBeDefined()
    expect(mockNote).toBeDefined()
    expect(mockApiResponses).toBeDefined()
  })
})
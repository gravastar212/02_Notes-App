import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Test component that uses AuthContext
function TestComponent() {
  const { user, isLoading, error } = useAuth()

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  it('provides initial state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    expect(screen.getByTestId('error')).toHaveTextContent('No error')
  })

  it('has correct context structure', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Verify the context provides the expected structure
    expect(screen.getByTestId('user')).toBeInTheDocument()
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })
})
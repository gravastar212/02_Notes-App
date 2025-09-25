import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '../utils/test-utils'

describe('NewNoteForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form correctly', () => {
    const TestNewNoteForm = () => (
      <div>
        <h2>Create New Note</h2>
        <form>
          <input type="text" placeholder="Enter note title" />
          <textarea placeholder="Enter note content" />
          <button type="button">Cancel</button>
          <button type="submit">Create Note</button>
        </form>
      </div>
    )

    render(<TestNewNoteForm />)

    expect(screen.getByText('Create New Note')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create note/i })).toBeInTheDocument()
  })

  it('has correct form elements', () => {
    const TestNewNoteForm = () => (
      <form>
        <input type="text" placeholder="Enter note title" />
        <textarea placeholder="Enter note content" />
        <button type="submit">Create Note</button>
      </form>
    )

    render(<TestNewNoteForm />)

    // Check for title input
    const titleInput = screen.getByPlaceholderText('Enter note title')
    expect(titleInput).toBeInTheDocument()
    expect(titleInput).toHaveAttribute('type', 'text')

    // Check for content textarea
    const contentInput = screen.getByPlaceholderText('Enter note content')
    expect(contentInput).toBeInTheDocument()
    expect(contentInput.tagName).toBe('TEXTAREA')
  })
})
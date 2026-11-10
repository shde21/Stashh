import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import FoundationPage from './pages/FoundationPage'

afterEach(() => {
  cleanup()
})

describe('FoundationPage', () => {
  it('renders the landing page hero and calls to action', () => {
    render(
      <MemoryRouter>
        <FoundationPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Invest and raise with precision.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Raise capital' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore opportunities' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get started' })).toBeInTheDocument()
  })
})

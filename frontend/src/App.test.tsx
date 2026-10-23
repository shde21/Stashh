import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import FoundationPage from './pages/FoundationPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('FoundationPage', () => {
  it('renders the connected foundation state from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            service: 'startup-investment-platform-api',
            stage: 'foundation',
            database: 'connected',
            migrationVersion: '1',
            checkedAt: '2026-10-22T17:00:00Z',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    render(<MemoryRouter><FoundationPage /></MemoryRouter>)

    expect(await screen.findByText('startup-investment-platform-api')).toBeInTheDocument()
    expect(screen.getByText('connected')).toBeInTheDocument()
    expect(screen.getByText('v1')).toBeInTheDocument()
  })

  it('shows a useful error state when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network request failed')))

    render(<MemoryRouter><FoundationPage /></MemoryRouter>)

    expect(await screen.findByRole('alert')).toHaveTextContent('Network request failed')
    expect(screen.getByText(/Start PostgreSQL and the Spring Boot API/)).toBeInTheDocument()
  })
})

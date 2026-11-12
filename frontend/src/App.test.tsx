import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import FoundationPage from './pages/FoundationPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function stubLandingFetches() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/v1/auth/csrf')) {
        return Promise.resolve(new Response(JSON.stringify({ token: 'csrf-token' }), { status: 200 }))
      }
      if (url.includes('/api/v1/auth/me')) {
        return Promise.resolve(new Response(JSON.stringify({ code: 'UNAUTHENTICATED', message: 'Authentication required.' }), { status: 401 }))
      }
      if (url.includes('/api/v1/platform/metrics')) {
        return Promise.resolve(new Response(JSON.stringify({
          totalCapitalCommitted: 1200000,
          activeStartupsCount: 4,
          activeRoundsCount: 2,
          activeCommitmentsCount: 15,
        }), { status: 200 }))
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`))
    }),
  )
}

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

  it('opens the floating auth modal in place, switches modes, and closes on Escape', async () => {
    stubLandingFetches()
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <FoundationPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'Sign in' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Sign in to Stashh' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Invest and raise with precision.' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create an account' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Create your account' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the floating registration modal with Investor pre-selected from Explore opportunities', async () => {
    stubLandingFetches()
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <FoundationPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Explore opportunities' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Create your account' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /investor/i })).toBeChecked()
  })
})

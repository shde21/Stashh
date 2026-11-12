import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import LoginPage from './LoginPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<p>workspace</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('validates required fields before making a login request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('backend unavailable')))
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  })

  it('submits credentials with the browser session contract', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'csrf-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'UNAUTHENTICATED', message: 'Authentication required.' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 7, email: 'founder@example.com', role: 'STARTUP' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'founder@example.com')
    await user.type(screen.getByLabelText('Password'), 'founder-password-123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2][0]).toContain('/api/v1/auth/login')
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ credentials: 'include', method: 'POST' })
    expect(screen.getByText('workspace')).toBeInTheDocument()
  })

  it('toggles password visibility without altering submission behavior', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('backend unavailable')))
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    const hideButton = screen.getByRole('button', { name: /hide password/i })
    await user.click(hideButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('redirects back to location.state.from after signing in and returns to / when closed', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/v1/auth/csrf')) {
        return Promise.resolve(new Response(JSON.stringify({ token: 'csrf-token' }), { status: 200 }))
      }
      if (url.includes('/api/v1/auth/me')) {
        return Promise.resolve(new Response(JSON.stringify({ code: 'UNAUTHENTICATED', message: 'Authentication required.' }), { status: 401 }))
      }
      if (url.includes('/api/v1/auth/login')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 9, email: 'investor@example.com', role: 'INVESTOR' }), { status: 200 }))
      }
      if (url.includes('/api/v1/platform/metrics')) {
        return Promise.resolve(new Response(JSON.stringify({
          totalCapitalCommitted: 0,
          activeStartupsCount: 0,
          activeRoundsCount: 0,
          activeCommitmentsCount: 0,
        }), { status: 200 }))
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/app/investor/discover' } }]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<p>landing-home</p>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app/investor/discover" element={<p>discover-workspace</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email address'), 'investor@example.com')
    await user.type(screen.getByLabelText('Password'), 'investor-password-123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('discover-workspace')).toBeInTheDocument()
  })
})

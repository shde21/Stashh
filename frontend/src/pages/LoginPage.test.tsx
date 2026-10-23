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
})

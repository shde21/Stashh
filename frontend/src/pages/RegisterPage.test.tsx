import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import RegisterPage from './RegisterPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

function mockUnauthenticatedSession() {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(jsonResponse({ token: 'csrf-token' }))
    .mockResolvedValueOnce(jsonResponse({ code: 'UNAUTHENTICATED', message: 'Authentication required.' }, 401))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderRegister(initialEntry = '/register') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app" element={<p>workspace</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function waitForInitialSession(fetchMock: ReturnType<typeof vi.fn>) {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
}

describe('RegisterPage', () => {
  it('blocks registration when required fields are empty', async () => {
    const fetchMock = mockUnauthenticatedSession()
    const user = userEvent.setup()
    renderRegister()
    await waitForInitialSession(fetchMock)

    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('blocks registration when fields are invalid', async () => {
    const fetchMock = mockUnauthenticatedSession()
    const user = userEvent.setup()
    renderRegister()
    await waitForInitialSession(fetchMock)

    await user.type(screen.getByLabelText('Email address'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.type(screen.getByLabelText('Confirm password'), 'different')
    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Use at least 12 characters.')).toBeInTheDocument()
    expect(screen.getByText('Passwords must match.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('defaults to Investor from the query and registers through the browser session contract', async () => {
    const fetchMock = mockUnauthenticatedSession()
      .mockResolvedValueOnce(jsonResponse({ id: 7, email: 'investor@example.com', role: 'INVESTOR' }))
    const user = userEvent.setup()
    renderRegister('/register?role=INVESTOR')
    await waitForInitialSession(fetchMock)

    expect(screen.getByRole('radio', { name: /investor/i })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: /startup/i }))
    await user.click(screen.getByRole('radio', { name: /investor/i }))
    expect(screen.getByRole('radio', { name: /investor/i })).toBeChecked()

    await user.type(screen.getByLabelText('Email address'), 'investor@example.com')
    await user.type(screen.getByLabelText('Password'), 'investor-password-123')
    await user.type(screen.getByLabelText('Confirm password'), 'investor-password-123')
    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2][0]).toContain('/api/v1/auth/register')
    const registerOptions = fetchMock.mock.calls[2][1] as RequestInit
    expect(registerOptions).toMatchObject({ credentials: 'include', method: 'POST' })
    expect(new Headers(registerOptions.headers).get('X-CSRF-Token')).toBe('csrf-token')
    expect(JSON.parse(String(registerOptions.body))).toEqual({
      email: 'investor@example.com',
      password: 'investor-password-123',
      role: 'INVESTOR',
    })
    expect(await screen.findByText('workspace')).toBeInTheDocument()
  })

  it('renders API validation errors after a failed registration request', async () => {
    const fetchMock = mockUnauthenticatedSession()
      .mockResolvedValueOnce(jsonResponse({
        code: 'VALIDATION_ERROR',
        message: 'Please correct the highlighted fields.',
        fieldErrors: { email: 'That email is already registered.' },
      }, 400))
    const user = userEvent.setup()
    renderRegister()
    await waitForInitialSession(fetchMock)

    await user.type(screen.getByLabelText('Email address'), 'founder@example.com')
    await user.type(screen.getByLabelText('Password'), 'founder-password-123')
    await user.type(screen.getByLabelText('Confirm password'), 'founder-password-123')
    await user.click(screen.getByRole('button', { name: /create workspace/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please correct the highlighted fields.')
    expect(screen.getByText('That email is already registered.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})

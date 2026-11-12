import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '../../auth/auth.context'
import { AppShell } from './AppShell'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderAppShell(initialEntry = '/app/investor') {
  const authValue: AuthContextValue = {
    state: {
      status: 'authenticated',
      user: { id: 1, email: 'investor1@trial.com', role: 'INVESTOR' },
      error: null,
    },
    user: { id: 1, email: 'investor1@trial.com', role: 'INVESTOR' },
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    withCsrf: vi.fn(),
    refreshSession: vi.fn(),
  }

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthContext.Provider value={authValue}>
        <Routes>
          <Route path="/" element={<p>landing-page</p>} />
          <Route path="/app" element={<AppShell />}>
            <Route path="investor" element={<p>investor-overview</p>} />
            <Route path="investor/discover" element={<p>investor-discover</p>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders the workspace navigation inside the topbar Menu dropdown and closes on Escape or selection', async () => {
    const user = userEvent.setup()
    renderAppShell()

    expect(screen.queryByRole('navigation', { name: /investor navigation/i })).not.toBeInTheDocument()

    const menuTrigger = screen.getByRole('button', { name: /menu/i })
    expect(menuTrigger.querySelectorAll('svg')).toHaveLength(1)
    expect(document.querySelector('.app-header .brand')).toBeInTheDocument()
    expect(document.querySelector('.app-subbar button')).toBe(menuTrigger)
    expect(document.querySelector('.user-menu .footer-status-pill')).toHaveTextContent('Investor')

    await user.click(menuTrigger)

    expect(screen.getByRole('heading', { name: 'Investor workspace' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /investor navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /discover startups/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: /investor navigation/i })).not.toBeInTheDocument()

    await user.click(menuTrigger)
    await user.click(screen.getByRole('link', { name: /discover startups/i }))
    expect(screen.getByText('investor-discover')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: /investor navigation/i })).not.toBeInTheDocument()
  })

  it('opens the full-height left drawer seamlessly on hover and closes when leaving', async () => {
    const user = userEvent.setup()
    renderAppShell()

    const menuTrigger = screen.getByRole('button', { name: /menu/i })
    await user.hover(menuTrigger)

    expect(screen.getByRole('navigation', { name: /investor navigation/i })).toBeInTheDocument()
  })

  it('navigates back to the landing page when clicking the Stashh logo from any workspace page', async () => {
    const user = userEvent.setup()
    renderAppShell('/app/investor/discover')

    expect(screen.getByText('investor-discover')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /stashh home/i }))
    expect(screen.getByText('landing-page')).toBeInTheDocument()
  })
})


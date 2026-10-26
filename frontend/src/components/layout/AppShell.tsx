import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { roleLabel } from '../../auth/auth.types'
import { useAuth } from '../../auth/useAuth'

type NavItem = {
  label: string
  to: string
  detail: string
}

const navigation: Record<'STARTUP' | 'INVESTOR' | 'ADMIN', NavItem[]> = {
  STARTUP: [
    { label: 'Overview', to: '/app/startup', detail: 'Workspace pulse' },
    { label: 'Company profile', to: '/app/startup/profile', detail: 'Tell your story' },
    { label: 'Fundraising', to: '/app/startup/fundraising', detail: 'Round readiness' },
    { label: 'Investor interest', to: '/app/startup/interests', detail: 'Continue the conversation' },
  ],
  INVESTOR: [
    { label: 'Overview', to: '/app/investor', detail: 'Portfolio pulse' },
    { label: 'Discover startups', to: '/app/investor/discover', detail: 'Find the signal' },
    { label: 'Saved watchlist', to: '/app/investor/watchlist', detail: 'Theses & introductions' },
    { label: 'Portfolio', to: '/app/investor/portfolio', detail: 'Track positions' },
  ],
  ADMIN: [
    { label: 'Overview', to: '/app/admin', detail: 'Platform pulse' },
    { label: 'Review queue', to: '/app/admin/reviews', detail: 'Keep quality high' },
    { label: 'Fundraising pools', to: '/app/admin/fundraising', detail: 'Control round access' },
    { label: 'Valuation snapshots', to: '/app/admin/valuations', detail: 'Explain portfolio math' },
    { label: 'Platform users', to: '/app/admin/users', detail: 'People and roles' },
  ],
}

export function AppShell() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user) return null

  const items = navigation[user.role]
  const initials = user.email.slice(0, 1).toUpperCase()

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="app-frame">
      <header className="app-header">
        <Link className="brand" to="/app" aria-label="Ventureline workspace home">
          <span className="brand-mark">V</span>
          <span>Ventureline</span>
        </Link>
        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="workspace-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
        <div className="user-menu">
          <div className="user-avatar" aria-hidden="true">{initials}</div>
          <div className="user-meta">
            <strong>{user.email}</strong>
            <span>{roleLabel(user.role)} account</span>
          </div>
          <button className="text-button" type="button" onClick={() => void handleLogout()} disabled={loggingOut}>
            {loggingOut ? 'Leaving…' : 'Log out'}
          </button>
        </div>
      </header>
      <div className="app-body">
        <aside id="workspace-navigation" className={`side-nav ${mobileOpen ? 'side-nav-open' : ''}`}>
          <div className="side-nav-intro">
            <span className="eyebrow">Your workspace</span>
            <p>One focused place to take the next right step.</p>
          </div>
          <nav aria-label={`${roleLabel(user.role)} navigation`}>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === `/app/${user.role.toLowerCase()}`}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                <small>{item.detail}</small>
              </NavLink>
            ))}
          </nav>
          <div className="side-nav-footer">
            <span className="status-dot" aria-hidden="true" />
            <span>Secure session active</span>
          </div>
        </aside>
        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

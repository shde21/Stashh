import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { roleLabel } from '../../auth/auth.types'
import { useAuth } from '../../auth/useAuth'
import { Button, ThemeToggle } from '../../design-system'
import {
  Compass,
  FileText,
  FolderGit2,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  ShieldAlert,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  label: string
  to: string
  detail: string
  icon: LucideIcon
}

const navigation: Record<'STARTUP' | 'INVESTOR' | 'ADMIN', NavItem[]> = {
  STARTUP: [
    { label: 'Overview', to: '/app/startup', detail: 'Workspace pulse', icon: LayoutDashboard },
    { label: 'Company profile', to: '/app/startup/profile', detail: 'Tell your story', icon: FileText },
    { label: 'Fundraising', to: '/app/startup/fundraising', detail: 'Round readiness', icon: FolderGit2 },
    { label: 'Investor interest', to: '/app/startup/interests', detail: 'Conversations queue', icon: Inbox },
  ],
  INVESTOR: [
    { label: 'Overview', to: '/app/investor', detail: 'Portfolio pulse', icon: LayoutDashboard },
    { label: 'Discover startups', to: '/app/investor/discover', detail: 'Find the signal', icon: Compass },
    { label: 'Saved watchlist', to: '/app/investor/watchlist', detail: 'Theses & introductions', icon: Inbox },
    { label: 'Portfolio', to: '/app/investor/portfolio', detail: 'Track positions', icon: PieChart },
  ],
  ADMIN: [
    { label: 'Overview', to: '/app/admin', detail: 'Platform pulse', icon: LayoutDashboard },
    { label: 'Review queue', to: '/app/admin/reviews', detail: 'Keep quality high', icon: ShieldAlert },
    { label: 'Fundraising pools', to: '/app/admin/fundraising', detail: 'Control round access', icon: Layers },
    { label: 'Valuation snapshots', to: '/app/admin/valuations', detail: 'Explain portfolio math', icon: PieChart },
    { label: 'Platform users', to: '/app/admin/users', detail: 'People and roles', icon: Users },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link className="brand" to="/app" aria-label="Stashh workspace home">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>Stashh</span>
          </Link>
          <span
            style={{
              fontSize: 'var(--font-caption)',
              fontWeight: 'var(--weight-medium)',
              padding: '3px 10px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
            }}
          >
            {roleLabel(user.role)}
          </span>
        </div>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="workspace-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          style={{ minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {mobileOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          <span style={{ marginLeft: '4px' }}>{mobileOpen ? 'Close' : 'Menu'}</span>
        </button>

        <div className="user-menu">
          <ThemeToggle />
          <div className="user-avatar" aria-hidden="true">{initials}</div>
          <div className="user-meta">
            <strong>{user.email}</strong>
            <span>{roleLabel(user.role)} account</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            leftIcon={<LogOut size={14} strokeWidth={1.75} />}
            style={{ minHeight: '44px' }}
          >
            {loggingOut ? 'Leaving…' : 'Log out'}
          </Button>
        </div>
      </header>

      <div className="app-body">
        <aside id="workspace-navigation" className={`side-nav ${mobileOpen ? 'side-nav-open' : ''}`}>
          <div className="side-nav-intro">
            <span className="eyebrow">{roleLabel(user.role)} workspace</span>
            <p>One focused place to take the next right step.</p>
          </div>

          <nav aria-label={`${roleLabel(user.role)} navigation`}>
            {items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === `/app/${user.role.toLowerCase()}`}
                  className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                  style={{ minHeight: '44px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)' }}
                >
                  <Icon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{item.label}</span>
                    <small>{item.detail}</small>
                  </div>
                </NavLink>
              )
            })}
          </nav>

          <div className="side-nav-footer">
            <span className="status-dot" aria-hidden="true" />
            <span>Secure session active</span>
          </div>
        </aside>

        <main className="workspace-content">
          <Outlet />

          <footer className="simulation-disclaimer" role="contentinfo">
            Stashh is an educational simulation platform. Company-specific equity share allocations and valuations are simulated for educational evaluation. No real capital or securities are transferred.
          </footer>
        </main>
      </div>
    </div>
  )
}

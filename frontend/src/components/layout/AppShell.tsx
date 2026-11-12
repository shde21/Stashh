import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { roleLabel } from '../../auth/auth.types'
import { useAuth } from '../../auth/useAuth'
import { Button, ThemeToggle, ErrorBoundary } from '../../design-system'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const leaveTimerRef = useRef<number | null>(null)
  const hoverOpenedAtRef = useRef<number>(0)

  function clearLeaveTimer() {
    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }

  function handleMenuEnter() {
    clearLeaveTimer()
    if (!menuOpen) {
      hoverOpenedAtRef.current = Date.now()
      setMenuOpen(true)
    }
  }

  function handleMenuLeave() {
    clearLeaveTimer()
    leaveTimerRef.current = window.setTimeout(() => {
      setMenuOpen(false)
    }, 250)
  }

  function handleTriggerClick() {
    clearLeaveTimer()
    if (menuOpen && Date.now() - hoverOpenedAtRef.current < 150) {
      return
    }
    setMenuOpen((open) => !open)
  }

  useEffect(() => {
    return () => clearLeaveTimer()
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

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
      <div className="app-chrome-top">
        <header className="app-header">
          <div className="app-header-inner">
            <Link className="brand" to="/" aria-label="Stashh home">
              <span className="brand-mark" aria-hidden="true">S</span>
              <span>Stashh</span>
            </Link>

            <div className="user-menu">
              <span className="footer-status-pill">
                {roleLabel(user.role)}
              </span>
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
          </div>
        </header>

        <div className="app-subbar">
          <div className="app-subbar-inner">
            <div
              className="workspace-menu-wrap"
              ref={menuRef}
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <button
                className={`workspace-menu-trigger ${menuOpen ? 'is-open' : ''}`}
                type="button"
                aria-expanded={menuOpen}
                aria-controls="workspace-navigation"
                onClick={handleTriggerClick}
              >
                <Menu size={16} strokeWidth={2} className="workspace-menu-trigger-icon" aria-hidden="true" />
                <span>Menu</span>
              </button>

              {menuOpen && (
                <aside
                  id="workspace-navigation"
                  className="workspace-menu-drawer"
                  aria-label={`${roleLabel(user.role)} menu`}
                  onMouseEnter={handleMenuEnter}
                  onMouseLeave={handleMenuLeave}
                >
                  <div className="workspace-menu-header">
                    <h2 className="workspace-menu-title">{roleLabel(user.role)} workspace</h2>
                    <p>One focused place to take the next right step.</p>
                  </div>

                  <nav className="workspace-menu-nav" aria-label={`${roleLabel(user.role)} navigation`}>
                    {items.map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === `/app/${user.role.toLowerCase()}`}
                          className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                          onClick={() => {
                            clearLeaveTimer()
                            setMenuOpen(false)
                          }}
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

                  <div className="workspace-menu-footer">
                    <span className="status-dot" aria-hidden="true" />
                    <span>Secure session active</span>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="app-body">
        <main className="workspace-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>

          <footer className="simulation-disclaimer" role="contentinfo">
            Stashh is an educational simulation platform. Company-specific equity share allocations and valuations are simulated for educational evaluation. No real capital or securities are transferred.
          </footer>
        </main>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ThemeToggle } from '../../design-system/ThemeToggle'

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="auth-page" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 'var(--space-6)', right: 'var(--space-6)' }}>
        <ThemeToggle />
      </div>
      <div className="auth-panel">
        <Link className="auth-brand-center" to="/" aria-label="stashh home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>stashh</span>
        </Link>
        <div className="auth-panel-inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </div>
    </main>
  )
}

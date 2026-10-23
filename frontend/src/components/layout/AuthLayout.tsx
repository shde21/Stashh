import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function AuthLayout({ eyebrow, title, description, children, footer }: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="auth-page">
      <div className="auth-visual" aria-hidden="true">
        <div className="visual-grid" />
        <div className="visual-orb visual-orb-one" />
        <div className="visual-orb visual-orb-two" />
        <Link className="auth-brand" to="/">
          <span className="brand-mark">V</span>
          <span>Ventureline</span>
        </Link>
        <div className="visual-note">
          <span>Ventureline / 02</span>
          <strong>Make the next move with a clearer view.</strong>
        </div>
      </div>
      <section className="auth-panel" aria-labelledby="auth-title">
        <Link className="mobile-auth-brand" to="/">
          <span className="brand-mark">V</span>
          <span>Ventureline</span>
        </Link>
        <div className="auth-panel-inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  )
}

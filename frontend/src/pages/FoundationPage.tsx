import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPlatformStatus, type PlatformStatus } from '../lib/api'

type ViewState =
  | { kind: 'loading' }
  | { kind: 'ready'; status: PlatformStatus }
  | { kind: 'error'; message: string }

export default function FoundationPage() {
  const [viewState, setViewState] = useState<ViewState>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchPlatformStatus(controller.signal)
      .then((status) => setViewState({ kind: 'ready', status }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setViewState({
          kind: 'error',
          message: error instanceof Error ? error.message : 'The platform status could not be loaded.',
        })
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="shell public-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="Ventureline home">
          <span className="brand-mark" aria-hidden="true">V</span>
          <span>Ventureline</span>
        </Link>
        <div className="public-actions">
          <Link className="quiet-link" to="/login">Log in</Link>
          <Link className="button button-small" to="/register">Create account</Link>
        </div>
      </nav>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">A clearer way to move capital</p>
          <h1 id="page-title">Build conviction before you build complexity.</h1>
          <p className="hero-summary">
            Ventureline connects ambitious companies with thoughtful investors through clear data,
            transparent simulated commitments, and a workflow designed to grow with the product.
          </p>
          <div className="hero-actions" aria-label="Get started">
            <Link className="button" to="/register?role=STARTUP">I’m building a company <span>↗</span></Link>
            <Link className="button button-secondary" to="/register?role=INVESTOR">I’m exploring opportunities <span>↗</span></Link>
          </div>
        </div>

        <aside className="status-card" aria-labelledby="status-title">
          <div className="status-card-header">
            <div>
              <p className="eyebrow">Live foundation check</p>
              <h2 id="status-title">Connected core</h2>
            </div>
            <span className={`pulse ${viewState.kind === 'error' ? 'pulse-error' : ''}`} aria-hidden="true" />
          </div>
          {viewState.kind === 'loading' && <p className="status-message" role="status">Connecting to the platform API…</p>}
          {viewState.kind === 'error' && (
            <div className="status-error" role="alert">
              <strong>Connection unavailable</strong>
              <span>{viewState.message}</span>
              <small>Start PostgreSQL and the Spring Boot API, then refresh this page.</small>
            </div>
          )}
          {viewState.kind === 'ready' && (
            <dl className="status-list">
              <div><dt>API service</dt><dd>{viewState.status.service}</dd></div>
              <div><dt>Database</dt><dd><span className="inline-status">●</span>{viewState.status.database}</dd></div>
              <div><dt>Migration</dt><dd>v{viewState.status.migrationVersion}</dd></div>
            </dl>
          )}
        </aside>
      </section>

      <section className="foundation-grid" aria-label="Platform principles">
        <article className="capability-card">
          <span className="card-index">01</span>
          <h2>For companies with a point of view</h2>
          <p>Shape a company profile, make progress legible, and keep your fundraising story in one workspace.</p>
        </article>
        <article className="capability-card accent-card">
          <span className="card-index">02</span>
          <h2>For investors who value the signal</h2>
          <p>Discover opportunities with context, not noise, and build an illustrative portfolio as the platform grows.</p>
        </article>
        <article className="capability-card">
          <span className="card-index">03</span>
          <h2>For a platform that stays accountable</h2>
          <p>Role-aware access, audit-friendly workflows, and calculations that explain themselves from the start.</p>
        </article>
      </section>

      <footer className="footer">
        <span>Ventureline · stage 6 simulated marketplace</span>
        <span>Designed for clarity before complexity.</span>
      </footer>
    </main>
  )
}

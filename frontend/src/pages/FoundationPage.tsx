import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPlatformStatus, type PlatformStatus } from '../lib/api'
import { Badge, Button, Card, ProgressBar, Stat, StatusPill, ThemeToggle } from '../design-system'
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react'

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
    <div className="shell public-shell">
      {/* Top Navigation */}
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="stashh home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>stashh</span>
        </Link>
        <div className="public-actions">
          <ThemeToggle />
          <Link className="quiet-link" to="/login">Sign in</Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Section 1: Hero */}
        <section className="hero" aria-labelledby="hero-title" style={{ padding: 'var(--space-8) 0' }}>
          <div className="hero-copy">
            <p className="eyebrow">Simulated Capital Marketplace</p>
            <h1 id="hero-title">Invest and raise with precision.</h1>
            <p className="hero-summary">
              A calm, trustworthy investment environment where startups publish verified metrics and investors evaluate company-specific equity shares.
            </p>
            <div className="hero-actions" aria-label="Get started">
              <Link to="/register?role=STARTUP">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={1.75} />}>
                  Raise capital
                </Button>
              </Link>
              <Link to="/register?role=INVESTOR">
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={1.75} />}>
                  Explore opportunities
                </Button>
              </Link>
            </div>
          </div>

          {/* Connected Core Platform Status */}
          <aside className="status-card" aria-labelledby="status-title">
            <div className="status-card-header">
              <div>
                <p className="eyebrow">Live platform status</p>
                <h2 id="status-title" style={{ fontSize: 'var(--font-h3)', margin: 0 }}>Connected core</h2>
              </div>
              <span className={`pulse ${viewState.kind === 'error' ? 'pulse-error' : ''}`} aria-hidden="true" />
            </div>

            {viewState.kind === 'loading' && (
              <p className="status-message" role="status" style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)' }}>
                Connecting to the platform API…
              </p>
            )}

            {viewState.kind === 'error' && (
              <div className="status-error" role="alert">
                <strong>Connection unavailable</strong>
                <span>{viewState.message}</span>
                <small>Start PostgreSQL and the Spring Boot API, then refresh this page.</small>
              </div>
            )}

            {viewState.kind === 'ready' && (
              <dl className="status-list">
                <div>
                  <dt>API service</dt>
                  <dd>{viewState.status.service}</dd>
                </div>
                <div>
                  <dt>Database</dt>
                  <dd>
                    <span className="inline-status">●</span>
                    {viewState.status.database}
                  </dd>
                </div>
                <div>
                  <dt>Migration</dt>
                  <dd>v{viewState.status.migrationVersion}</dd>
                </div>
              </dl>
            )}
          </aside>
        </section>

        {/* Section 2: Real UI Product Preview */}
        <section aria-labelledby="preview-title" style={{ marginBottom: 'var(--space-16)' }}>
          <p className="eyebrow" id="preview-title">Product preview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span className="eyebrow" style={{ margin: 0 }}>Climate software · Seed</span>
                <StatusPill status="OPEN" />
              </div>
              <h3 style={{ margin: '0 0 var(--space-1) 0' }}>CarbonGrid Technologies</h3>
              <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Autonomous energy management for distributed enterprise grids.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-4)' }}>
                <Stat label="Target" value="₹2.5 Cr" />
                <Stat label="Committed" value="₹1.95 Cr" />
                <Stat label="Valuation cap" value="₹25 Cr" />
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                  <span>78% capacity filled</span>
                  <span>5,500 shares remaining</span>
                </div>
                <ProgressBar value={78} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
                <Badge variant="neutral">Equity Shares</Badge>
                <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>Simulated allocation</span>
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span className="eyebrow" style={{ margin: 0 }}>Simulated Portfolio</span>
                <Badge variant="positive">Active</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <Stat label="Total Committed" value="₹15,00,000" subtext="15,000 shares" />
                <Stat
                  label="Illustrative Value"
                  value="₹18,75,000"
                  delta={{ value: '+25.0%', type: 'positive' }}
                />
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-small)', color: 'var(--text)' }}>
                  <TrendingUp size={16} strokeWidth={1.75} style={{ color: 'var(--positive)' }} />
                  <span>Portfolio math is deterministic and verifiable</span>
                </div>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                  Gains reflect updated valuation snapshots and valuation caps.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 3: How it Works (3 clean rows) */}
        <section aria-labelledby="how-it-works-title" style={{ marginBottom: 'var(--space-16)' }}>
          <p className="eyebrow" id="how-it-works-title">Operating Model</p>
          <h2 style={{ marginBottom: 'var(--space-8)' }}>How stashh works</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--font-h2)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)' }}>01</span>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)' }}>For Startups</h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                  Publish stage-aware metrics, set transparent round terms, and manage simulated investor commitments in an auditable workspace.
                </p>
              </div>
            </Card>

            <Card style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--font-h2)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)' }}>02</span>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)' }}>For Investors</h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                  Filter approved opportunities by sector and stage, maintain private thesis notes, and simulate equity investments without real capital transfers.
                </p>
              </div>
            </Card>

            <Card style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--font-h2)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)' }}>03</span>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)' }}>For Administrators</h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                  Review submissions with required structured feedback, govern platform visibility, and record reference valuation snapshots.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 4: Simulation Disclaimer & Footer */}
        <section aria-label="Simulation compliance notice" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <ShieldCheck size={18} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
            <strong style={{ fontSize: 'var(--font-small)' }}>Simulated Environment</strong>
          </div>
          <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            stashh is a simulation and workflow platform. All equity shares, valuations, and commitments are simulated. Nothing on this platform involves real currency, real securities, or financial advice.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="brand-mark" style={{ width: '20px', height: '20px', fontSize: '10px' }}>S</span>
          <span>stashh</span>
        </div>
        <span>Simulation platform · Designed for clarity and trust.</span>
      </footer>
    </div>
  )
}

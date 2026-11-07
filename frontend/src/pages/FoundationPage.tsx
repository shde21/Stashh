import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPlatformStatus, type PlatformStatus } from '../lib/api'
import { Badge, Button, ProgressBar, Stat, StatusPill, ThemeToggle } from '../design-system'
import { ArrowRight, ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react'
import { LandingTorchReveal, InteractiveStartupTorchGrid } from '../components/layout/LandingTorchReveal'
import { GrowwInteractiveCard } from '../components/layout/GrowwInteractiveCard'

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
    <LandingTorchReveal>
      <div className="shell public-shell">
      {/* Top Navigation */}
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="Stashh home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>Stashh</span>
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
        <section className="hero" aria-labelledby="hero-title" style={{ padding: 'var(--space-8) 0 var(--space-12) 0' }}>
          <div className="hero-copy">
            {/* Groww-style live badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 12px', borderRadius: '999px', backgroundColor: 'rgba(0, 208, 156, 0.08)', border: '1px solid rgba(0, 208, 156, 0.25)', marginBottom: 'var(--space-4)', width: 'fit-content' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
              <span style={{ fontSize: '12px', fontWeight: 'var(--weight-semibold)', color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Live Simulated Marketplace · Verified Equity
              </span>
            </div>

            <h1 id="hero-title" style={{ fontSize: 'clamp(2.4rem, 4.8vw, 3.6rem)', lineHeight: 1.15, fontWeight: 'var(--weight-bold)', letterSpacing: '-0.03em', margin: '0 0 var(--space-4) 0' }}>
              Invest and raise with{' '}
              <span style={{ background: 'linear-gradient(135deg, #00D09C 0%, #00B588 50%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                algorithmic precision.
              </span>
            </h1>

            <p className="hero-summary" style={{ fontSize: 'var(--font-h3)', lineHeight: 'var(--lh-h3)', color: 'var(--text-secondary)', margin: '0 0 var(--space-6) 0' }}>
              A calm, trustworthy investment environment where startups publish verified metrics and investors evaluate company-specific equity shares.
            </p>

            <div className="hero-actions" aria-label="Get started" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
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

            {/* Quick trust metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 'var(--font-h3)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>₹25+ Cr</strong>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Simulated pipeline</p>
              </div>
              <div>
                <strong style={{ fontSize: 'var(--font-h3)', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>0%</strong>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Capital risk</p>
              </div>
              <div>
                <strong style={{ fontSize: 'var(--font-h3)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>100%</strong>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Deterministic cap math</p>
              </div>
            </div>
          </div>

          {/* Connected Core Platform Status */}
          <GrowwInteractiveCard
            className="status-card"
            enableTilt={true}
            enableGlare={true}
            style={{ borderRadius: 'var(--radius-lg)' }}
            contentStyle={{ padding: 0 }}
            aria-labelledby="status-title"
          >
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
          </GrowwInteractiveCard>
        </section>

        {/* Section 2: Interactive Startup Torch Showcase */}
        <section aria-labelledby="startups-title" style={{ marginBottom: 'var(--space-16)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <p className="eyebrow" id="startups-title">Platform Ecosystem · Torch Reveal</p>
              <h2 style={{ fontSize: 'var(--font-h2)', margin: 'var(--space-1) 0 0 0' }}>Verified platform startups</h2>
            </div>
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              Hover over cards to illuminate geometric insignias and cap terms
            </span>
          </div>
          <InteractiveStartupTorchGrid />
        </section>

        {/* Section 3: Real UI Product Preview */}
        <section aria-labelledby="preview-title" style={{ marginBottom: 'var(--space-16)' }}>
          <p className="eyebrow" id="preview-title">Product preview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            {/* Candidate A & C: Groww 3D Tilt Card with Sliding Clip Reveal */}
            <GrowwInteractiveCard
              className="vl-card groww-clip-reveal"
              contentStyle={{ padding: 'var(--space-6)' }}
            >
              <div className="groww-clip-overlay" aria-hidden="true" />
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
            </GrowwInteractiveCard>

            {/* Candidate A & C: Groww 3D Tilt Card with Sliding Clip Reveal */}
            <GrowwInteractiveCard
              className="vl-card groww-clip-reveal"
              contentStyle={{ padding: 'var(--space-6)' }}
            >
              <div className="groww-clip-overlay" aria-hidden="true" />
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
            </GrowwInteractiveCard>
          </div>
        </section>

        {/* Section 4: How it Works (3 clean rows with subtle 3D tilt) */}
        <section aria-labelledby="how-it-works-title" style={{ marginBottom: 'var(--space-16)' }}>
          <p className="eyebrow" id="how-it-works-title">Operating Model</p>
          <h2 style={{ marginBottom: 'var(--space-8)' }}>How Stashh works</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <GrowwInteractiveCard
              className="vl-card"
              contentStyle={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6)' }}
            >
              <span style={{ fontSize: 'var(--font-h2)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)' }}>01</span>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)' }}>For Startups</h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                  Publish stage-aware metrics, set transparent round terms, and manage simulated investor commitments in an auditable workspace.
                </p>
              </div>
            </GrowwInteractiveCard>

            <GrowwInteractiveCard
              className="vl-card"
              contentStyle={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6)' }}
            >
              <span style={{ fontSize: 'var(--font-h2)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)' }}>02</span>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)' }}>For Investors</h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                  Filter approved opportunities by sector and stage, maintain private thesis notes, and simulate equity investments without real capital transfers.
                </p>
              </div>
            </GrowwInteractiveCard>

            <GrowwInteractiveCard
              className="vl-card"
              contentStyle={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6)' }}
            >
              <span style={{ fontSize: 'var(--font-h2)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)' }}>03</span>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)' }}>For Administrators</h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                  Review submissions with required structured feedback, govern platform visibility, and record reference valuation snapshots.
                </p>
              </div>
            </GrowwInteractiveCard>
          </div>
        </section>

        {/* Section 5: Simulation Disclaimer & Footer */}
        <section aria-label="Simulation compliance notice" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <ShieldCheck size={18} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
            <strong style={{ fontSize: 'var(--font-small)' }}>Simulated Environment</strong>
          </div>
          <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Stashh is a simulation and workflow platform. All equity shares, valuations, and commitments are simulated. Nothing on this platform involves real currency, real securities, or financial advice.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="brand-mark" style={{ width: '20px', height: '20px', fontSize: '10px' }}>S</span>
          <span>Stashh</span>
        </div>
        <span>Simulation platform · Designed for clarity and trust.</span>
      </footer>
    </div>
    </LandingTorchReveal>
  )
}

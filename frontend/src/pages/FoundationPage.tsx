import { Link } from 'react-router-dom'
import { Button, ThemeToggle } from '../design-system'
import { ArrowRight } from 'lucide-react'

export default function FoundationPage() {
  return (
    <div className="shell public-shell">
      {/* Top Navigation */}
      <header className="landing-header">
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

        {/* Sub-navigation bar with 4 hover dropdown blocks */}
        <div className="subbar" aria-label="Secondary navigation">
          <div className="subbar-items">
            {/* 1. Investor */}
            <div className="subbar-item">
              <button type="button" className="subbar-trigger" aria-haspopup="true">
                <span>Investor</span>
              </button>
              <div className="subbar-dropdown" role="region" aria-label="Investor options">
                <div className="subbar-dropdown-list">
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Discover Startups</span>
                    <span className="subbar-dropdown-desc">Browse vetted deals</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Watchlist</span>
                    <span className="subbar-dropdown-desc">Track target companies</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Portfolio</span>
                    <span className="subbar-dropdown-desc">Holdings & returns</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Syndicate Rounds</span>
                    <span className="subbar-dropdown-desc">Co-invest with peers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Startup */}
            <div className="subbar-item">
              <button type="button" className="subbar-trigger" aria-haspopup="true">
                <span>Startup</span>
              </button>
              <div className="subbar-dropdown" role="region" aria-label="Startup options">
                <div className="subbar-dropdown-list">
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Company Profile</span>
                    <span className="subbar-dropdown-desc">Pitch & metrics</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Fundraising Round</span>
                    <span className="subbar-dropdown-desc">Manage live raise</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Investor Pipeline</span>
                    <span className="subbar-dropdown-desc">Track inbound interest</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Valuation Model</span>
                    <span className="subbar-dropdown-desc">Simulated equity terms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Explore */}
            <div className="subbar-item">
              <button type="button" className="subbar-trigger" aria-haspopup="true">
                <span>Explore</span>
              </button>
              <div className="subbar-dropdown" role="region" aria-label="Explore options">
                <div className="subbar-dropdown-list">
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Market Directory</span>
                    <span className="subbar-dropdown-desc">Browse all sectors</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Trending Deals</span>
                    <span className="subbar-dropdown-desc">Fast-filling rounds</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Valuation Benchmarks</span>
                    <span className="subbar-dropdown-desc">Industry multiples</span>
                  </div>
                  <div className="subbar-dropdown-item">
                    <span className="subbar-dropdown-title">Platform Ecosystem</span>
                    <span className="subbar-dropdown-desc">How Stashh works</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Help */}
            <div className="subbar-item">
              <button type="button" className="subbar-trigger" aria-haspopup="true">
                <span>Help</span>
              </button>
              <div className="subbar-dropdown" role="region" aria-label="Help options">
                <div className="subbar-dropdown-list">
                  <div className="subbar-dropdown-simple-item">Raise Query</div>
                  <div className="subbar-dropdown-simple-item">My Queries</div>
                  <div className="subbar-dropdown-simple-item">FAQs</div>
                  <div className="subbar-dropdown-simple-item">Report an Issue</div>
                  <div className="subbar-dropdown-simple-item">Platform Guidelines</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Section 1: Hero */}
        <section className="hero" aria-labelledby="hero-title" style={{ padding: 'var(--space-8) 0', gridTemplateColumns: '1fr', maxWidth: '780px' }}>
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
        </section>
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="brand-mark" style={{ width: '20px', height: '20px', fontSize: '10px' }}>S</span>
          <span>Stashh</span>
        </div>
      </footer>
    </div>
  )
}

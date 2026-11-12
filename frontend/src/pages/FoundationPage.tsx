import { useState, useRef, useEffect, useContext, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, ThemeToggle, formatCompactINR } from '../design-system'
import { apiRequest } from '../lib/api'
import { AuthContext } from '../auth/auth.context'
import type { UserRole } from '../auth/auth.types'
import { AuthModal, type AuthModalMode } from '../components/auth/AuthModal'
import { 
  ArrowRight, 
  ChevronDown, 
  ShieldCheck, 
  Layers, 
  Lock,
  FileText,
  CheckCircle2,
  Activity
} from 'lucide-react'

type PlatformPublicMetrics = {
  totalCapitalCommitted: number
  activeStartupsCount: number
  activeRoundsCount: number
  activeCommitmentsCount: number
}

export interface FoundationPageProps {
  initialAuthMode?: AuthModalMode | null
}

export default function FoundationPage({ initialAuthMode = null }: FoundationPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useContext(AuthContext)

  const queryRole = new URLSearchParams(location.search).get('role')
  const [authMode, setAuthMode] = useState<AuthModalMode | null>(initialAuthMode)
  const [authRole, setAuthRole] = useState<UserRole>(queryRole === 'INVESTOR' ? 'INVESTOR' : 'STARTUP')
  const redirectTo = typeof location.state?.from === 'string' ? location.state.from : '/app'

  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode)
    }
  }, [initialAuthMode])

  useEffect(() => {
    if (queryRole === 'INVESTOR' || queryRole === 'STARTUP') {
      setAuthRole(queryRole)
    }
  }, [queryRole])

  // Mega menu state with leave delay so moving cursor to menu never collapses
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuTimerRef = useRef<number | null>(null)

  const handleMouseEnter = (menuName: string) => {
    if (menuTimerRef.current) {
      window.clearTimeout(menuTimerRef.current)
      menuTimerRef.current = null
    }
    setActiveMenu(menuName)
  }

  const handleMouseLeave = () => {
    if (menuTimerRef.current) {
      window.clearTimeout(menuTimerRef.current)
    }
    menuTimerRef.current = window.setTimeout(() => {
      setActiveMenu(null)
    }, 250)
  }

  const openAuthFromClick = (
    event: MouseEvent<HTMLAnchorElement>,
    mode: AuthModalMode,
    role: UserRole = 'STARTUP',
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    if (auth?.isAuthenticated) {
      navigate('/app')
      return
    }
    setActiveMenu(null)
    setAuthRole(role)
    setAuthMode(mode)
  }

  const handleCloseAuthModal = () => {
    setAuthMode(null)
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/', { replace: true })
    }
  }

  const handleSwitchAuthMode = (nextMode: AuthModalMode) => {
    setAuthMode(nextMode)
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate(nextMode === 'login' ? '/login' : '/register', {
        replace: true,
        state: location.state,
      })
    }
  }

  // Live dynamic platform metrics from backend
  const [metrics, setMetrics] = useState<PlatformPublicMetrics>({
    totalCapitalCommitted: 0,
    activeStartupsCount: 0,
    activeRoundsCount: 0,
    activeCommitmentsCount: 0,
  })
  const hasFetchedMetricsRef = useRef(false)

  useEffect(() => {
    if (authMode !== null || hasFetchedMetricsRef.current) return
    hasFetchedMetricsRef.current = true
    let isMounted = true
    apiRequest<PlatformPublicMetrics>('/api/v1/platform/metrics')
      .then((data) => {
        if (isMounted && data) {
          setMetrics({
            totalCapitalCommitted: Number(data.totalCapitalCommitted) || 0,
            activeStartupsCount: Number(data.activeStartupsCount) || 0,
            activeRoundsCount: Number(data.activeRoundsCount) || 0,
            activeCommitmentsCount: Number(data.activeCommitmentsCount) || 0,
          })
        }
      })
      .catch((err) => {
        console.warn('Live platform metrics unavailable, using baseline data:', err)
      })
    return () => {
      isMounted = false
    }
  }, [authMode])

  // Interactive lifecycle execution flow state
  const [activeStage, setActiveStage] = useState<number>(0)

  // Interactive FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Structured Platform Execution Lifecycle (Onboarding -> Authentication -> Discovery -> Investment)
  const lifecycleSteps = [
    {
      step: '01',
      name: 'Onboarding',
      badge: 'Step 01 • Incorporation & Setup',
      title: 'Corporate Incorporation & Cap Table Architecture',
      description: 'Founders submit legal incorporation filings, define authorized share capital, and establish mathematical equity reserves with database-enforced integrity.',
      focus: 'Foundational Equity Architecture',
      deliverable: '100% Invariant Cap Table',
      coordX: 80,
      coordY: 180,
    },
    {
      step: '02',
      name: 'Authentication',
      badge: 'Step 02 • Legal Due Diligence',
      title: 'Administrative Verification & Platform Authorization',
      description: 'Corporate filings, certified capitalization ledgers, and financial projections are scrutinized and verified by platform administration before any raise opens.',
      focus: 'Administrative Review & Validation',
      deliverable: 'Admin-Verified Corporate Status',
      coordX: 320,
      coordY: 135,
    },
    {
      step: '03',
      name: 'Discovery',
      badge: 'Step 03 • Market Diligence',
      title: 'Direct Marketplace Diligence & Investor Pipelines',
      description: 'Qualified investors discover verified companies, inspect validated legal documents, record private investment theses, and submit formal expressions of interest.',
      focus: 'Transparent Discovery & Diligence',
      deliverable: 'Unmediated Venture Pipelines',
      coordX: 560,
      coordY: 85,
    },
    {
      step: '04',
      name: 'Investment',
      badge: 'Step 04 • Capital Allocation',
      title: 'Direct Share Allocation & Transparent Compounding',
      description: 'Investors allocate capital into whole, discrete company shares. Every commitment directly updates capitalization pools and feeds immutable valuation history.',
      focus: 'Precision Equity Allocation',
      deliverable: 'Direct Share Ledgers & Returns',
      coordX: 820,
      coordY: 30,
    },
  ]

  const faqs = [
    {
      q: 'How do startups get approved on Stashh?',
      a: 'When a company registers, it submits its official legal incorporation documents, verified capitalization records, projected valuations, and corporate credentials. Our platform administration reviews and verifies these legal documents to confirm the company\'s authentic legal existence and legitimacy. Only upon complete administrative verification and approval does the admin grant platform authorization for the company to raise capital.',
    },
    {
      q: 'How does the fundraising and investment process work?',
      a: 'Verified founders configure their fundraising target, valuation basis, and available equity pool in Indian Rupees. Qualified investors can discover vetted companies, review their verified legal documentation and capitalization tables, and submit direct investment commitments.',
    },
    {
      q: 'Will payments and capital transactions be processed directly on the platform?',
      a: 'Yes. Stashh is actively integrating secure payment gateways to enable direct transactional commitments, escrow handling, and streamlined allocations directly between verified founders and investors.',
    },
    {
      q: 'How can founders manage their capitalization and investor relations?',
      a: 'Founders receive a centralized workspace to manage authorized, issued, and reserved shares, monitor inbound investor interest, update corporate documents, and communicate with verified backers.',
    },
  ]

  return (
    <div className="landing-page-root">
      {/* Full-Width Seamless Pinned Top Navigation - Zero separating line, smoothly merged into canvas */}
      <header className="landing-header">
        <nav className="topbar" aria-label="Primary navigation">
          {/* Left: Brand Identity */}
          <Link className="brand" to="/" aria-label="Stashh home">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span style={{ fontSize: 'var(--font-h3)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)' }}>Stashh</span>
          </Link>

          {/* Right: Nav items with spacious gaps, ThemeToggle, and Symmetrical Action Buttons */}
          <div className="landing-topbar-right">
            <div className="nav-links-cluster" aria-label="Secondary navigation">
              {/* 1. Investor Mega Menu */}
              <div 
                className="subbar-item"
                onMouseEnter={() => handleMouseEnter('investor')}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  type="button" 
                  className={`subbar-trigger ${activeMenu === 'investor' ? 'is-active' : ''}`}
                  onClick={() => setActiveMenu(activeMenu === 'investor' ? null : 'investor')}
                  aria-expanded={activeMenu === 'investor'}
                >
                  Investor
                </button>
                <div 
                  className={`megamenu-panel ${activeMenu === 'investor' ? 'is-open' : ''}`} 
                  role="region" 
                  aria-label="Investor options"
                  onMouseEnter={() => handleMouseEnter('investor')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="megamenu-list">
                    <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Discover Startups</span>
                      </div>
                      <span className="megamenu-line-desc">Browse vetted companies with approved legal documentation and verified cap tables.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Private Watchlist</span>
                      </div>
                      <span className="megamenu-line-desc">Monitor pipeline companies, record private thesis notes, and track updates.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Portfolio Tracking</span>
                      </div>
                      <span className="megamenu-line-desc">Track company-specific share holdings, round valuations, and return multiples.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Direct Introductions</span>
                      </div>
                      <span className="megamenu-line-desc">Submit formal expressions of interest and coordinate deal allocations directly.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 2. Startup Mega Menu */}
              <div 
                className="subbar-item"
                onMouseEnter={() => handleMouseEnter('startup')}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  type="button" 
                  className={`subbar-trigger ${activeMenu === 'startup' ? 'is-active' : ''}`}
                  onClick={() => setActiveMenu(activeMenu === 'startup' ? null : 'startup')}
                  aria-expanded={activeMenu === 'startup'}
                >
                  Startup
                </button>
                <div 
                  className={`megamenu-panel ${activeMenu === 'startup' ? 'is-open' : ''}`} 
                  role="region" 
                  aria-label="Startup options"
                  onMouseEnter={() => handleMouseEnter('startup')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="megamenu-list">
                    <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Company Profile</span>
                      </div>
                      <span className="megamenu-line-desc">Publish corporate legal documents, verified metrics, pitch materials, and overview.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Fundraising Management</span>
                      </div>
                      <span className="megamenu-line-desc">Configure round capacity, target funding goals, valuation basis, and ticket sizes.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Cap Table Governance</span>
                      </div>
                      <span className="megamenu-line-desc">Manage authorized, issued, outstanding, and reserved pools with verified precision.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Investor Pipeline</span>
                      </div>
                      <span className="megamenu-line-desc">Review inbound expressions of interest and evaluate investor introductions.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. Explore Mega Menu */}
              <div 
                className="subbar-item"
                onMouseEnter={() => handleMouseEnter('explore')}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  type="button" 
                  className={`subbar-trigger ${activeMenu === 'explore' ? 'is-active' : ''}`}
                  onClick={() => setActiveMenu(activeMenu === 'explore' ? null : 'explore')}
                  aria-expanded={activeMenu === 'explore'}
                >
                  Explore
                </button>
                <div 
                  className={`megamenu-panel ${activeMenu === 'explore' ? 'is-open' : ''}`} 
                  role="region" 
                  aria-label="Explore options"
                  onMouseEnter={() => handleMouseEnter('explore')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="megamenu-list">
                    <Link to="/register" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Market Directory</span>
                      </div>
                      <span className="megamenu-line-desc">Explore vetted enterprise tech, AI, infrastructure, health, and consumer companies.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Valuation Multiples</span>
                      </div>
                      <span className="megamenu-line-desc">Review transparent pricing benchmarks and corporate capitalization models.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Administrative Diligence</span>
                      </div>
                      <span className="megamenu-line-desc">Learn how corporate credentials and legal incorporation documents are verified.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')} className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Governance Standards</span>
                      </div>
                      <span className="megamenu-line-desc">Mathematical share constraints and role-governed platform workflows.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. Help Mega Menu */}
              <div 
                className="subbar-item"
                onMouseEnter={() => handleMouseEnter('help')}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  type="button" 
                  className={`subbar-trigger ${activeMenu === 'help' ? 'is-active' : ''}`}
                  onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
                  aria-expanded={activeMenu === 'help'}
                >
                  Help
                </button>
                <div 
                  className={`megamenu-panel ${activeMenu === 'help' ? 'is-open' : ''}`} 
                  role="region" 
                  aria-label="Help options"
                  onMouseEnter={() => handleMouseEnter('help')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="megamenu-list">
                    <div className="megamenu-line-row" style={{ cursor: 'pointer' }} onClick={() => setOpenFaq(0)}>
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Startup Verification</span>
                      </div>
                      <span className="megamenu-line-desc">Requirements for submitting legal documents and achieving verified status.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </div>

                    <div className="megamenu-line-row" style={{ cursor: 'pointer' }} onClick={() => setOpenFaq(1)}>
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Fundraising Guidelines</span>
                      </div>
                      <span className="megamenu-line-desc">Step-by-step guidance on round configuration and investor commitments.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </div>

                    <div className="megamenu-line-row" style={{ cursor: 'pointer' }} onClick={() => setOpenFaq(2)}>
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Payment Gateways</span>
                      </div>
                      <span className="megamenu-line-desc">Direct capital transactions and transactional escrow handling.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </div>

                    <div className="megamenu-line-row" style={{ cursor: 'pointer' }} onClick={() => setOpenFaq(3)}>
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Cap Table Principles</span>
                      </div>
                      <span className="megamenu-line-desc">How founders maintain mathematical equity balance across stages.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ThemeToggle />

            {/* Symmetrically Styled Action Buttons with Matching Length & Neon Orange Accents */}
            <div className="landing-actions-cluster">
              <Link
                to="/login"
                onClick={(e) => openAuthFromClick(e, 'login')}
                className="btn-nav-action btn-nav-signin"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}
                className="btn-nav-action btn-nav-getstarted"
              >
                Get started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Wrap */}
      <main className="landing-content-wrap">
        {/* Section 1: Hero Viewport with Increased Spacing and Symmetrical CTA Buttons */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Invest and raise with precision.</h1>
            <p className="hero-summary">
              A calm, trustworthy investment environment where startups publish verified metrics and investors evaluate company-specific equity shares.
            </p>
            <div className="hero-actions" aria-label="Get started">
              <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}>
                <Button className="btn-cta-action btn-cta-secondary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
                  Raise capital
                </Button>
              </Link>
              <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>
                <Button className="btn-cta-action btn-cta-primary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
                  Explore opportunities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Dynamic Platform Metrics Initialized from Real Database Data */}
        <section className="hero-stats-grid" aria-label="Platform metrics">
          <div className="hero-stat-card">
            <span className="stat-num">{formatCompactINR(metrics.totalCapitalCommitted)}</span>
            <span className="stat-label">Capital Committed</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">{metrics.activeStartupsCount.toLocaleString('en-IN')}</span>
            <span className="stat-label">Approved Startups</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">{metrics.activeCommitmentsCount.toLocaleString('en-IN')}</span>
            <span className="stat-label">Active Commitments</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">{metrics.activeRoundsCount.toLocaleString('en-IN')}</span>
            <span className="stat-label">Open Rounds</span>
          </div>
        </section>

        {/* Section 2: Core Conviction with 2 Balanced Cards (No 3-Box Triad) */}
        <section className="conviction-section" aria-labelledby="conviction-title">
          <div className="section-header">
            <span className="section-tag">Core Conviction</span>
            <h2 id="conviction-title">Build with conviction. Scale with certainty.</h2>
            <p>
              Direct, unmediated venture alignment built on verifiable corporate truth and disciplined capital allocation.
            </p>
          </div>

          {/* Two Prominent Institutional Cards Side-by-Side */}
          <div className="conviction-grid">
            <div className="aura-word-card">
              <span className="aura-word-tag">DISCOVER &amp; SIGNAL</span>
              <h3>Verifiable Corporate Truth</h3>
              <p>
                Where exceptional ventures meet disciplined capital. No vanity pitch decks or inflated projections—only verified corporate substance, administrative diligence packages, and validated financial fundamentals.
              </p>
            </div>

            <div className="aura-word-card">
              <span className="aura-word-tag">CAP TABLE RIGOR</span>
              <h3>Mathematical Equity Integrity</h3>
              <p>
                Capitalization tables engineered with exact relational precision. Every share authorized, issued, outstanding, and reserved is maintained with strict database balance constraints from day zero.
              </p>
            </div>
          </div>

          {/* Platform Execution Lifecycle with Straight Mathematical Coordinates */}
          <div className="growth-trajectory-card">
            <div className="growth-trajectory-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <Activity size={18} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ margin: 0 }}>Platform Execution Lifecycle</h3>
                </div>
                <p>Four-phase structured workflow from legal incorporation to whole-share equity allocation.</p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {lifecycleSteps.map((st, i) => (
                  <button
                    key={st.step}
                    type="button"
                    onClick={() => setActiveStage(i)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--font-caption)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: activeStage === i ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: activeStage === i ? 'var(--forest-surface-raised)' : 'transparent',
                      color: activeStage === i ? 'var(--text)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {st.step}. {st.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Straight Mathematical Vector Coordinate Graph (No Curved Splines) */}
            <div style={{ width: '100%', height: '220px', position: 'relative', marginTop: 'var(--space-6)' }}>
              <svg width="100%" height="100%" viewBox="0 0 900 220" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="mathAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--bg)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Mathematical Grid Lines */}
                <line x1="50" y1="30" x2="880" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="85" x2="880" y2="85" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="135" x2="880" y2="135" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="180" x2="880" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="50" y1="205" x2="880" y2="205" stroke="rgba(255,255,255,0.12)" />

                {/* Vertical Step Guideline Markers */}
                <line x1="80" y1="30" x2="80" y2="205" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />
                <line x1="320" y1="30" x2="320" y2="205" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />
                <line x1="560" y1="30" x2="560" y2="205" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />
                <line x1="820" y1="30" x2="820" y2="205" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 2" />

                {/* Shaded Area Under Straight Line Trajectory */}
                <polygon
                  points="80,180 320,135 560,85 820,30 820,205 80,205"
                  fill="url(#mathAreaGradient)"
                />

                {/* Mathematical Straight Coordinate Line Segments */}
                <polyline
                  points="80,180 320,135 560,85 820,30"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinejoin="miter"
                />

                {/* Node Markers & Coordinate Labels */}
                {lifecycleSteps.map((st, i) => {
                  const isActive = activeStage === i
                  return (
                    <g key={st.step}>
                      {isActive && (
                        <circle
                          cx={st.coordX}
                          cy={st.coordY}
                          r="14"
                          fill="var(--accent)"
                          fillOpacity="0.25"
                        />
                      )}
                      <circle
                        cx={st.coordX}
                        cy={st.coordY}
                        r={isActive ? "7" : "5"}
                        fill={isActive ? "var(--accent)" : "var(--surface)"}
                        stroke={isActive ? "#FFFFFF" : "var(--border-strong)"}
                        strokeWidth={isActive ? "2.5" : "2"}
                      />
                      <text
                        x={st.coordX}
                        y={218}
                        textAnchor="middle"
                        fill={isActive ? "var(--accent)" : "var(--text-tertiary)"}
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                        fontWeight={isActive ? "700" : "500"}
                      >
                        {st.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Dynamic Step Details Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)', padding: 'var(--space-5) var(--space-6)', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', border: '1px solid var(--surface)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-caption)', fontWeight: 'var(--weight-bold)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {lifecycleSteps[activeStage].badge}
                </span>
                <h4 style={{ margin: 'var(--space-1) 0 var(--space-2)', fontSize: 'var(--font-h3)', fontWeight: 'var(--weight-semibold)' }}>
                  {lifecycleSteps[activeStage].title}
                </h4>
                <p style={{ margin: 0, fontSize: 'var(--font-small)', color: 'var(--text-secondary)', maxWidth: '640px' }}>
                  {lifecycleSteps[activeStage].description}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Workflow Invariant</span>
                <div style={{ fontSize: 'var(--font-h3)', fontWeight: 'var(--weight-bold)', color: 'var(--text)' }}>
                  {lifecycleSteps[activeStage].deliverable}
                </div>
                <span style={{ fontSize: 'var(--font-caption)', color: 'var(--forest-text)' }}>
                  {lifecycleSteps[activeStage].focus}
                </span>
              </div>
            </div>

            {/* Four Step Navigation Bar */}
            <div className="growth-stages-grid">
              {lifecycleSteps.map((st, i) => (
                <div
                  key={st.step}
                  className="growth-stage-item"
                  style={{ opacity: activeStage === i ? 1 : 0.65, cursor: 'pointer' }}
                  onClick={() => setActiveStage(i)}
                >
                  <span className="growth-stage-num">{st.step}</span>
                  <span className="growth-stage-name">{st.name}</span>
                  <span className="growth-stage-desc">{st.focus}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Dual Value Track with Symmetrical CTA Buttons */}
        <section className="dual-track-section" aria-labelledby="dual-title">
          <div className="section-header">
            <span className="section-tag">Role-Governed Infrastructure</span>
            <h2 id="dual-title">Built for Founders. Engineered for Investors.</h2>
            <p>
              Two specialized workspaces united by verified administrative due diligence and transparent capitalization ledgers.
            </p>
          </div>

          <div className="dual-track-grid">
            {/* Card 1: Founder Track */}
            <div className="dual-card">
              <div>
                <span className="dual-card-badge">For Startup Founders</span>
                <h3>Raise capital with verified governance.</h3>
                <p>Model capitalization structures, submit corporate documentation for administrative review, and manage investor inquiries in one workspace.</p>
              </div>

              <ul className="dual-feature-list">
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Cap Table Modeling:</strong> Transparent tracking of authorized, issued, outstanding, and reserved shares.</span>
                </li>
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Administrative Verification:</strong> Legal document review confirms authentic company existence before raises open.</span>
                </li>
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Inbound Pipeline:</strong> Track and respond to expressions of interest from qualified investors.</span>
                </li>
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Share Pool Configuration:</strong> Define round targets in ₹ Lakhs/Crores, price per share, and ticket sizes.</span>
                </li>
              </ul>

              <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}>
                <Button className="btn-cta-action btn-cta-secondary" style={{ width: '100%' }} rightIcon={<ArrowRight size={15} />}>
                  Register as Startup Founder
                </Button>
              </Link>
            </div>

            {/* Card 2: Investor Track */}
            <div className="dual-card">
              <div>
                <span className="dual-card-badge">For Qualified Investors</span>
                <h3>Evaluate deals with unvarnished clarity.</h3>
                <p>Discover verified opportunities across high-growth sectors, review legal documentation and capitalization tables, and manage private watchlists.</p>
              </div>

              <ul className="dual-feature-list">
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Company-Specific Equity:</strong> Direct share commitments tied to verified company capitalization.</span>
                </li>
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Private Thesis Notes:</strong> Record proprietary notes and monitor target companies on your watchlist.</span>
                </li>
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Portfolio Ledger:</strong> Track commitments, allocated shares, and company valuation histories.</span>
                </li>
                <li className="dual-feature-item">
                  <CheckCircle2 size={16} />
                  <span><strong>Direct Expressions of Interest:</strong> Request meetings and allocations directly through the platform.</span>
                </li>
              </ul>

              <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>
                <Button className="btn-cta-action btn-cta-primary" style={{ width: '100%' }} rightIcon={<ArrowRight size={15} />}>
                  Register as Qualified Investor
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: Platform Core Standards - Balanced 4-Box 2x2 Grid */}
        <section className="platform-features-section" aria-labelledby="standards-title">
          <div className="section-header">
            <span className="section-tag">Institutional Integrity</span>
            <h2 id="standards-title">Platform Standards &amp; Verification</h2>
            <p>
              How Stashh ensures transparency, compliance, and legal legitimacy across every fundraising round.
            </p>
          </div>

          <div className="platform-features-grid">
            <div className="platform-feature-card">
              <div className="platform-feature-icon"><ShieldCheck size={20} /></div>
              <h3>Administrative Due Diligence</h3>
              <p>
                Every company must submit legal incorporation records, pitch decks, and valuation metrics. Platform administrators verify documentation to ensure legal legitimacy before any round opens.
              </p>
            </div>

            <div className="platform-feature-card">
              <div className="platform-feature-icon"><Layers size={20} /></div>
              <h3>Cap Table Mathematical Invariants</h3>
              <p>
                Database-enforced constraints ensure authorized shares always balance issued and reserved pools with zero rounding errors or fractional allocations.
              </p>
            </div>

            <div className="platform-feature-card">
              <div className="platform-feature-icon"><Lock size={20} /></div>
              <h3>Session-Bound CSRF Security</h3>
              <p>
                State mutations require active authenticated sessions and cryptographic token validation, protecting transactions against cross-site exploitation.
              </p>
            </div>

            <div className="platform-feature-card">
              <div className="platform-feature-icon"><FileText size={20} /></div>
              <h3>Relational Audit Trail</h3>
              <p>
                Every commitment, share issuance, and corporate document submission is permanently logged with tamper-evident relational audit timestamps.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Real, Actionable FAQs - Left-Aligned & Grounded Panel */}
        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-header">
            <span className="section-tag">Questions &amp; Answers</span>
            <h2 id="faq-title">Frequently Asked Questions</h2>
            <p>Everything you need to know about the Stashh platform verification and investment process.</p>
          </div>

          <div className="faq-grounded-panel">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-grounded-row">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--transition-fast)',
                      color: openFaq === idx ? 'var(--accent)' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p style={{ margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Final Call To Action Banner with Symmetrical Buttons */}
        <section className="landing-cta-banner" aria-labelledby="cta-title">
          <h2 id="cta-title">Ready to participate in verified deal flows?</h2>
          <p>
            Join founders and qualified investors managing capitalization tables, legal reviews, and startup investments on Stashh.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>
              <Button className="btn-cta-action btn-cta-primary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
                Get started as Investor
              </Button>
            </Link>
            <Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}>
              <Button className="btn-cta-action btn-cta-secondary" size="lg">
                Register Startup
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Institutional Multi-Column Footer */}
      <footer className="institutional-footer">
        <div className="landing-content-wrap">
          <div className="footer-nav-grid">
            <div className="footer-brand-col">
              <Link
                className="brand"
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Stashh home"
              >
                <span className="brand-mark" style={{ width: '28px', height: '28px', fontSize: 'var(--font-caption)' }} aria-hidden="true">S</span>
                <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--font-h3)' }}>Stashh</span>
              </Link>
              <p>
                A reliable, role-governed startup investment and fundraising platform connecting verified founders and qualified investors.
              </p>
            </div>

            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>Discover Deals</Link></li>
                <li><Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>Private Watchlist</Link></li>
                <li><Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>Portfolio Tracking</Link></li>
                <li><Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}>Cap Table Modeling</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Participants</h4>
              <ul>
                <li><Link to="/register?role=STARTUP" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}>For Founders</Link></li>
                <li><Link to="/register?role=INVESTOR" onClick={(e) => openAuthFromClick(e, 'register', 'INVESTOR')}>For Investors</Link></li>
                <li><Link to="/login" onClick={(e) => openAuthFromClick(e, 'login')}>Administrative Portal</Link></li>
                <li><Link to="/register" onClick={(e) => openAuthFromClick(e, 'register', 'STARTUP')}>Create Account</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Legal &amp; Guidelines</h4>
              <ul>
                <li><a href="#faq-title">Administrative Verification</a></li>
                <li><a href="#faq-title">Corporate Due Diligence</a></li>
                <li><a href="#faq-title">Privacy Policy</a></li>
                <li><a href="#faq-title">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div>
              &copy; {new Date().getFullYear()} Stashh Technologies Pvt Ltd. All rights reserved.
            </div>
            <div>
              Direct Startup Investment &amp; Fundraising Platform.
            </div>
          </div>
        </div>
      </footer>

      {authMode !== null && (
        <AuthModal
          mode={authMode}
          initialRole={authRole}
          redirectTo={redirectTo}
          onClose={handleCloseAuthModal}
          onSwitchMode={handleSwitchAuthMode}
        />
      )}
    </div>
  )
}

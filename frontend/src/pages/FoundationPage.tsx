import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, ThemeToggle } from '../design-system'
import { 
  ArrowRight, 
  ChevronDown, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  CheckCircle2,
  Activity
} from 'lucide-react'

export default function FoundationPage() {
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

  // Interactive trajectory milestone state
  const [activeStage, setActiveStage] = useState<number>(2)

  // Interactive FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // India-first startup compounding stages (₹ Lakhs & Crores)
  const trajectoryStages = [
    {
      stage: 'Stage 01',
      title: 'Incorporation & Cap Table Setup',
      valuation: '₹50 Lakh – ₹2 Crore',
      focus: 'Foundational Equity Architecture',
      description: 'Authorized, issued, outstanding, and reserved share pools are established with database-enforced mathematical balance.',
      metric: '100% Invariant Balance',
    },
    {
      stage: 'Stage 02',
      title: 'Verified Legal Due Diligence',
      valuation: '₹2 Crore – ₹10 Crore',
      focus: 'Administrative Review & Validation',
      description: 'Corporate filings, certified capitalization ledgers, and financial projections are scrutinized and verified by platform administration.',
      metric: 'Admin Verified Status',
    },
    {
      stage: 'Stage 03',
      title: 'Direct Syndicate Round Allocation',
      valuation: '₹10 Crore – ₹25 Crore',
      focus: 'Precision Equity Distribution',
      description: 'Qualified investors review validated diligence packages and commit capital directly into discrete, whole company shares.',
      metric: 'Direct Share Ledgers',
    },
    {
      stage: 'Stage 04',
      title: 'Institutional Valuation Compounding',
      valuation: '₹25 Crore – ₹100 Crore+',
      focus: 'Audited Position Performance',
      description: 'Subsequent funding milestones generate immutable valuation snapshots, recording realized capital growth and transparent returns.',
      metric: 'Snapshot History',
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
      {/* Full-Width Seamless Top Navigation - Zero separating line, smoothly merged into canvas */}
      <header className="landing-header">
        <nav className="topbar" aria-label="Primary navigation">
          {/* Left: Brand Identity */}
          <Link className="brand" to="/" aria-label="Stashh home">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Stashh</span>
          </Link>

          {/* Right: Nav items (with stable hover state), ThemeToggle, and Matching Sized Action Buttons */}
          <div className="landing-topbar-right">
            <div className="nav-links-cluster" aria-label="Secondary navigation">
              {/* 1. Investor Mega Menu (Form of lines with Black-to-Green gradient) */}
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
                    <Link to="/register?role=INVESTOR" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Discover Startups</span>
                      </div>
                      <span className="megamenu-line-desc">Browse vetted companies with approved legal documentation and verified cap tables.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=INVESTOR" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Private Watchlist</span>
                      </div>
                      <span className="megamenu-line-desc">Monitor pipeline companies, record private thesis notes, and track updates.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=INVESTOR" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Portfolio Tracking</span>
                      </div>
                      <span className="megamenu-line-desc">Track company-specific share holdings, round valuations, and return multiples.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=INVESTOR" className="megamenu-line-row">
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
                    <Link to="/register?role=STARTUP" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Company Profile</span>
                      </div>
                      <span className="megamenu-line-desc">Publish corporate legal documents, verified metrics, pitch materials, and overview.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=STARTUP" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Fundraising Management</span>
                      </div>
                      <span className="megamenu-line-desc">Configure round capacity, target funding goals, valuation basis, and ticket sizes.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=STARTUP" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Cap Table Governance</span>
                      </div>
                      <span className="megamenu-line-desc">Manage authorized, issued, outstanding, and reserved pools with verified precision.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register?role=STARTUP" className="megamenu-line-row">
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
                    <Link to="/register" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Market Directory</span>
                      </div>
                      <span className="megamenu-line-desc">Explore Indian enterprise tech, AI, infrastructure, health, and consumer companies.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Valuation Multiples</span>
                      </div>
                      <span className="megamenu-line-desc">Review transparent pricing benchmarks and corporate capitalization models.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register" className="megamenu-line-row">
                      <div className="megamenu-line-left">
                        <span className="megamenu-line-title">Administrative Diligence</span>
                      </div>
                      <span className="megamenu-line-desc">Learn how corporate credentials and legal incorporation documents are verified.</span>
                      <ArrowRight size={15} className="megamenu-line-arrow" />
                    </Link>

                    <Link to="/register" className="megamenu-line-row">
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
              <Link to="/login" className="btn-nav-action btn-nav-signin">
                Sign in
              </Link>
              <Link to="/register" className="btn-nav-action btn-nav-getstarted">
                Get started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Wrap */}
      <main className="landing-content-wrap">
        {/* Section 1: Hero Viewport (60% Charcoal Black Canvas, 10% Neon Orange CTAs) */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Invest and raise with precision.</h1>
            <p className="hero-summary">
              A calm, trustworthy investment environment where Indian startups publish verified metrics and investors evaluate company-specific equity shares.
            </p>
            <div className="hero-actions" aria-label="Get started">
              <Link to="/register?role=STARTUP">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
                  Raise capital
                </Button>
              </Link>
              <Link to="/register?role=INVESTOR">
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
                  Explore opportunities
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Viewport 1's 30% Dark Forest Green: Real Platform Statistics Initialized at ₹0 Cr / 0 */}
        <section className="hero-stats-grid" aria-label="Platform metrics">
          <div className="hero-stat-card">
            <span className="stat-num">₹0 Cr</span>
            <span className="stat-label">Capital Committed</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">0</span>
            <span className="stat-label">Registered Startups</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">0</span>
            <span className="stat-label">Verified Investors</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">0</span>
            <span className="stat-label">Active Rounds</span>
          </div>
        </section>

        {/* Section 2: Viewport 2 (Conviction & Venture Compounding Trajectory - 30% Dark Forest Green) */}
        <section className="conviction-section" aria-labelledby="conviction-title">
          <div className="section-header">
            <span className="section-tag">Core Conviction</span>
            <h2 id="conviction-title">Build with conviction. Scale with certainty.</h2>
            <p>
              Direct, unmediated venture alignment built on verifiable corporate truth and disciplined capital allocation.
            </p>
          </div>

          {/* Three Aura Words Cards */}
          <div className="aura-words-row">
            <div className="aura-word-card">
              <span className="aura-word-tag">DISCOVER</span>
              <h3>Uncompromised Signal</h3>
              <p>Where exceptional ventures meet disciplined capital. No vanity pitch decks or inflated projections—only verified corporate substance.</p>
            </div>

            <div className="aura-word-card">
              <span className="aura-word-tag">BUILD</span>
              <h3>Mathematical Integrity</h3>
              <p>Capitalization tables engineered with exact precision. Every share authorized, issued, and accounted for from day zero.</p>
            </div>

            <div className="aura-word-card">
              <span className="aura-word-tag">SCALE</span>
              <h3>Long-Term Alignment</h3>
              <p>Structured round governance that protects founder equity and compounds investor returns across every milestone.</p>
            </div>
          </div>

          {/* Indian Venture Compounding & Growth Trajectory Chart */}
          <div className="growth-trajectory-card">
            <div className="growth-trajectory-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <Activity size={18} style={{ color: 'var(--forest-text)' }} />
                  <h3 style={{ margin: 0 }}>Venture Capital Compounding Trajectory</h3>
                </div>
                <p>Interactive lifecycle model tracking valuation expansion through verified Indian governance gates.</p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {trajectoryStages.map((st, i) => (
                  <button
                    key={st.stage}
                    type="button"
                    onClick={() => setActiveStage(i)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: activeStage === i ? 'var(--accent)' : 'var(--forest-border)',
                      backgroundColor: activeStage === i ? 'var(--forest-surface-raised)' : 'transparent',
                      color: activeStage === i ? 'var(--text)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {st.stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Growth Curve with Highlight Markers */}
            <div style={{ width: '100%', height: '220px', position: 'relative', marginTop: 'var(--space-6)' }}>
              <svg width="100%" height="100%" viewBox="0 0 900 220" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1E4230" />
                    <stop offset="60%" stopColor="#2A5C43" />
                    <stop offset="100%" stopColor="#FF6A00" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1E4230" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0B1C13" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="50" y1="30" x2="880" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="50" y1="85" x2="880" y2="85" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="50" y1="140" x2="880" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="50" y1="195" x2="880" y2="195" stroke="rgba(255,255,255,0.08)" />

                {/* Shaded Area Under Curve */}
                <path
                  d="M 60 195 C 240 190, 400 150, 540 110 C 680 70, 760 40, 880 25 L 880 195 L 60 195 Z"
                  fill="url(#areaGradient)"
                />

                {/* Smooth Compounding Growth Curve */}
                <path
                  d="M 60 195 C 240 190, 400 150, 540 110 C 680 70, 760 40, 880 25"
                  fill="none"
                  stroke="url(#curveGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Stage 1 Marker */}
                <circle cx="160" cy="188" r={activeStage === 0 ? "7" : "5"} fill={activeStage === 0 ? "#FF6A00" : "#2A5C43"} stroke="#0D0F14" strokeWidth="2" />
                <text x="160" y="214" textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" fontFamily="sans-serif">Incorporation</text>

                {/* Stage 2 Marker */}
                <circle cx="380" cy="152" r={activeStage === 1 ? "7" : "5"} fill={activeStage === 1 ? "#FF6A00" : "#2A5C43"} stroke="#0D0F14" strokeWidth="2" />
                <text x="380" y="176" textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" fontFamily="sans-serif">Due Diligence</text>

                {/* Stage 3 Marker */}
                <circle cx="610" cy="95" r={activeStage === 2 ? "7" : "5"} fill={activeStage === 2 ? "#FF6A00" : "#2A5C43"} stroke="#0D0F14" strokeWidth="2" />
                <text x="610" y="120" textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" fontFamily="sans-serif">Round Close</text>

                {/* Stage 4 Marker */}
                <circle cx="840" cy="32" r={activeStage === 3 ? "7" : "5"} fill={activeStage === 3 ? "#FF6A00" : "#2A5C43"} stroke="#0D0F14" strokeWidth="2" />
                <text x="840" y="57" textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" fontFamily="sans-serif">Compounding</text>
              </svg>
            </div>

            {/* Dynamic Stage Details Callout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)', padding: 'var(--space-5) var(--space-6)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--forest-border)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--forest-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {trajectoryStages[activeStage].stage} • {trajectoryStages[activeStage].focus}
                </span>
                <h4 style={{ margin: '4px 0 6px', fontSize: '1.125rem', fontWeight: 600 }}>{trajectoryStages[activeStage].title}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>{trajectoryStages[activeStage].description}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Valuation Milestone</span>
                <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--forest-text)' }}>{trajectoryStages[activeStage].valuation}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{trajectoryStages[activeStage].metric}</span>
              </div>
            </div>

            {/* Four Stages Grid */}
            <div className="growth-stages-grid">
              {trajectoryStages.map((st, i) => (
                <div
                  key={st.stage}
                  className="growth-stage-item"
                  style={{ opacity: activeStage === i ? 1 : 0.65, cursor: 'pointer' }}
                  onClick={() => setActiveStage(i)}
                >
                  <span className="growth-stage-num">{st.stage}</span>
                  <span className="growth-stage-name">{st.title}</span>
                  <span className="growth-stage-desc">{st.focus}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Viewport 3 (Dual Value Track - 30% Dark Forest Green) */}
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

              <Link to="/register?role=STARTUP">
                <Button variant="secondary" rightIcon={<ArrowRight size={15} />}>
                  Register as Startup Founder
                </Button>
              </Link>
            </div>

            {/* Card 2: Investor Track */}
            <div className="dual-card">
              <div>
                <span className="dual-card-badge">For Qualified Investors</span>
                <h3>Evaluate deals with unvarnished clarity.</h3>
                <p>Discover verified opportunities across Indian sectors, review legal documentation and capitalization tables, and manage private watchlists.</p>
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

              <Link to="/register?role=INVESTOR">
                <Button variant="primary" rightIcon={<ArrowRight size={15} />}>
                  Register as Qualified Investor
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 4: Viewport 4 (Platform Core Standards & FAQs - 30% Dark Forest Green) */}
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
              <h3>Capitalization Integrity</h3>
              <p>
                Database-enforced constraints ensure authorized shares always balance issued and reserved pools. Every share allocation reflects real corporate equity.
              </p>
            </div>

            <div className="platform-feature-card">
              <div className="platform-feature-icon"><BarChart3 size={20} /></div>
              <h3>Direct Deal Visibility</h3>
              <p>
                Investors get direct access to company documents and valuation history, while founders gain transparent visibility into inbound interest and committed capital.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Real, Actionable FAQs */}
        <section className="faq-section" aria-labelledby="faq-title">
          <div className="section-header">
            <span className="section-tag">Questions &amp; Answers</span>
            <h2 id="faq-title">Frequently Asked Questions</h2>
            <p>Everything you need to know about the Stashh platform verification and investment process.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item ${openFaq === idx ? 'faq-item-open' : ''}`}>
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

        {/* Section 6: Viewport 5 (Final Call To Action Banner - 30% Dark Forest Green) */}
        <section className="landing-cta-banner" aria-labelledby="cta-title">
          <h2 id="cta-title">Ready to participate in verified deal flows?</h2>
          <p>
            Join Indian founders and qualified investors managing capitalization tables, legal reviews, and startup investments on Stashh.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to="/register?role=INVESTOR">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
                Get started as Investor
              </Button>
            </Link>
            <Link to="/register?role=STARTUP">
              <Button variant="secondary" size="lg">
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="brand-mark" style={{ width: '26px', height: '26px', fontSize: '11px' }}>S</span>
                <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Stashh</span>
              </div>
              <p>
                A reliable, role-governed startup investment and fundraising platform connecting verified founders and qualified investors.
              </p>
            </div>

            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/register?role=INVESTOR">Discover Deals</Link></li>
                <li><Link to="/register?role=INVESTOR">Private Watchlist</Link></li>
                <li><Link to="/register?role=INVESTOR">Portfolio Tracking</Link></li>
                <li><Link to="/register?role=STARTUP">Cap Table Modeling</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Participants</h4>
              <ul>
                <li><Link to="/register?role=STARTUP">For Founders</Link></li>
                <li><Link to="/register?role=INVESTOR">For Investors</Link></li>
                <li><Link to="/login">Administrative Portal</Link></li>
                <li><Link to="/register">Create Account</Link></li>
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
    </div>
  )
}

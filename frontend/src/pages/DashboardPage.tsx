import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { EmptyState } from '../components/feedback/States'
import { type UserRole } from '../auth/auth.types'
import { useAuth } from '../auth/useAuth'
import { fetchStartupProfile } from '../startup/startup.api'
import { fetchStartupPool, fetchInvestorPools, fetchAdminPools } from '../fundraising/fundraising.api'
import { fetchInvestorPortfolio } from '../portfolio/portfolio.api'
import type { StartupProfile } from '../startup/startup.types'
import type { FundraisingPool } from '../fundraising/fundraising.types'
import type { PortfolioSummary } from '../portfolio/portfolio.types'
import {
  Button,
  Card,
  ProgressBar,
  StatusPill,
  formatCompactINR,
  formatShares,
} from '../design-system'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Check,
  TrendingUp,
} from 'lucide-react'

type DashboardSection = 'overview' | 'profile' | 'fundraising' | 'discover' | 'portfolio' | 'reviews' | 'users'

type EditorialItem = {
  index: string
  category: string
  title: string
  summary: string
}

type BarDatum = {
  label: string
  primaryValue: number
  secondaryValue?: number
}

type DashboardContent = {
  eyebrow: string
  title: string
  description: string
  editorial: EditorialItem[]
  emptyTitle: string
  emptyDescription: string
  actionLabel?: string
  actionTo?: string
}

const content: Record<UserRole, Record<DashboardSection, DashboardContent>> = {
  STARTUP: {
    overview: {
      eyebrow: 'Startup workspace',
      title: 'Turn verified corporate truth into disciplined capital.',
      description: 'Model your capitalization structure, complete administrative due diligence, and manage investor interest from one workspace.',
      editorial: [
        {
          index: '01',
          category: 'Corporate Identity',
          title: 'Company profile & filings',
          summary: 'Maintain your verified narrative, stage-aware traction metrics, pitch deck, and legal records required for administrative approval before any round opens.',
        },
        {
          index: '02',
          category: 'Equity Structure',
          title: 'Cap table governance',
          summary: 'Define authorized, issued, outstanding, treasury, and reserved share pools enforced by strict mathematical database invariants from day zero.',
        },
        {
          index: '03',
          category: 'Capital Raise',
          title: 'Fundraising rounds',
          summary: 'Configure target capital in Indian Rupees, ticket thresholds, valuation basis, and whole-share pricing once your profile achieves public approval.',
        },
        {
          index: '04',
          category: 'Investor Pipeline',
          title: 'Inbound interest queue',
          summary: 'Review formal expressions of interest submitted by qualified investors and coordinate direct conversations around your active raise.',
        },
      ],
      emptyTitle: 'Your company story starts here',
      emptyDescription: 'Build a stage-aware profile, add the supporting context, and submit it when the story is ready for review.',
      actionLabel: 'Build company profile',
      actionTo: '/app/startup/profile',
    },
    profile: {
      eyebrow: 'Company profile',
      title: 'Give the right people a clear first look.',
      description: 'A guided profile collects the context investors need, with draft saving and stage-aware fields.',
      editorial: [],
      emptyTitle: 'Build the profile investors can understand',
      emptyDescription: 'Save your company story, add the metrics that fit your stage, and submit it for review when ready.',
    },
    fundraising: {
      eyebrow: 'Fundraising',
      title: 'Turn momentum into a transparent round.',
      description: 'Fundraising pools, commitments, and review status connect here once the company profile is complete.',
      editorial: [],
      emptyTitle: 'Configure a transparent fundraising pool',
      emptyDescription: 'Set the target, commitment limits, and close date. Once your profile is approved and public, you can open the round.',
      actionLabel: 'Open fundraising',
      actionTo: '/app/startup/fundraising',
    },
    discover: {
      eyebrow: 'Startup workspace',
      title: 'Discover is for investors.',
      description: 'Switch to an investor account to explore startups.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your startup navigation contains the tools that belong to a company account.',
    },
    portfolio: {
      eyebrow: 'Startup workspace',
      title: 'Portfolio is for investors.',
      description: 'Switch to an investor account to view simulated holdings.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your startup navigation contains the tools that belong to a company account.',
    },
    reviews: {
      eyebrow: 'Startup workspace',
      title: 'Review queue is for admins.',
      description: 'Switch to an admin account to review submissions.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    users: {
      eyebrow: 'Startup workspace',
      title: 'User management is for admins.',
      description: 'Switch to an admin account to view platform users.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
  },
  INVESTOR: {
    overview: {
      eyebrow: 'Investor workspace',
      title: 'Find the signal before the rush.',
      description: 'Evaluate admin-verified startup rounds, capture private diligence theses, and track company-specific equity holdings in one calm view.',
      editorial: [
        {
          index: '01',
          category: 'Deal Discovery',
          title: 'Discover vetted startups',
          summary: 'Filter admin-approved fundraising rounds by sector and stage, inspect verified cap tables and corporate filings, and allocate into whole, non-fractional equity shares.',
        },
        {
          index: '02',
          category: 'Pipeline & Thesis',
          title: 'Saved watchlist',
          summary: 'Bookmark high-conviction startups during due diligence and keep private investment thesis notes organized alongside each target company.',
        },
        {
          index: '03',
          category: 'Founder Access',
          title: 'Direct introductions',
          summary: 'Send formal expressions of interest directly to founding teams and track or withdraw pending introduction requests at any point.',
        },
        {
          index: '04',
          category: 'Equity Ledger',
          title: 'Portfolio & valuations',
          summary: 'Monitor committed capital, discrete share counts, ownership percentages, and illustrative gains recalculated whenever valuation snapshots update.',
        },
      ],
      emptyTitle: 'Your investment view starts with discovery',
      emptyDescription: 'Explore approved fundraising pools with context, then keep your simulated commitments in one place.',
      actionLabel: 'Explore open rounds',
      actionTo: '/app/investor/discover',
    },
    discover: {
      eyebrow: 'Discover startups',
      title: 'Explore what is being built.',
      description: 'Filter approved fundraising pools by sector and stage, compare terms, and record simulated commitments.',
      editorial: [],
      emptyTitle: 'The discovery room is quiet',
      emptyDescription: 'Open fundraising pools appear here after approved startups configure and open their terms.',
    },
    portfolio: {
      eyebrow: 'Portfolio',
      title: 'Know what your position means.',
      description: 'Simulated commitments, company equity shares, valuation snapshots, and illustrative gains are calculated without real money transfers.',
      editorial: [],
      emptyTitle: 'Your portfolio is intentionally empty',
      emptyDescription: 'Once simulated commitments exist, this page will explain the original inputs and the changes over time.',
    },
    profile: {
      eyebrow: 'Investor workspace',
      title: 'Company profiles are for startups.',
      description: 'Switch to a startup account to build a company profile.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your investor navigation contains discovery and portfolio tools.',
    },
    fundraising: {
      eyebrow: 'Investor workspace',
      title: 'Fundraising management is for startups.',
      description: 'Switch to a startup account to manage a round.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    reviews: {
      eyebrow: 'Investor workspace',
      title: 'Review queue is for admins.',
      description: 'Switch to an admin account to review submissions.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    users: {
      eyebrow: 'Investor workspace',
      title: 'User management is for admins.',
      description: 'Switch to an admin account to view platform users.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
  },
  ADMIN: {
    overview: {
      eyebrow: 'Admin workspace',
      title: 'Keep the platform worthy of trust.',
      description: 'Verify corporate submissions, govern active fundraising pools, and publish dated valuation snapshots across the marketplace.',
      editorial: [
        {
          index: '01',
          category: 'Due Diligence',
          title: 'Startup review queue',
          summary: 'Inspect corporate filings, pitch decks, and financial metrics to approve public listings or request structured revisions from founders.',
        },
        {
          index: '02',
          category: 'Round Governance',
          title: 'Fundraising pool controls',
          summary: 'Monitor active startup rounds across the marketplace and open or close investor commitment access to protect platform integrity.',
        },
        {
          index: '03',
          category: 'Pricing Benchmarks',
          title: 'Valuation snapshots',
          summary: 'Publish dated company valuation updates that recalculate illustrative share prices and investor portfolio positions in real time.',
        },
        {
          index: '04',
          category: 'Platform Oversight',
          title: 'Role & user directory',
          summary: 'Review role boundaries and workspace participation across startups, qualified investors, and administrative reviewers.',
        },
      ],
      emptyTitle: 'The review queue is ready',
      emptyDescription: 'Submitted startup profiles and fundraising pools arrive here with their terms, metrics, and review history.',
      actionLabel: 'Open review queue',
      actionTo: '/app/admin/reviews',
    },
    reviews: {
      eyebrow: 'Review queue',
      title: 'Review with context, not shortcuts.',
      description: 'Startup submissions, feedback, status history, and visibility actions live in the review queue.',
      editorial: [],
      emptyTitle: 'Open the live review queue',
      emptyDescription: 'The review page reads connected startup profiles and records each admin action.',
    },
    users: {
      eyebrow: 'Platform users',
      title: 'Understand who is in the room.',
      description: 'User search, account status, and role controls will arrive as admin workflows mature.',
      editorial: [],
      emptyTitle: 'User management is staged for a later pass',
      emptyDescription: 'The current role boundary is live and enforced; detailed admin controls arrive with the domain workflows.',
    },
    profile: {
      eyebrow: 'Admin workspace',
      title: 'Company profiles are managed by startups.',
      description: 'Switch to a startup account to build a company profile.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your admin navigation contains review and platform controls.',
    },
    fundraising: {
      eyebrow: 'Admin workspace',
      title: 'Fundraising pools keep their promises.',
      description: 'Review terms, capacity, and whether a simulated round is accepting investor commitments.',
      editorial: [],
      emptyTitle: 'Open fundraising controls',
      emptyDescription: 'Use the fundraising pools page to manage round access.',
    },
    discover: {
      eyebrow: 'Admin workspace',
      title: 'Discovery is for investors.',
      description: 'Switch to an investor account to explore public startup listings.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    portfolio: {
      eyebrow: 'Admin workspace',
      title: 'Portfolio is for investors.',
      description: 'Switch to an investor account to view simulated holdings.',
      editorial: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
  },
}

function ComparisonBarChart({
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
  data,
  emptyMessage,
}: {
  title: string
  subtitle: string
  primaryLabel: string
  secondaryLabel?: string
  data: BarDatum[]
  emptyMessage: string
}) {
  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => [d.primaryValue, d.secondaryValue ?? 0]),
  )

  return (
    <Card className="overview-chart-card">
      <div className="overview-chart-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <h3>{title}</h3>
          </div>
          <p>{subtitle}</p>
        </div>
        <div className="overview-chart-legend">
          <span className="overview-legend-item">
            <span className="overview-legend-dot is-primary" aria-hidden="true" />
            {primaryLabel}
          </span>
          {secondaryLabel && (
            <span className="overview-legend-item">
              <span className="overview-legend-dot is-secondary" aria-hidden="true" />
              {secondaryLabel}
            </span>
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="overview-chart-empty">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="overview-svg-wrap">
          <svg
            width="100%"
            height="196"
            viewBox="0 0 460 196"
            role="img"
            aria-label={title}
            style={{ overflow: 'visible' }}
          >
            {[20, 65, 110, 155].map((y) => (
              <line
                key={y}
                x1="8"
                y1={y}
                x2="452"
                y2={y}
                stroke="var(--border)"
                strokeDasharray={y === 155 ? undefined : '3 3'}
              />
            ))}

            {data.map((item, idx) => {
              const slotWidth = 440 / data.length
              const centerX = 10 + slotWidth * idx + slotWidth / 2
              const hasSecondary = secondaryLabel != null && item.secondaryValue != null
              const barWidth = hasSecondary ? Math.min(22, slotWidth * 0.28) : Math.min(34, slotWidth * 0.42)
              const primaryH = Math.max(4, (item.primaryValue / maxVal) * 130)
              const secondaryH = hasSecondary
                ? Math.max(4, ((item.secondaryValue ?? 0) / maxVal) * 130)
                : 0
              const shortLabel = item.label.length > 12 ? `${item.label.slice(0, 11)}…` : item.label

              return (
                <g key={item.label}>
                  <rect
                    x={hasSecondary ? centerX - barWidth - 3 : centerX - barWidth / 2}
                    y={155 - primaryH}
                    width={barWidth}
                    height={primaryH}
                    rx="3"
                    fill="var(--forest-text)"
                  />
                  {hasSecondary && (
                    <rect
                      x={centerX + 3}
                      y={155 - secondaryH}
                      width={barWidth}
                      height={secondaryH}
                      rx="3"
                      fill="var(--accent)"
                    />
                  )}
                  <text
                    x={centerX}
                    y={178}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="12"
                    fontFamily="var(--font-sans)"
                  >
                    {shortLabel}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </Card>
  )
}

export { DashboardRedirectPage } from './DashboardRedirectPage'

export default function DashboardPage({ role, section }: { role: UserRole; section: DashboardSection }) {
  const { user } = useAuth()
  const [startupProfile, setStartupProfile] = useState<StartupProfile | null>(null)
  const [startupPool, setStartupPool] = useState<FundraisingPool | null>(null)
  const [investorPools, setInvestorPools] = useState<FundraisingPool[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [adminPools, setAdminPools] = useState<FundraisingPool[]>([])

  useEffect(() => {
    if (section !== 'overview' && role !== 'STARTUP') return
    let active = true

    if (role === 'STARTUP') {
      fetchStartupProfile().then((p) => { if (active && p) setStartupProfile(p) }).catch(() => {})
      fetchStartupPool().then((p) => { if (active && p) setStartupPool(p) }).catch(() => {})
    } else if (role === 'INVESTOR') {
      fetchInvestorPools().then((list) => { if (active && list) setInvestorPools(list) }).catch(() => {})
      fetchInvestorPortfolio().then((summary) => { if (active && summary) setPortfolio(summary) }).catch(() => {})
    } else if (role === 'ADMIN') {
      fetchAdminPools().then((list) => { if (active && list) setAdminPools(list) }).catch(() => {})
    }

    return () => {
      active = false
    }
  }, [role, section])

  if (!user || user.role !== role) return <Navigate to="/forbidden" replace />
  const current = content[role][section]

  // Status Stepper Calculation for Startup
  const reviewStatus = startupProfile?.reviewStatus || 'DRAFT'
  const isPublic = startupProfile?.visibility === 'PUBLIC'

  const stepperSteps = [
    { key: 'DRAFT', label: 'Draft' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'IN_REVIEW', label: reviewStatus === 'CHANGES_REQUESTED' ? 'Changes requested' : 'In review' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'PUBLIC', label: 'Public listing' },
  ]

  function getStepState(stepKey: string): 'complete' | 'current' | 'upcoming' | 'warning' {
    if (stepKey === 'DRAFT') {
      return reviewStatus === 'DRAFT' && !startupProfile ? 'current' : 'complete'
    }
    if (stepKey === 'SUBMITTED') {
      if (reviewStatus === 'DRAFT') return 'upcoming'
      return 'complete'
    }
    if (stepKey === 'IN_REVIEW') {
      if (reviewStatus === 'CHANGES_REQUESTED') return 'warning'
      if (reviewStatus === 'SUBMITTED') return 'current'
      if (reviewStatus === 'APPROVED') return 'complete'
      return 'upcoming'
    }
    if (stepKey === 'APPROVED') {
      if (reviewStatus === 'APPROVED') return isPublic ? 'complete' : 'current'
      return 'upcoming'
    }
    if (stepKey === 'PUBLIC') {
      if (isPublic) return 'complete'
      return 'upcoming'
    }
    return 'upcoming'
  }

  // Right SVG chart data per role
  const chartConfig = (() => {
    if (role === 'INVESTOR') {
      const positions = portfolio?.positions ?? []
      if (positions.length > 0) {
        return {
          title: 'Portfolio Allocation & Value',
          subtitle: 'Committed principal vs. current valuation across active holdings.',
          primaryLabel: 'Committed',
          secondaryLabel: 'Current Value',
          data: positions.slice(0, 5).map((pos) => ({
            label: pos.companyName,
            primaryValue: pos.amount,
            secondaryValue: pos.currentValue ?? pos.amount,
          })),
          emptyMessage: 'Commit into an open round to visualize your company-specific equity positions.',
        }
      }
      return {
        title: 'Active Round Capitalization',
        subtitle: 'Target raise vs. committed capital across open marketplace rounds.',
        primaryLabel: 'Target Capital',
        secondaryLabel: 'Committed',
        data: investorPools.slice(0, 5).map((pool) => ({
          label: pool.companyName,
          primaryValue: pool.targetAmount,
          secondaryValue: pool.totalCommitted,
        })),
        emptyMessage: 'No open fundraising pools are active right now.',
      }
    }

    if (role === 'STARTUP') {
      const cap = startupProfile?.capitalization
      return {
        title: 'Capitalization Share Pools',
        subtitle: 'Distribution of authorized, issued, outstanding, and reserved shares.',
        primaryLabel: 'Shares',
        data: cap
          ? [
              { label: 'Authorized', primaryValue: cap.authorizedShares },
              { label: 'Issued', primaryValue: cap.issuedShares },
              { label: 'Outstanding', primaryValue: cap.outstandingShares },
              { label: 'Reserved', primaryValue: cap.reservedShares },
            ]
          : [],
        emptyMessage: 'Configure your company capitalization structure in Company profile to inspect pool distribution.',
      }
    }

    return {
      title: 'Marketplace Pool Volume',
      subtitle: 'Target vs. committed capital across recent startup fundraising pools.',
      primaryLabel: 'Target',
      secondaryLabel: 'Committed',
      data: adminPools.slice(0, 5).map((pool) => ({
        label: pool.companyName,
        primaryValue: pool.targetAmount,
        secondaryValue: pool.totalCommitted,
      })),
      emptyMessage: 'No fundraising pools configured on the platform yet.',
    }
  })()

  // Live pools automatically fetched from approved, public startups with OPEN rounds
  const activePoolList = role === 'ADMIN' ? adminPools : investorPools

  return (
    <div className="dashboard-page">
      {/* Main 1-2 Line Heading + Single Primary CTA */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">{current.eyebrow}</p>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>
        {section === 'overview' && current.actionLabel && current.actionTo && (
          <Link to={current.actionTo}>
            <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} strokeWidth={2} />}>
              {current.actionLabel}
            </Button>
          </Link>
        )}
      </div>

      {/* STARTUP-SPECIFIC: Status Stepper & Next Best Action */}
      {role === 'STARTUP' && section === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Review Lifecycle</p>
                <h2 style={{ fontSize: 'var(--font-h3)', margin: 0 }}>Company Review Status</h2>
              </div>
              <StatusPill status={reviewStatus} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 'var(--space-2)',
                alignItems: 'center',
                margin: 'var(--space-4) 0',
              }}
            >
              {stepperSteps.map((step, idx) => {
                const state = getStepState(step.key)
                let iconColor = 'var(--text-tertiary)'
                let bgColor = 'var(--bg-subtle)'
                let borderColor = 'var(--border)'

                if (state === 'complete') {
                  iconColor = 'var(--positive-text)'
                  bgColor = 'var(--positive-subtle)'
                  borderColor = 'var(--positive-border)'
                } else if (state === 'current') {
                  iconColor = 'var(--accent)'
                  bgColor = 'var(--accent-subtle)'
                  borderColor = 'var(--accent-border)'
                } else if (state === 'warning') {
                  iconColor = 'var(--warning-text)'
                  bgColor = 'var(--warning-subtle)'
                  borderColor = 'var(--warning-border)'
                }

                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div
                      style={{
                        height: '4px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor:
                          state === 'complete'
                            ? 'var(--positive)'
                            : state === 'current'
                              ? 'var(--accent)'
                              : state === 'warning'
                                ? 'var(--warning)'
                                : 'var(--border)',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-caption)',
                          fontWeight: 'var(--weight-bold)',
                          backgroundColor: bgColor,
                          color: iconColor,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        {state === 'complete' ? <Check size={10} strokeWidth={2.5} /> : idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--font-caption)',
                          fontWeight: state === 'current' ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                          color: state === 'upcoming' ? 'var(--text-tertiary)' : 'var(--text)',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {reviewStatus === 'CHANGES_REQUESTED' && startupProfile?.reviewNote && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--warning-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warning-border)',
                  marginTop: 'var(--space-4)',
                }}
              >
                <AlertCircle size={20} strokeWidth={1.75} style={{ color: 'var(--warning-text)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: 'var(--font-small)', color: 'var(--warning-text)' }}>
                    Action needed: Reviewer requested revisions
                  </strong>
                  <p style={{ fontSize: 'var(--font-small)', color: 'var(--text)', marginTop: '4px' }}>
                    &ldquo;{startupProfile.reviewNote}&rdquo;
                  </p>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Link to="/app/startup/profile">
                      <Button variant="secondary" size="sm">
                        Update and resubmit profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              borderLeft: '3px solid var(--ink)',
            }}
          >
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Recommended next step</p>
              <h3 style={{ fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', margin: 'var(--space-1) 0' }}>
                {!startupProfile
                  ? 'Build your company profile'
                  : reviewStatus === 'DRAFT'
                    ? 'Review and submit profile for admin review'
                    : reviewStatus === 'CHANGES_REQUESTED'
                      ? 'Revise company details according to admin note'
                      : reviewStatus === 'SUBMITTED'
                        ? 'Profile submitted — await administrator approval'
                        : !startupPool || startupPool.status !== 'OPEN'
                          ? 'Configure and launch your simulated fundraising round'
                          : 'Your fundraising round is open to investors'}
              </h3>
              <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 0 }}>
                {!startupProfile
                  ? 'Add your company story, stage-aware metrics, and pitch deck link.'
                  : reviewStatus === 'DRAFT'
                    ? 'Ensure all required stage metrics are entered before requesting approval.'
                    : reviewStatus === 'CHANGES_REQUESTED'
                      ? 'Admins left specific guidance on what to improve.'
                      : reviewStatus === 'SUBMITTED'
                        ? 'We will notify you once an admin completes the review.'
                        : !startupPool || startupPool.status !== 'OPEN'
                          ? 'Define target amount, minimum commitments, and valuation cap.'
                          : 'Monitor incoming commitments and review investor introductions.'}
              </p>
            </div>

            <div>
              {!startupProfile || reviewStatus === 'DRAFT' || reviewStatus === 'CHANGES_REQUESTED' ? (
                <Link to="/app/startup/profile">
                  <Button variant="primary" size="md" rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                    Open profile
                  </Button>
                </Link>
              ) : reviewStatus === 'APPROVED' ? (
                <Link to="/app/startup/fundraising">
                  <Button variant="primary" size="md" rightIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                    Open round
                  </Button>
                </Link>
              ) : null}
            </div>
          </Card>
        </div>
      )}

      {/* Visual Analytics Section (2-Column Graphs) */}
      {section === 'overview' && (
        <section className="overview-analytics-grid" aria-label="Workspace analytics">
          {/* Left Visual Card: Funding Momentum / Pipeline Progress */}
          <Card className="overview-chart-card">
            <div className="overview-chart-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  <TrendingUp size={18} style={{ color: 'var(--accent)' }} aria-hidden="true" />
                  <h3>
                    {role === 'STARTUP'
                      ? 'Fundraising Pool Momentum'
                      : role === 'ADMIN'
                        ? 'Review & Pool Momentum'
                        : 'Open Round Momentum'}
                  </h3>
                </div>
                <p>
                  {role === 'STARTUP'
                    ? 'Live share commitments against your configured round target.'
                    : 'Funding progress updated automatically as approved startups open rounds.'}
                </p>
              </div>
            </div>

            {role === 'STARTUP' ? (
              startupPool ? (
                <div className="overview-progress-list">
                  <div className="overview-progress-item">
                    <div className="overview-progress-meta">
                      <strong>{startupPool.title}</strong>
                      <span>
                        {formatCompactINR(startupPool.totalCommitted)} / {formatCompactINR(startupPool.targetAmount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        startupPool.targetAmount > 0
                          ? (startupPool.totalCommitted / startupPool.targetAmount) * 100
                          : 0
                      }
                      label={startupPool.title}
                    />
                    <div className="overview-progress-foot">
                      <span>{formatShares(startupPool.sharesAllocated)} shares allocated</span>
                      <span>{formatShares(startupPool.sharesRemaining)} remaining</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overview-chart-empty">
                  <p>Configure a fundraising round to track commitment velocity and share allocations.</p>
                </div>
              )
            ) : activePoolList.length === 0 ? (
              <div className="overview-chart-empty">
                <p>No active fundraising pools available yet. Approved rounds will appear here automatically.</p>
              </div>
            ) : (
              <div className="overview-progress-list">
                {activePoolList.map((pool) => {
                  const pct = pool.targetAmount > 0 ? Math.min(100, Math.round((pool.totalCommitted / pool.targetAmount) * 100)) : 0
                  return (
                    <div key={pool.id} className="overview-progress-item">
                      <div className="overview-progress-meta">
                        <strong>{pool.companyName}</strong>
                        <span>
                          {formatCompactINR(pool.totalCommitted)} / {formatCompactINR(pool.targetAmount)} ({pct}%)
                        </span>
                      </div>
                      <ProgressBar value={pct} label={`${pool.companyName} funding progress`} />
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Right Visual Card: SVG Bar Comparison Chart */}
          <ComparisonBarChart
            title={chartConfig.title}
            subtitle={chartConfig.subtitle}
            primaryLabel={chartConfig.primaryLabel}
            secondaryLabel={chartConfig.secondaryLabel}
            data={chartConfig.data}
            emptyMessage={chartConfig.emptyMessage}
          />
        </section>
      )}

      {/* Editorial Feature Explanations (Pure Clean Prose Directly on Canvas, No Extra Navigation Links) */}
      {current.editorial.length > 0 && (
        <section className="overview-editorial-section" aria-label="Workspace features">
          <div className="overview-editorial-grid">
            {current.editorial.map((item) => (
              <article key={item.index} className="overview-editorial-item">
                <span className="overview-editorial-tag">
                  {item.index} · {item.category}
                </span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Fallback Workspace Panel for non-overview sections */}
      {section !== 'overview' && (
        <Card>
          <EmptyState
            title={current.emptyTitle}
            description={current.emptyDescription}
            action={
              current.actionLabel && current.actionTo ? (
                <Link to={current.actionTo}>
                  <Button variant="primary" size="sm">
                    {current.actionLabel}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      )}
    </div>
  )
}

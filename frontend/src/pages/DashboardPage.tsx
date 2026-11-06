import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { EmptyState } from '../components/feedback/States'
import { DashboardSpotlightWrapper } from '../components/dashboard/DashboardSpotlightWrapper'
import { roleLabel, type UserRole } from '../auth/auth.types'
import { useAuth } from '../auth/useAuth'
import { fetchStartupProfile } from '../startup/startup.api'
import { fetchStartupPool } from '../fundraising/fundraising.api'
import type { StartupProfile } from '../startup/startup.types'
import type { FundraisingPool } from '../fundraising/fundraising.types'
import {
  Badge,
  Button,
  Card,
  Stat,
  StatusPill,
} from '../design-system'
import {
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react'

type DashboardSection = 'overview' | 'profile' | 'fundraising' | 'discover' | 'portfolio' | 'reviews' | 'users'

type DashboardContent = {
  eyebrow: string
  title: string
  description: string
  cards: { label: string; value: string; note: string }[]
  emptyTitle: string
  emptyDescription: string
  actionLabel?: string
  actionTo?: string
}

const content: Record<UserRole, Record<DashboardSection, DashboardContent>> = {
  STARTUP: {
    overview: {
      eyebrow: 'Startup workspace',
      title: 'Make your next milestone easy to understand.',
      description: 'Your company workspace is the source of truth for the story and metrics you share with investors.',
      cards: [
        { label: 'Profile readiness', value: 'Live', note: 'Company story and metrics are live.' },
        { label: 'Fundraising', value: 'Live', note: 'Configure rounds when approved.' },
        { label: 'Investor interest', value: 'Live', note: 'Incoming introductions queue.' },
      ],
      emptyTitle: 'Your company story starts here',
      emptyDescription: 'Build a stage-aware profile, add the supporting context, and submit it when the story is ready for review.',
      actionLabel: 'Build company profile',
      actionTo: '/app/startup/profile',
    },
    profile: {
      eyebrow: 'Company profile',
      title: 'Give the right people a clear first look.',
      description: 'A guided profile will collect the context investors need, with draft saving and stage-aware fields.',
      cards: [
        { label: 'Company details', value: 'Live', note: 'Identity, product, and team.' },
        { label: 'Metrics', value: 'Stage-aware', note: 'Use the numbers that fit your stage.' },
        { label: 'Documents', value: 'Link support', note: 'Pitch and supporting links are available.' },
      ],
      emptyTitle: 'Build the profile investors can understand',
      emptyDescription: 'Save your company story, add the metrics that fit your stage, and submit it for review when ready.',
    },
    fundraising: {
      eyebrow: 'Fundraising',
      title: 'Turn momentum into a transparent round.',
      description: 'Fundraising pools, commitments, and review status connect here once the company profile is complete.',
      cards: [
        { label: 'Active round', value: 'Configure terms', note: 'Create a simulated fundraising pool.' },
        { label: 'Progress', value: 'Live', note: 'Capacity updates from commitments.' },
        { label: 'Pool status', value: 'Approval-gated', note: 'Only public approved profiles can open.' },
      ],
      emptyTitle: 'Configure a transparent fundraising pool',
      emptyDescription: 'Set the target, commitment limits, and close date. Once your profile is approved and public, you can open the round.',
      actionLabel: 'Open fundraising',
      actionTo: '/app/startup/fundraising',
    },
    discover: {
      eyebrow: 'Startup workspace',
      title: 'Discover is for investors.',
      description: 'Switch to an investor account to explore startups.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your startup navigation contains the tools that belong to a company account.',
    },
    portfolio: {
      eyebrow: 'Startup workspace',
      title: 'Portfolio is for investors.',
      description: 'Switch to an investor account to view simulated holdings.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your startup navigation contains the tools that belong to a company account.',
    },
    reviews: {
      eyebrow: 'Startup workspace',
      title: 'Review queue is for admins.',
      description: 'Switch to an admin account to review submissions.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    users: {
      eyebrow: 'Startup workspace',
      title: 'User management is for admins.',
      description: 'Switch to an admin account to view platform users.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
  },
  INVESTOR: {
    overview: {
      eyebrow: 'Investor workspace',
      title: 'Find the signal before the rush.',
      description: 'Your discovery and portfolio tools share one calm, explainable view of the opportunities you care about.',
      cards: [
        { label: 'Opportunities', value: 'Open rounds', note: 'Filter approved fundraising pools.' },
        { label: 'Watchlist', value: 'Live', note: 'Track theses & introductions.' },
        { label: 'Portfolio value', value: 'Live', note: 'Company share valuation analytics live.' },
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
      cards: [
        { label: 'Public listings', value: 'Live', note: 'Only approved public pools appear.' },
        { label: 'Saved startups', value: 'Live', note: 'Watchlist and thesis notes.' },
        { label: 'Active pools', value: 'Live', note: 'Capacity comes from stored commitments.' },
      ],
      emptyTitle: 'The discovery room is quiet',
      emptyDescription: 'Open fundraising pools appear here after approved startups configure and open their terms.',
    },
    portfolio: {
      eyebrow: 'Portfolio',
      title: 'Know what your position means.',
      description: 'Simulated commitments, company equity shares, valuation snapshots, and illustrative gains are calculated without real money transfers.',
      cards: [
        { label: 'Committed', value: 'Live', note: 'Active simulated commitments.' },
        { label: 'Equity Shares', value: 'Live', note: 'Company-specific equity shares.' },
        { label: 'Estimated value', value: 'Live', note: 'Updates from valuation snapshots.' },
      ],
      emptyTitle: 'Your portfolio is intentionally empty',
      emptyDescription: 'Once simulated commitments exist, this page will explain the original inputs and the changes over time.',
    },
    profile: {
      eyebrow: 'Investor workspace',
      title: 'Company profiles are for startups.',
      description: 'Switch to a startup account to build a company profile.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your investor navigation contains discovery and portfolio tools.',
    },
    fundraising: {
      eyebrow: 'Investor workspace',
      title: 'Fundraising management is for startups.',
      description: 'Switch to a startup account to manage a round.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    reviews: {
      eyebrow: 'Investor workspace',
      title: 'Review queue is for admins.',
      description: 'Switch to an admin account to review submissions.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    users: {
      eyebrow: 'Investor workspace',
      title: 'User management is for admins.',
      description: 'Switch to an admin account to view platform users.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
  },
  ADMIN: {
    overview: {
      eyebrow: 'Admin workspace',
      title: 'Keep the platform worthy of trust.',
      description: 'Review, visibility, and audit workflows gather here as the product adds real startup and investment data.',
      cards: [
        { label: 'Submissions', value: 'Live', note: 'Review profiles with context.' },
        { label: 'Fundraising pools', value: 'Live', note: 'Control round access.' },
        { label: 'Audit activity', value: 'Tracked', note: 'Review actions are recorded.' },
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
      cards: [
        { label: 'Needs review', value: 'Live', note: 'Submitted profiles appear here.' },
        { label: 'Changes requested', value: 'Tracked', note: 'Keep the feedback loop clear.' },
        { label: 'Approved listings', value: 'Controlled', note: 'Visibility is approval-gated.' },
      ],
      emptyTitle: 'Open the live review queue',
      emptyDescription: 'The review page reads connected startup profiles and records each admin action.',
    },
    users: {
      eyebrow: 'Platform users',
      title: 'Understand who is in the room.',
      description: 'User search, account status, and role controls will arrive as admin workflows mature.',
      cards: [
        { label: 'Startups', value: '—', note: 'No summary endpoint yet.' },
        { label: 'Investors', value: '—', note: 'No summary endpoint yet.' },
        { label: 'Admins', value: '—', note: 'No summary endpoint yet.' },
      ],
      emptyTitle: 'User management is staged for a later pass',
      emptyDescription: 'The current role boundary is live and enforced; detailed admin controls arrive with the domain workflows.',
    },
    profile: {
      eyebrow: 'Admin workspace',
      title: 'Company profiles are managed by startups.',
      description: 'Switch to a startup account to build a company profile.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'Your admin navigation contains review and platform controls.',
    },
    fundraising: {
      eyebrow: 'Admin workspace',
      title: 'Fundraising pools keep their promises.',
      description: 'Review terms, capacity, and whether a simulated round is accepting investor commitments.',
      cards: [],
      emptyTitle: 'Open fundraising controls',
      emptyDescription: 'Use the fundraising pools page to manage round access.',
    },
    discover: {
      eyebrow: 'Admin workspace',
      title: 'Discovery is for investors.',
      description: 'Switch to an investor account to explore public startup listings.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
    portfolio: {
      eyebrow: 'Admin workspace',
      title: 'Portfolio is for investors.',
      description: 'Switch to an investor account to view simulated holdings.',
      cards: [],
      emptyTitle: 'This area is not part of your workspace',
      emptyDescription: 'This route is protected by the backend too.',
    },
  },
}

export { DashboardRedirectPage } from './DashboardRedirectPage'

export default function DashboardPage({ role, section }: { role: UserRole; section: DashboardSection }) {
  const { user } = useAuth()
  const location = useLocation()
  const [startupProfile, setStartupProfile] = useState<StartupProfile | null>(null)
  const [startupPool, setStartupPool] = useState<FundraisingPool | null>(null)

  useEffect(() => {
    if (role === 'STARTUP') {
      fetchStartupProfile().then((p) => p && setStartupProfile(p)).catch(() => {})
      fetchStartupPool().then((p) => p && setStartupPool(p)).catch(() => {})
    }
  }, [role])

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

  return (
    <DashboardSpotlightWrapper>
      <div className="dashboard-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">{current.eyebrow}</p>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>
        <Badge variant="neutral">{roleLabel(user.role)}</Badge>
      </div>

      <div className="welcome-strip">
        <div>
          <span>Signed in as</span>
          <strong>{user.email}</strong>
        </div>
        <span className="welcome-location">{location.pathname}</span>
      </div>

      {/* STARTUP-SPECIFIC: Status Stepper & Next Best Action */}
      {role === 'STARTUP' && section === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Status Stepper Card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Review Lifecycle</p>
                <h2 style={{ fontSize: 'var(--font-h3)', margin: 0 }}>Company Review Status</h2>
              </div>
              <StatusPill status={reviewStatus} />
            </div>

            {/* Stepper Visual */}
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
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
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

            {/* Admin Feedback Callout (if changes requested) */}
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
                    "{startupProfile.reviewNote}"
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

          {/* Next Best Action Card */}
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
              <h3 style={{ fontSize: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', margin: '4px 0' }}>
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

      {/* Metric Grid */}
      {current.cards.length > 0 && (
        <section className="metric-grid" aria-label="Workspace summary">
          {current.cards.map((card) => (
            <Card key={card.label}>
              <Stat label={card.label} value={card.value} subtext={card.note} />
            </Card>
          ))}
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
    </DashboardSpotlightWrapper>
  )
}

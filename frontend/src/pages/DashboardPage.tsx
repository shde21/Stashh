import { Link, Navigate, useLocation } from 'react-router-dom'
import { EmptyState } from '../components/feedback/States'
import { roleLabel, type UserRole } from '../auth/auth.types'
import { useAuth } from '../auth/useAuth'

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
      eyebrow: 'Startup workspace', title: 'Make your next milestone easy to understand.',
      description: 'Your company workspace will become the source of truth for the story you share with investors.',
      cards: [{ label: 'Profile readiness', value: 'Not started', note: 'Stage 3 will bring onboarding here.' }, { label: 'Fundraising', value: 'Not open', note: 'Pools arrive in Stage 4.' }, { label: 'Review status', value: 'Draft', note: 'Nothing has been submitted yet.' }],
      emptyTitle: 'Your company story starts here', emptyDescription: 'The onboarding flow will help you add the right context without forcing a pre-revenue company into the wrong metrics.', actionLabel: 'Preview onboarding', actionTo: '/app/startup/profile',
    },
    profile: {
      eyebrow: 'Company profile', title: 'Give the right people a clear first look.',
      description: 'A guided profile will collect the context investors need, with draft saving and stage-aware fields.',
      cards: [{ label: 'Company details', value: 'Coming next', note: 'Identity, product, team.' }, { label: 'Metrics', value: 'Coming next', note: 'Relevant to your stage.' }, { label: 'Documents', value: 'Coming next', note: 'Secure uploads arrive in Stage 3.' }],
      emptyTitle: 'Profile builder is ready for Stage 3', emptyDescription: 'This shell is intentionally honest: there is no fake company data here, only the path where your profile will live.',
    },
    fundraising: {
      eyebrow: 'Fundraising', title: 'Turn momentum into a transparent round.',
      description: 'Fundraising pools, commitments, and review status will connect here once the company profile is complete.',
      cards: [{ label: 'Active round', value: 'Not configured', note: 'Rounds arrive in Stage 4.' }, { label: 'Progress', value: '—', note: 'No commitments yet.' }, { label: 'Pool status', value: 'Closed', note: 'Nothing is live.' }],
      emptyTitle: 'No fundraising pool yet', emptyDescription: 'Complete the company profile first. When fundraising arrives, progress will be calculated from stored commitments.', actionLabel: 'Open company profile', actionTo: '/app/startup/profile',
    },
    discover: { eyebrow: 'Startup workspace', title: 'Discover is for investors.', description: 'Switch to an investor account to explore startups.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'Your startup navigation contains the tools that belong to a company account.' },
    portfolio: { eyebrow: 'Startup workspace', title: 'Portfolio is for investors.', description: 'Switch to an investor account to view simulated holdings.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'Your startup navigation contains the tools that belong to a company account.' },
    reviews: { eyebrow: 'Startup workspace', title: 'Review queue is for admins.', description: 'Switch to an admin account to review submissions.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
    users: { eyebrow: 'Startup workspace', title: 'User management is for admins.', description: 'Switch to an admin account to view platform users.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
  },
  INVESTOR: {
    overview: {
      eyebrow: 'Investor workspace', title: 'Find the signal before the rush.',
      description: 'Your discovery and portfolio tools will share one calm, explainable view of the opportunities you care about.',
      cards: [{ label: 'Opportunities', value: 'Coming soon', note: 'Discovery arrives in Stage 4.' }, { label: 'Portfolio value', value: '—', note: 'QUANTS arrive in Stage 5.' }, { label: 'Activity', value: 'Quiet for now', note: 'Your timeline starts with your first action.' }],
      emptyTitle: 'Your investment view starts with discovery', emptyDescription: 'When startup listings arrive, you will be able to explore them with context instead of relying on placeholder metrics.', actionLabel: 'Open discovery preview', actionTo: '/app/investor/discover',
    },
    discover: {
      eyebrow: 'Discover startups', title: 'Explore what is being built.',
      description: 'Search, filters, pitch context, and fundraising progress will come together here in Stage 4.',
      cards: [{ label: 'Public listings', value: 'Not live', note: 'Discovery arrives in Stage 4.' }, { label: 'Saved startups', value: '0', note: 'Save workflows arrive later.' }, { label: 'Active pools', value: '—', note: 'No simulated pools yet.' }],
      emptyTitle: 'The discovery room is being prepared', emptyDescription: 'There are no fabricated startups in this view. The first listings will come from the connected backend.',
    },
    portfolio: {
      eyebrow: 'Portfolio', title: 'Know what your position means.',
      description: 'Commitments, QUANTS, valuation snapshots, and illustrative gains will be derived from stored records in Stage 5.',
      cards: [{ label: 'Committed', value: '₹0', note: 'No simulated commitments.' }, { label: 'QUANTS', value: '0', note: 'Allocation arrives in Stage 5.' }, { label: 'Estimated value', value: '₹0', note: 'No positions yet.' }],
      emptyTitle: 'Your portfolio is intentionally empty', emptyDescription: 'Once simulated commitments exist, this page will explain the original inputs and the changes over time.',
    },
    profile: { eyebrow: 'Investor workspace', title: 'Company profiles are for startups.', description: 'Switch to a startup account to build a company profile.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'Your investor navigation contains discovery and portfolio tools.' },
    fundraising: { eyebrow: 'Investor workspace', title: 'Fundraising management is for startups.', description: 'Switch to a startup account to manage a round.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
    reviews: { eyebrow: 'Investor workspace', title: 'Review queue is for admins.', description: 'Switch to an admin account to review submissions.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
    users: { eyebrow: 'Investor workspace', title: 'User management is for admins.', description: 'Switch to an admin account to view platform users.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
  },
  ADMIN: {
    overview: {
      eyebrow: 'Admin workspace', title: 'Keep the platform worthy of trust.',
      description: 'Review, visibility, and audit workflows will gather here as the product adds real startup and investment data.',
      cards: [{ label: 'Submissions', value: '0', note: 'Review workflow arrives in Stage 3.' }, { label: 'Fundraising pools', value: '0', note: 'Pool management arrives in Stage 4.' }, { label: 'Audit activity', value: 'Quiet', note: 'Important actions will be recorded.' }],
      emptyTitle: 'The platform is ready for its first review queue', emptyDescription: 'This admin shell uses real session identity without inventing submissions or user activity.', actionLabel: 'Preview review queue', actionTo: '/app/admin/reviews',
    },
    reviews: { eyebrow: 'Review queue', title: 'Review with context, not shortcuts.', description: 'Startup submissions, feedback, and status history will arrive in Stage 3.', cards: [{ label: 'Needs review', value: '0', note: 'No submissions yet.' }, { label: 'Changes requested', value: '0', note: 'No open loops yet.' }, { label: 'Approved listings', value: '0', note: 'Visibility controls arrive later.' }], emptyTitle: 'No submissions need attention', emptyDescription: 'The queue is empty because startup onboarding has not been implemented yet. That is better than showing pretend records.' },
    users: { eyebrow: 'Platform users', title: 'Understand who is in the room.', description: 'User search, account status, and role controls will arrive as admin workflows mature.', cards: [{ label: 'Startups', value: '—', note: 'No summary endpoint yet.' }, { label: 'Investors', value: '—', note: 'No summary endpoint yet.' }, { label: 'Admins', value: '—', note: 'No summary endpoint yet.' }], emptyTitle: 'User management is staged for a later pass', emptyDescription: 'The current role boundary is live and enforced; detailed admin controls arrive with the domain workflows.' },
    profile: { eyebrow: 'Admin workspace', title: 'Company profiles are managed by startups.', description: 'Switch to a startup account to build a company profile.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'Your admin navigation contains review and platform controls.' },
    fundraising: { eyebrow: 'Admin workspace', title: 'Fundraising management arrives in Stage 4.', description: 'Pool controls will be available here after the core startup and discovery workflows are connected.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'Use the admin review queue for now.' },
    discover: { eyebrow: 'Admin workspace', title: 'Discovery is for investors.', description: 'Switch to an investor account to explore public startup listings.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
    portfolio: { eyebrow: 'Admin workspace', title: 'Portfolio is for investors.', description: 'Switch to an investor account to view simulated holdings.', cards: [], emptyTitle: 'This area is not part of your workspace', emptyDescription: 'This route is protected by the backend too.' },
  },
}

export default function DashboardPage({ role, section }: { role: UserRole; section: DashboardSection }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user || user.role !== role) return <Navigate to="/forbidden" replace />
  const current = content[role][section]

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div><p className="eyebrow">{current.eyebrow}</p><h1>{current.title}</h1><p>{current.description}</p></div>
        <span className="role-badge">{roleLabel(user.role)}</span>
      </div>
      <div className="welcome-strip"><div><span>Signed in as</span><strong>{user.email}</strong></div><span className="welcome-location">{location.pathname}</span></div>
      {current.cards.length > 0 && <section className="metric-grid" aria-label="Workspace summary">{current.cards.map((card) => <article className="metric-card" key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></article>)}</section>}
      <section className="workspace-panel">
        <EmptyState
          title={current.emptyTitle}
          description={current.emptyDescription}
          action={current.actionLabel && current.actionTo ? <Link className="button button-small" to={current.actionTo}>{current.actionLabel} <span>↗</span></Link> : undefined}
        />
      </section>
    </div>
  )
}

export function DashboardRedirectPage() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/app/${user.role.toLowerCase()}`} replace />
}

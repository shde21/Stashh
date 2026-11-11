import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { commitToPool, fetchInvestorPools } from '../fundraising/fundraising.api'
import type { FundraisingPool } from '../fundraising/fundraising.types'
import {
  expressInterest,
  fetchInvestorInterests,
  fetchWatchlist,
  removeFromWatchlist,
  saveToWatchlist,
  withdrawInterest,
} from '../marketplace/marketplace.api'
import type { InterestResponse, MarketplaceStartup } from '../marketplace/marketplace.types'
import type { StartupStage } from '../startup/startup.types'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  ProgressBar,
  Select,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Textarea,
  Th,
  daysLeft,
  formatCompactINR,
  formatDate,
  formatINR,
  formatShares,
  useToast,
} from '../design-system'
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Info,
  LayoutGrid,
  List,
  MessageSquare,
  Search,
} from 'lucide-react'

type SortOption = 'progress' | 'target_desc' | 'target_asc' | 'days_left'

export default function InvestorDiscoverPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [pools, setPools] = useState<FundraisingPool[]>([])
  const [watchlist, setWatchlist] = useState<MarketplaceStartup[]>([])
  const [interests, setInterests] = useState<InterestResponse[]>([])

  const [sector, setSector] = useState('')
  const [stage, setStage] = useState<StartupStage | ''>('')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('progress')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  // Modals state
  const [detailPool, setDetailPool] = useState<FundraisingPool | null>(null)
  const [commitPool, setCommitPool] = useState<FundraisingPool | null>(null)
  const [commitAmount, setCommitAmount] = useState<string>('')
  const [commitStep, setCommitStep] = useState<'input' | 'confirm'>('input')
  const [commitSubmitting, setCommitSubmitting] = useState(false)
  const [commitError, setCommitError] = useState('')

  const [interestPool, setInterestPool] = useState<FundraisingPool | null>(null)
  const [interestMessage, setInterestMessage] = useState('')
  const [interestSubmitting, setInterestSubmitting] = useState(false)

  const [notePool, setNotePool] = useState<FundraisingPool | null>(null)
  const [thesisNote, setThesisNote] = useState('')

  const [withdrawPool, setWithdrawPool] = useState<FundraisingPool | null>(null)
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([fetchInvestorPools(), fetchWatchlist(), fetchInvestorInterests()])
      .then(([nextPools, nextWatchlist, nextInterests]) => {
        setPools(nextPools)
        setWatchlist(nextWatchlist)
        setInterests(nextInterests)
      })
      .catch((nextError: unknown) =>
        setError(nextError instanceof Error ? nextError.message : 'The marketplace could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  async function loadPools(filters = { sector, stage, query }) {
    setError('')
    try {
      setPools(await fetchInvestorPools(filters))
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Open fundraising pools could not be loaded.')
    } finally {
      setSearching(false)
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearching(true)
    await loadPools({ sector, stage, query })
  }

  const sortedPools = useMemo(() => {
    return [...pools].sort((a, b) => {
      if (sortBy === 'progress') {
        const progA = a.targetAmount > 0 ? a.totalCommitted / a.targetAmount : 0
        const progB = b.targetAmount > 0 ? b.totalCommitted / b.targetAmount : 0
        return progB - progA
      }
      if (sortBy === 'target_desc') return b.targetAmount - a.targetAmount
      if (sortBy === 'target_asc') return a.targetAmount - b.targetAmount
      if (sortBy === 'days_left') {
        const dA = daysLeft(a.endsAt) ?? 999
        const dB = daysLeft(b.endsAt) ?? 999
        return dA - dB
      }
      return 0
    })
  }, [pools, sortBy])

  // Watchlist actions
  async function handleToggleWatchlist(pool: FundraisingPool) {
    const isSaved = watchlist.some((item) => item.profileId === pool.profileId)
    if (isSaved) {
      setWorkingId(pool.profileId)
      try {
        await withCsrf((token) => removeFromWatchlist(pool.profileId, token))
        setWatchlist((current) => current.filter((item) => item.profileId !== pool.profileId))
        showToast(`Removed ${pool.companyName} from watchlist.`, 'info')
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Failed to update watchlist', 'error')
      } finally {
        setWorkingId(null)
      }
    } else {
      setNotePool(pool)
      setThesisNote('')
    }
  }

  async function handleConfirmSaveWatchlist() {
    if (!notePool) return
    setWorkingId(notePool.profileId)
    try {
      await withCsrf((token) => saveToWatchlist(notePool.profileId, thesisNote, token))
      setWatchlist((current) => [
        ...current,
        {
          profileId: notePool.profileId,
          companyName: notePool.companyName,
          tagline: notePool.tagline,
          sector: notePool.sector,
          stage: notePool.stage,
          note: thesisNote || null,
          savedAt: new Date().toISOString(),
        },
      ])
      showToast(`Added ${notePool.companyName} to watchlist.`, 'success')
      setNotePool(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save to watchlist', 'error')
    } finally {
      setWorkingId(null)
    }
  }

  // Interest actions
  function handleInterestClick(pool: FundraisingPool) {
    const existing = interests.find((item) => item.profileId === pool.profileId && item.status === 'PENDING')
    if (existing) {
      setWithdrawPool(pool)
    } else {
      setInterestPool(pool)
      setInterestMessage('I would like to learn more about the company and round terms.')
    }
  }

  async function handleConfirmWithdraw() {
    if (!withdrawPool) return
    setWithdrawSubmitting(true)
    try {
      const updated = await withCsrf((token) => withdrawInterest(withdrawPool.profileId, token))
      setInterests((current) => current.map((item) => (item.profileId === withdrawPool.profileId ? updated : item)))
      showToast(`Introduction to ${withdrawPool.companyName} withdrawn.`, 'info')
      setWithdrawPool(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to withdraw interest', 'error')
    } finally {
      setWithdrawSubmitting(false)
    }
  }

  async function handleSendInterest() {
    if (!interestPool) return
    setInterestSubmitting(true)
    try {
      const sent = await withCsrf((token) => expressInterest(interestPool.profileId, interestMessage, token))
      setInterests((current) => [sent, ...current.filter((item) => item.profileId !== interestPool.profileId)])
      showToast(`Introduction sent to ${interestPool.companyName}.`, 'success')
      setInterestPool(null)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to send introduction', 'error')
    } finally {
      setInterestSubmitting(false)
    }
  }

  // Commit flow
  function openCommitModal(pool: FundraisingPool) {
    setCommitPool(pool)
    setCommitAmount(String(pool.minCommitment))
    setCommitStep('input')
    setCommitError('')
  }

  async function handleExecuteCommit() {
    if (!commitPool) return
    const num = Number(commitAmount)
    if (!num || num < commitPool.minCommitment) {
      setCommitError(`Minimum commitment is ${formatINR(commitPool.minCommitment)}.`)
      return
    }
    if (commitPool.maxCommitment && num > commitPool.maxCommitment) {
      setCommitError(`Maximum commitment is ${formatINR(commitPool.maxCommitment)}.`)
      return
    }
    const remainingCap = commitPool.targetAmount - commitPool.totalCommitted
    if (num > remainingCap && remainingCap > 0) {
      setCommitError(`Commitment exceeds remaining capacity (${formatINR(remainingCap)}).`)
      return
    }

    setCommitSubmitting(true)
    setCommitError('')
    try {
      const saved = await withCsrf((token) => commitToPool(commitPool.id, num, token))
      setPools((current) =>
        current.map((item) =>
          item.id === commitPool.id
            ? {
                ...item,
                totalCommitted: item.totalCommitted + saved.amount,
                sharesAllocated: item.sharesAllocated + saved.sharesAllocated,
                sharesRemaining: Math.max(0, item.sharesRemaining - saved.sharesAllocated),
                commitmentCount: item.commitmentCount + 1,
                viewerCommitment: saved.amount,
                viewerSharesAllocated: saved.sharesAllocated,
              }
            : item,
        ),
      )
      showToast(`Successfully committed ${formatINR(num)} for ${formatShares(saved.sharesAllocated)} shares in ${commitPool.companyName}.`, 'success')
      setCommitPool(null)
      if (detailPool?.id === commitPool.id) {
        setDetailPool((prev) =>
          prev
            ? {
                ...prev,
                totalCommitted: prev.totalCommitted + saved.amount,
                sharesAllocated: prev.sharesAllocated + saved.sharesAllocated,
                sharesRemaining: Math.max(0, prev.sharesRemaining - saved.sharesAllocated),
                commitmentCount: prev.commitmentCount + 1,
                viewerCommitment: saved.amount,
                viewerSharesAllocated: saved.sharesAllocated,
              }
            : null,
        )
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) setCommitError(err.message)
      else setCommitError(err instanceof Error ? err.message : 'The commitment could not be saved.')
    } finally {
      setCommitSubmitting(false)
    }
  }

  if (loading) return <FullPageLoading label="Loading open fundraising pools…" />

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Marketplace Discovery</p>
          <h1>Find the signal before the rush.</h1>
          <p>
            Explore approved startup rounds, evaluate verified metrics, maintain thesis notes, and record simulated equity commitments.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Badge variant="neutral">{sortedPools.length} open rounds</Badge>
          <div className="vl-segmented" role="group" aria-label="View mode">
            <button
              type="button"
              className={`vl-segmented-btn ${viewMode === 'grid' ? 'vl-segmented-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={`vl-segmented-btn ${viewMode === 'table' ? 'vl-segmented-active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="vl-card vl-card-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
          <Field label="Search" htmlFor="search-input">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company or thesis..."
              />
            )}
          </Field>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
          <Field label="Sector" htmlFor="sector-filter">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g. Climate"
              />
            )}
          </Field>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
          <Field label="Stage" htmlFor="stage-filter">
            {(fieldProps) => (
              <Select
                {...fieldProps}
                value={stage}
                onChange={(e) => setStage(e.target.value as StartupStage | '')}
              >
                <option value="">All stages</option>
                <option value="PRE_REVENUE">Pre-revenue</option>
                <option value="EARLY_REVENUE">Early revenue</option>
                <option value="GROWTH">Growth</option>
              </Select>
            )}
          </Field>
        </div>

        <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
          <Field label="Sort by" htmlFor="sort-select">
            {(fieldProps) => (
              <Select
                {...fieldProps}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="progress">Highest progress</option>
                <option value="target_desc">Target: High to Low</option>
                <option value="target_asc">Target: Low to High</option>
                <option value="days_left">Ending soonest</option>
              </Select>
            )}
          </Field>
        </div>

        <div style={{ flex: '0 0 auto', marginBottom: 'var(--space-1)' }}>
          <Button type="submit" variant="secondary" size="md" loading={searching} leftIcon={<Search size={14} strokeWidth={1.75} />}>
            Filter
          </Button>
        </div>
      </form>

      {/* Main Content */}
      {sortedPools.length === 0 ? (
        <Card>
          <EmptyState
            title="No open rounds match your criteria"
            description="Adjust your search terms or sector filters, or check back when newly approved startups open their terms."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setSector('')
                  setStage('')
                  void loadPools({ sector: '', stage: '', query: '' })
                }}
              >
                Clear all filters
              </Button>
            }
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="startup-grid">
          {sortedPools.map((pool) => {
            const progress = pool.targetAmount > 0 ? Math.min(100, (pool.totalCommitted / pool.targetAmount) * 100) : 0
            const isSaved = watchlist.some((item) => item.profileId === pool.profileId)
            const activeInterest = interests.find((item) => item.profileId === pool.profileId && item.status === 'PENDING')
            const remaining = Math.max(0, pool.targetAmount - pool.totalCommitted)
            const daysRemaining = daysLeft(pool.endsAt)

            return (
              <Card as="article" key={pool.id} className="startup-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <Badge variant="neutral">{pool.sector || 'Startup'}</Badge>
                    <Badge variant="neutral">{pool.stage.replace('_', ' ')}</Badge>
                  </div>
                  {daysRemaining != null && (
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Calendar size={12} strokeWidth={1.75} />
                      {daysRemaining > 0 ? `${daysRemaining}d left` : 'Ending today'}
                    </span>
                  )}
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => setDetailPool(pool)}>
                  <h2 style={{ fontSize: 'var(--font-h3)', marginTop: 'var(--space-2)', marginBottom: '4px' }}>
                    {pool.companyName}
                  </h2>
                  <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', minHeight: '40px', lineHeight: '1.4' }}>
                    {pool.tagline || pool.title}
                  </p>
                </div>

                <div className="pool-terms" style={{ marginTop: 'auto' }}>
                  <span>
                    <strong>Target</strong>
                    {formatCompactINR(pool.targetAmount)}
                  </span>
                  <span>
                    <strong>Valuation cap</strong>
                    {pool.valuationCap ? formatCompactINR(pool.valuationCap) : 'None'}
                  </span>
                  <span>
                    <strong>Min. commit</strong>
                    {formatINR(pool.minCommitment)}
                  </span>
                </div>

                <div style={{ marginTop: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>{formatCompactINR(pool.totalCommitted)} raised ({progress.toFixed(0)}%)</span>
                    <span>{formatCompactINR(remaining)} left</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                {pool.viewerCommitment ? (
                  <div className="commitment-confirmation" style={{ marginTop: 'var(--space-3)' }}>
                    <span>You committed {formatINR(pool.viewerCommitment)} ({formatShares(pool.viewerSharesAllocated ?? (pool.pricePerShare > 0 ? Math.floor(pool.viewerCommitment / pool.pricePerShare) : 0))} shares). </span>
                    <Link to="/app/investor/portfolio" style={{ textDecoration: 'underline', color: 'inherit' }}>View portfolio</Link>
                  </div>
                ) : (
                  <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => openCommitModal(pool)}
                    >
                      Invest in Shares
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDetailPool(pool)}
                    >
                      Details
                    </Button>
                  </div>
                )}

                <div className="marketplace-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleToggleWatchlist(pool)}
                    disabled={workingId === pool.profileId}
                    leftIcon={isSaved ? <BookmarkCheck size={14} strokeWidth={1.75} style={{ color: 'var(--accent)' }} /> : <Bookmark size={14} strokeWidth={1.75} />}
                  >
                    {isSaved ? 'Saved' : 'Watch'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleInterestClick(pool)}
                    disabled={workingId === pool.profileId}
                    leftIcon={<MessageSquare size={14} strokeWidth={1.75} />}
                  >
                    {activeInterest ? 'Withdraw interest' : 'Introduce'}
                  </Button>

                  {isSaved && (
                    <Link to="/app/investor/watchlist" style={{ marginLeft: 'auto', fontSize: 'var(--font-caption)', color: 'var(--accent)' }}>
                      Thesis note ↗
                    </Link>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Company & Sector</Th>
                <Th>Stage</Th>
                <Th numeric>Target</Th>
                <Th numeric>Committed</Th>
                <Th numeric>Cap</Th>
                <Th>Progress</Th>
                <Th numeric>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sortedPools.map((pool) => {
                const progress = pool.targetAmount > 0 ? Math.min(100, (pool.totalCommitted / pool.targetAmount) * 100) : 0
                return (
                  <tr key={pool.id}>
                    <Td>
                      <button
                        type="button"
                        onClick={() => setDetailPool(pool)}
                        style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}
                      >
                        <strong style={{ display: 'block', color: 'var(--text)' }}>{pool.companyName}</strong>
                        <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                          {pool.sector || 'Startup'}
                        </span>
                      </button>
                    </Td>
                    <Td>
                      <Badge variant="neutral">{pool.stage.replace('_', ' ')}</Badge>
                    </Td>
                    <Td numeric>{formatCompactINR(pool.targetAmount)}</Td>
                    <Td numeric>{formatCompactINR(pool.totalCommitted)}</Td>
                    <Td numeric>{pool.valuationCap ? formatCompactINR(pool.valuationCap) : '—'}</Td>
                    <Td style={{ minWidth: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ flex: 1 }}>
                          <ProgressBar value={progress} />
                        </div>
                        <span style={{ fontSize: 'var(--font-caption)', fontVariantNumeric: 'tabular-nums' }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </Td>
                    <Td numeric>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openCommitModal(pool)}
                        >
                          Commit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailPool(pool)}
                        >
                          View
                        </Button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {/* DETAIL MODAL (Two-column layout, sticky round panel) */}
      <Modal
        isOpen={Boolean(detailPool)}
        onClose={() => setDetailPool(null)}
        title={detailPool?.companyName || 'Startup Details'}
        description={detailPool?.tagline || detailPool?.title}
        maxWidth="760px"
      >
        {detailPool && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)' }}>
            <div>
              <p className="eyebrow">Round Overview</p>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>{detailPool.title}</h3>
              <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: '1.5' }}>
                {detailPool.tagline || 'No detailed company description provided for this round.'}
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <Badge variant="neutral">{detailPool.sector || 'Startup'}</Badge>
                <Badge variant="neutral">{detailPool.stage.replace('_', ' ')}</Badge>
                <StatusPill status={detailPool.status} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                <span className="eyebrow">Important terms</span>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                  Commitments purchase company equity shares at the round price per share. Allocations are simulated and recorded for marketplace evaluation.
                </p>
              </div>
            </div>

            <Card style={{ backgroundColor: 'var(--surface-muted)' }}>
              <span className="eyebrow">Round Terms</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Price Per Share</span>
                  <strong>{formatINR(detailPool.pricePerShare)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Target Amount</span>
                  <strong>{formatINR(detailPool.targetAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shares Offered</span>
                  <strong>{formatShares(detailPool.totalSharesOffered)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shares Remaining</span>
                  <strong>{formatShares(detailPool.sharesRemaining)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Committed</span>
                  <strong>{formatINR(detailPool.totalCommitted)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Round Valuation</span>
                  <strong>{detailPool.valuationCap ? formatINR(detailPool.valuationCap) : (detailPool.roundValuationBasis ? formatINR(detailPool.roundValuationBasis) : 'None')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Min Commitment</span>
                  <strong>{formatINR(detailPool.minCommitment)}</strong>
                </div>
                {detailPool.maxCommitment && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Max Commitment</span>
                    <strong>{formatINR(detailPool.maxCommitment)}</strong>
                  </div>
                )}
                {detailPool.endsAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-small)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Closing Date</span>
                    <strong>{formatDate(detailPool.endsAt)}</strong>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                style={{ width: '100%', marginBottom: 'var(--space-2)' }}
                onClick={() => {
                  const p = detailPool
                  setDetailPool(null)
                  openCommitModal(p)
                }}
              >
                Invest in Shares
              </Button>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => void handleToggleWatchlist(detailPool)}
                >
                  {watchlist.some((w) => w.profileId === detailPool.profileId) ? 'Watchlisted' : 'Add to Watchlist'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    const p = detailPool
                    setDetailPool(null)
                    void handleInterestClick(p)
                  }}
                >
                  Introduce
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* COMMIT MODAL (Step 1: Input & live shares, Step 2: Confirm) */}
      <Modal
        isOpen={Boolean(commitPool)}
        onClose={() => setCommitPool(null)}
        title={commitStep === 'input' ? `Commit to ${commitPool?.companyName}` : 'Review commitment'}
        description={
          commitStep === 'input'
            ? 'Enter your simulated commitment in Indian Rupees (₹).'
            : 'Confirm details before recording this simulated position.'
        }
        footer={
          commitStep === 'input' ? (
            <>
              <Button variant="ghost" onClick={() => setCommitPool(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const num = Number(commitAmount)
                  if (!num || num < (commitPool?.minCommitment || 0)) {
                    setCommitError(`Minimum commitment is ${formatINR(commitPool?.minCommitment || 0)}.`)
                    return
                  }
                  if (commitPool?.maxCommitment && num > commitPool.maxCommitment) {
                    setCommitError(`Maximum commitment is ${formatINR(commitPool.maxCommitment)}.`)
                    return
                  }
                  const pps = commitPool?.pricePerShare || 10
                  if (num % pps !== 0) {
                    setCommitError(`Commitment must purchase a whole number of shares at ${formatINR(pps)} per share.`)
                    return
                  }
                  const sharesRequested = Math.floor(num / pps)
                  if (sharesRequested > (commitPool?.sharesRemaining ?? 0)) {
                    setCommitError(`Requested ${formatShares(sharesRequested)} shares exceeds remaining round capacity of ${formatShares(commitPool?.sharesRemaining ?? 0)} shares.`)
                    return
                  }
                  setCommitError('')
                  setCommitStep('confirm')
                }}
              >
                Review position
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setCommitStep('input')} disabled={commitSubmitting}>
                Back
              </Button>
              <Button variant="primary" loading={commitSubmitting} onClick={() => void handleExecuteCommit()}>
                Confirm commitment
              </Button>
            </>
          )
        }
      >
        {commitPool && (
          <div>
            {commitError && <div className="form-alert" role="alert">{commitError}</div>}

            {commitStep === 'input' ? (
              <>
                <Field
                  label="Commitment amount (₹)"
                  htmlFor="commit-inr-input"
                  hint={`Min: ${formatINR(commitPool.minCommitment)}${commitPool.maxCommitment ? ` · Max: ${formatINR(commitPool.maxCommitment)}` : ''} · Price: ${formatINR(commitPool.pricePerShare)}/share`}
                >
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      type="number"
                      min={commitPool.minCommitment}
                      max={commitPool.maxCommitment ?? undefined}
                      step={commitPool.pricePerShare || 10}
                      value={commitAmount}
                      onChange={(e) => setCommitAmount(e.target.value)}
                    />
                  )}
                </Field>

                <div style={{ margin: 'var(--space-4) 0', padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>Calculated Equity Allocation</span>
                    <strong style={{ fontSize: 'var(--font-h3)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatShares(commitPool.pricePerShare > 0 ? Math.floor((Number(commitAmount) || 0) / commitPool.pricePerShare) : 0)} shares
                    </strong>
                  </div>
                  <div style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Formula: {formatINR(commitPool.pricePerShare)} per share · {formatShares(commitPool.sharesRemaining)} shares remaining in round
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                  <Info size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  <span>No real money is transferred. This commitment is saved to your simulated investor portfolio.</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Company</span>
                  <strong>{commitPool.companyName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Round</span>
                  <strong>{commitPool.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Price per share</span>
                  <strong>{formatINR(commitPool.pricePerShare)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Committed amount</span>
                  <strong>{formatINR(Number(commitAmount))}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Share allocation</span>
                  <strong style={{ color: 'var(--accent)' }}>
                    {formatShares(commitPool.pricePerShare > 0 ? Math.floor(Number(commitAmount) / commitPool.pricePerShare) : 0)} shares
                  </strong>
                </div>
                <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                  You can cancel active simulated commitments at any time from your Portfolio page.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* THESIS NOTE MODAL */}
      <Modal
        isOpen={Boolean(notePool)}
        onClose={() => setNotePool(null)}
        title={`Add ${notePool?.companyName} to Watchlist`}
        description="Add a private investment thesis note. Only you can see this note."
        footer={
          <>
            <Button variant="ghost" onClick={() => setNotePool(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleConfirmSaveWatchlist()}>
              Save to Watchlist
            </Button>
          </>
        }
      >
        <Field label="Private thesis note" htmlFor="note-modal-input" hint="Why are you watching this company? What milestone are you awaiting?">
          {(fieldProps) => (
            <Textarea
              {...fieldProps}
              rows={3}
              value={thesisNote}
              onChange={(e) => setThesisNote(e.target.value)}
              placeholder="e.g. Strong team, looking for pilot enterprise revenue..."
            />
          )}
        </Field>
      </Modal>

      {/* INTRODUCTION / INTEREST MODAL */}
      <Modal
        isOpen={Boolean(interestPool)}
        onClose={() => setInterestPool(null)}
        title={`Introduce yourself to ${interestPool?.companyName}`}
        description="Send a lightweight introduction message to the founding team."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInterestPool(null)} disabled={interestSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={interestSubmitting} onClick={() => void handleSendInterest()}>
              Send introduction
            </Button>
          </>
        }
      >
        <Field label="Introduction message" htmlFor="interest-modal-input">
          {(fieldProps) => (
            <Textarea
              {...fieldProps}
              rows={4}
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Tell the founder about your fund or areas of interest..."
            />
          )}
        </Field>
      </Modal>

      {/* WITHDRAW INTRODUCTION CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(withdrawPool)}
        onClose={() => setWithdrawPool(null)}
        title="Withdraw introduction"
        description={`Are you sure you want to withdraw your formal expression of interest in ${withdrawPool?.companyName}? The founder will no longer see your pending introduction.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setWithdrawPool(null)} disabled={withdrawSubmitting}>
              Keep active
            </Button>
            <Button variant="destructive" loading={withdrawSubmitting} onClick={() => void handleConfirmWithdraw()}>
              Withdraw introduction
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 'var(--font-small)', color: 'var(--text-secondary)' }}>
          You can re-express interest at any time while the fundraising round remains open.
        </p>
      </Modal>
    </div>
  )
}

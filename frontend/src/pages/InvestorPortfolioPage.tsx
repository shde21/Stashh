import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { cancelInvestorCommitment } from '../fundraising/fundraising.api'
import { fetchInvestorPortfolio } from '../portfolio/portfolio.api'
import type { PortfolioSummary, PortfolioPosition } from '../portfolio/portfolio.types'
import {
  Badge,
  Button,
  Card,
  Modal,
  Stat,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Th,
  formatINR,
  formatPercent,
  formatShares,
  useToast,
} from '../design-system'
import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const ALLOCATION_COLORS = ['#FF6A00', '#2A5C43', '#10B981', '#F59E0B', '#1E4230', '#737373']

export default function InvestorPortfolioPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [portfolio, setPortfolio] = useState<PortfolioSummary>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingPosition, setCancellingPosition] = useState<PortfolioPosition | null>(null)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  useEffect(() => {
    fetchInvestorPortfolio()
      .then(setPortfolio)
      .catch((nextError: unknown) =>
        setError(nextError instanceof Error ? nextError.message : 'Commitments could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  async function handleConfirmCancel() {
    if (!cancellingPosition) return
    setCancelSubmitting(true)
    setError('')
    try {
      await withCsrf((token) => cancelInvestorCommitment(cancellingPosition.commitmentId, token))
      const refreshed = await fetchInvestorPortfolio()
      setPortfolio(refreshed)
      showToast(`Commitment to ${cancellingPosition.companyName} was cancelled.`, 'info')
      setCancellingPosition(null)
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The commitment could not be cancelled.')
    } finally {
      setCancelSubmitting(false)
    }
  }

  if (loading) return <FullPageLoading label="Loading your commitments…" />

  const positions = portfolio?.positions ?? []
  const activePositions = positions.filter((position) => position.status === 'ACTIVE')
  const cancelledCount = positions.length - activePositions.length
  const totalCommitted = portfolio?.totalCommitted ?? 0
  const valuedAmount = portfolio?.valuedAmount ?? 0
  const illustrativeGain = portfolio?.illustrativeGain ?? 0
  const gainPercent = totalCommitted > 0 ? (illustrativeGain / totalCommitted) * 100 : 0

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Portfolio Analytics</p>
          <h1>Know what your position means.</h1>
          <p>
            Illustrative values and share holdings are derived from your simulated commitments, company share prices, and startup valuation snapshots. No real money or custody is involved.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Badge variant="positive">{activePositions.length} active</Badge>
          {cancelledCount > 0 && <Badge variant="neutral">{cancelledCount} cancelled</Badge>}
        </div>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {/* Hero Stats */}
      <div className="metric-grid" aria-label="Portfolio summary">
        <Card>
          <Stat
            label="Total Committed"
            value={formatINR(totalCommitted)}
            subtext={`${activePositions.length} active companies`}
          />
        </Card>
        <Card>
          <Stat
            label="Illustrative Value"
            value={formatINR(valuedAmount)}
            subtext="Based on latest valuations"
          />
        </Card>
        <Card>
          <Stat
            label="Illustrative Gain / Loss"
            value={formatINR(illustrativeGain)}
            delta={{
              value: formatPercent(gainPercent),
              type: illustrativeGain >= 0 ? 'positive' : 'negative',
            }}
          />
        </Card>
      </div>

      {/* Allocation & Visual Representation */}
      {activePositions.length > 0 && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Capital Distribution</p>
              <h2 style={{ fontSize: 'var(--font-h3)', margin: 0 }}>Allocation Breakdown</h2>
            </div>
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
              Weighted by invested capital
            </span>
          </div>

          {/* Horizontal Proportional Bar */}
          <div
            style={{
              display: 'flex',
              height: '14px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-subtle)',
              marginBottom: 'var(--space-4)',
            }}
            role="img"
            aria-label="Portfolio allocation bar chart"
          >
            {activePositions.map((pos, idx) => {
              const pct = totalCommitted > 0 ? (pos.amount / totalCommitted) * 100 : 0
              const color = ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]
              return (
                <div
                  key={pos.commitmentId}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    borderRight: idx < activePositions.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                  title={`${pos.companyName}: ${pct.toFixed(1)}%`}
                />
              )
            })}
          </div>

          {/* Allocation Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--font-caption)' }}>
            {activePositions.map((pos, idx) => {
              const pct = totalCommitted > 0 ? (pos.amount / totalCommitted) * 100 : 0
              const color = ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]
              return (
                <div key={pos.commitmentId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} aria-hidden="true" />
                  <strong>{pos.companyName}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {pct.toFixed(1)}% ({formatINR(pos.amount)})
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Holdings & Positions Table */}
      <section aria-labelledby="holdings-title">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h2 id="holdings-title" style={{ fontSize: 'var(--font-h3)' }}>Holdings & Commitments</h2>
          <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
            {positions.length} recorded positions
          </span>
        </div>

        {positions.length === 0 ? (
          <Card>
            <EmptyState
              title="Your portfolio is intentionally empty"
              description="Explore open fundraising pools in the discovery room and record a simulated commitment when an opportunity fits your thesis."
              action={
                <Link to="/app/investor/discover">
                  <Button variant="primary" size="sm">
                    Explore open rounds
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Company & Round</Th>
                  <Th>Status</Th>
                  <Th numeric>Shares</Th>
                  <Th numeric>Issue Price</Th>
                  <Th numeric>Latest Share Price</Th>
                  <Th numeric>Ownership</Th>
                  <Th numeric>Committed (₹)</Th>
                  <Th numeric>Current Value</Th>
                  <Th numeric>Illustrative Gain</Th>
                  <Th numeric>Action</Th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => {
                  const isCancelled = position.status === 'CANCELLED'
                  const gain = position.illustrativeGain

                  return (
                    <tr
                      key={position.commitmentId}
                      style={{
                        opacity: isCancelled ? 0.6 : 1,
                        backgroundColor: isCancelled ? 'var(--bg-subtle)' : undefined,
                      }}
                    >
                      <Td>
                        <strong style={{ display: 'block', color: 'var(--text)' }}>
                          {position.companyName}
                        </strong>
                        <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                          {position.poolTitle}
                        </span>
                      </Td>
                      <Td>
                        <StatusPill status={position.status} />
                      </Td>
                      <Td numeric style={{ fontWeight: 'var(--weight-medium)' }}>
                        {formatShares(position.shares)}
                      </Td>
                      <Td numeric>{formatINR(position.acquisitionPricePerShare)}</Td>
                      <Td numeric>
                        {position.latestSharePrice != null ? formatINR(position.latestSharePrice) : '—'}
                      </Td>
                      <Td numeric>
                        {position.ownershipPercentage != null ? `${position.ownershipPercentage.toFixed(3)}%` : '—'}
                      </Td>
                      <Td numeric>{formatINR(position.amount)}</Td>
                      <Td numeric>
                        {position.currentValue != null ? (
                          formatINR(position.currentValue)
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>Awaiting valuation</span>
                        )}
                      </Td>
                      <Td numeric>
                        {gain != null ? (
                          <span className={gain >= 0 ? 'gain-positive' : 'gain-negative'}>
                            {gain >= 0 ? '+' : ''}{formatINR(gain)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                        )}
                      </Td>
                      <Td numeric>
                        {position.status === 'ACTIVE' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCancellingPosition(position)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
                            Cancelled
                          </span>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </section>

      {cancelledCount > 0 && (
        <p className="portfolio-footnote">
          {cancelledCount} cancelled position{cancelledCount === 1 ? '' : 's'} retained for transaction audit history.
        </p>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancellingPosition)}
        onClose={() => setCancellingPosition(null)}
        title="Cancel simulated commitment?"
        description={`Are you sure you want to cancel your commitment of ${formatINR(cancellingPosition?.amount ?? 0)} (${formatShares(cancellingPosition?.shares ?? 0)} shares) in ${cancellingPosition?.companyName}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancellingPosition(null)} disabled={cancelSubmitting}>
              Keep commitment
            </Button>
            <Button
              variant="destructive"
              loading={cancelSubmitting}
              onClick={() => void handleConfirmCancel()}
            >
              Confirm cancellation
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', padding: 'var(--space-3)', backgroundColor: 'var(--negative-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--negative-border)' }}>
          <AlertCircle size={18} strokeWidth={1.75} style={{ color: 'var(--negative)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--negative-text)', margin: 0 }}>
            This will release your allocated capacity back to the fundraising pool. The commitment will remain visible in your history marked as Cancelled.
          </p>
        </div>
      </Modal>
    </div>
  )
}

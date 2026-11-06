import { useEffect, useState, useMemo } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchAdminPools, setAdminPoolStatus } from '../fundraising/fundraising.api'
import type { FundraisingPool } from '../fundraising/fundraising.types'
import {
  Badge,
  Button,
  Card,
  Modal,
  ProgressBar,
  SegmentedControl,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Th,
  formatCompactINR,
  formatQuants,
  useToast,
} from '../design-system'
import { AlertCircle, Lock, Play } from 'lucide-react'

type StatusFilter = 'ALL' | 'OPEN' | 'CLOSED'

export default function AdminFundraisingPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [pools, setPools] = useState<FundraisingPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('ALL')

  // Status Change Confirmation Modal
  const [targetPool, setTargetPool] = useState<FundraisingPool | null>(null)
  const [targetStatus, setTargetStatus] = useState<'OPEN' | 'CLOSED' | null>(null)
  const [submittingStatus, setSubmittingStatus] = useState(false)

  useEffect(() => {
    fetchAdminPools()
      .then(setPools)
      .catch((nextError: unknown) =>
        setError(nextError instanceof Error ? nextError.message : 'Fundraising pools could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  const filteredPools = useMemo(() => {
    return pools.filter((p) => {
      if (filter === 'ALL') return true
      return p.status === filter
    })
  }, [pools, filter])

  function triggerStatusChange(pool: FundraisingPool, status: 'OPEN' | 'CLOSED') {
    setTargetPool(pool)
    setTargetStatus(status)
  }

  async function handleConfirmStatusChange() {
    if (!targetPool || !targetStatus) return
    setSubmittingStatus(true)
    setError('')
    try {
      const updated = await withCsrf((token) => setAdminPoolStatus(targetPool.id, targetStatus, token))
      setPools((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      showToast(`${targetPool.companyName} round is now ${targetStatus.toLowerCase()}.`, 'success')
      setTargetPool(null)
      setTargetStatus(null)
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The pool status could not be changed.')
    } finally {
      setSubmittingStatus(false)
    }
  }

  if (loading) return <FullPageLoading label="Loading fundraising controls…" />

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Round Governance</p>
          <h1>Fundraising Controls</h1>
          <p>
            Review terms, monitor commitment capacity in real time, and control which approved rounds are accepting simulated investor allocations.
          </p>
        </div>
        <Badge variant="neutral">{pools.length} total pools</Badge>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <SegmentedControl<StatusFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'ALL', label: 'All pools', count: pools.length },
            { id: 'OPEN', label: 'Open pools', count: pools.filter((p) => p.status === 'OPEN').length },
            { id: 'CLOSED', label: 'Closed pools', count: pools.filter((p) => p.status === 'CLOSED').length },
          ]}
        />
      </div>

      {filteredPools.length === 0 ? (
        <Card>
          <EmptyState
            title="No fundraising pools match"
            description="Approved startups can configure simulated rounds from their workspace."
          />
        </Card>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Company & Round</Th>
                <Th>Status</Th>
                <Th numeric>Target</Th>
                <Th numeric>Committed</Th>
                <Th numeric>Remaining</Th>
                <Th>Capacity</Th>
                <Th numeric>Commitments</Th>
                <Th numeric>Admin Action</Th>
              </tr>
            </thead>
            <tbody>
              {filteredPools.map((pool) => {
                const progress = pool.targetAmount > 0 ? Math.min(100, (pool.totalCommitted / pool.targetAmount) * 100) : 0
                const remaining = Math.max(0, pool.targetAmount - pool.totalCommitted)

                return (
                  <tr key={pool.id}>
                    <Td>
                      <strong style={{ display: 'block', color: 'var(--text)' }}>
                        {pool.companyName}
                      </strong>
                      <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                        {pool.title}
                      </span>
                    </Td>
                    <Td>
                      <StatusPill status={pool.status} />
                    </Td>
                    <Td numeric>{formatCompactINR(pool.targetAmount)}</Td>
                    <Td numeric>{formatCompactINR(pool.totalCommitted)}</Td>
                    <Td numeric>{formatCompactINR(remaining)}</Td>
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
                    <Td numeric style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {pool.commitmentCount} ({formatQuants(pool.totalCommitted / 1000)} Q)
                    </Td>
                    <Td numeric>
                      {pool.status !== 'OPEN' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => triggerStatusChange(pool, 'OPEN')}
                          leftIcon={<Play size={12} strokeWidth={1.75} />}
                        >
                          Open pool
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => triggerStatusChange(pool, 'CLOSED')}
                          leftIcon={<Lock size={12} strokeWidth={1.75} />}
                        >
                          Close pool
                        </Button>
                      )}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(targetPool && targetStatus)}
        onClose={() => {
          setTargetPool(null)
          setTargetStatus(null)
        }}
        title={targetStatus === 'OPEN' ? 'Open fundraising pool?' : 'Close fundraising pool?'}
        description={`Set status of ${targetPool?.companyName} round (${targetPool?.title}) to ${targetStatus?.toLowerCase()}.`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setTargetPool(null)
                setTargetStatus(null)
              }}
              disabled={submittingStatus}
            >
              Cancel
            </Button>
            <Button
              variant={targetStatus === 'OPEN' ? 'primary' : 'destructive'}
              loading={submittingStatus}
              onClick={() => void handleConfirmStatusChange()}
            >
              {targetStatus === 'OPEN' ? 'Confirm & Open' : 'Confirm & Close'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <AlertCircle size={18} strokeWidth={1.75} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--text)', margin: 0 }}>
            {targetStatus === 'OPEN'
              ? 'This pool will immediately accept simulated investor commitments up to the target amount.'
              : 'This will prevent any new simulated commitments. Existing commitments remain preserved in investor portfolios.'}
          </p>
        </div>
      </Modal>
    </div>
  )
}

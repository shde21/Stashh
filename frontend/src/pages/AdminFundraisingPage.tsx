import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchAdminPools, setAdminPoolStatus } from '../fundraising/fundraising.api'
import type { FundraisingPool } from '../fundraising/fundraising.types'

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function AdminFundraisingPage() {
  const { withCsrf } = useAuth()
  const [pools, setPools] = useState<FundraisingPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState<number | null>(null)

  useEffect(() => {
    fetchAdminPools()
      .then(setPools)
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Fundraising pools could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  async function changeStatus(pool: FundraisingPool, status: 'OPEN' | 'CLOSED') {
    setWorkingId(pool.id)
    setError('')
    try {
      const updated = await withCsrf((token) => setAdminPoolStatus(pool.id, status, token))
      setPools((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The pool status could not be changed.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading fundraising controls…" />

  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Fundraising controls</p><h1>Keep simulated rounds accountable.</h1><p>Review pool terms, watch capacity, and control which approved rounds are accepting commitments.</p></div><span className="status-badge">{pools.length} pools</span></div>{error && <div className="form-alert" role="alert">{error}</div>}{pools.length === 0 ? <section className="workspace-panel"><EmptyState title="No fundraising pools yet" description="Approved startups can configure a simulated pool from their fundraising workspace." /></section> : <div className="review-list">{pools.map((pool) => <article className="review-card" key={pool.id}><div className="review-card-header"><div><p className="eyebrow">{pool.companyName} · {pool.stage.replace('_', ' ')}</p><h2>{pool.title}</h2><p>{pool.tagline}</p></div><span className={`status-badge status-${pool.status.toLowerCase()}`}>{pool.status}</span></div><div className="review-summary"><span><strong>Target</strong>{money(pool.targetAmount)}</span><span><strong>Committed</strong>{money(pool.totalCommitted)}</span><span><strong>Commitments</strong>{pool.commitmentCount}</span><span><strong>Remaining</strong>{money(Math.max(0, pool.targetAmount - pool.totalCommitted))}</span></div><div className="review-actions">{pool.status !== 'OPEN' && <button className="button button-small" type="button" onClick={() => void changeStatus(pool, 'OPEN')} disabled={workingId === pool.id}>Open pool</button>}{pool.status === 'OPEN' && <button className="button button-small button-secondary" type="button" onClick={() => void changeStatus(pool, 'CLOSED')} disabled={workingId === pool.id}>Close pool</button>}</div></article>)}</div>}</div>
}

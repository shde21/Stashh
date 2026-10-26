import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { cancelInvestorCommitment } from '../fundraising/fundraising.api'
import { fetchInvestorPortfolio } from '../portfolio/portfolio.api'
import type { PortfolioSummary } from '../portfolio/portfolio.types'

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function InvestorPortfolioPage() {
  const { withCsrf } = useAuth()
  const [portfolio, setPortfolio] = useState<PortfolioSummary>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState<number | null>(null)

  useEffect(() => {
    fetchInvestorPortfolio()
      .then(setPortfolio)
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Commitments could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  async function cancel(commitmentId: number) {
    setWorkingId(commitmentId)
    setError('')
    try {
      await withCsrf((token) => cancelInvestorCommitment(commitmentId, token))
      const refreshed = await fetchInvestorPortfolio()
      setPortfolio(refreshed)
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The commitment could not be cancelled.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading your commitments…" />
  const positions = portfolio?.positions ?? []
  const active = positions.filter((position) => position.status === 'ACTIVE')
  const cancelled = positions.length - active.length
  const total = portfolio?.totalCommitted ?? 0

  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Portfolio</p><h1>Know what your position means.</h1><p>QUANTS, valuation snapshots, and illustrative gains are derived from your simulated commitments. No payment or custody is involved.</p></div><span className="status-badge">{active.length} active</span></div>{error && <div className="form-alert" role="alert">{error}</div>}<section className="metric-grid" aria-label="Portfolio summary"><article className="metric-card"><span>Committed</span><strong>{money(total)}</strong><small>Active simulated commitments</small></article><article className="metric-card"><span>QUANTS</span><strong>{(portfolio?.totalQuants ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 4 })}</strong><small>1 QUANT = ₹1,000 committed</small></article><article className="metric-card"><span>Illustrative value</span><strong>{money(portfolio?.valuedAmount ?? 0)}</strong><small>{money(portfolio?.illustrativeGain ?? 0)} illustrative gain</small></article></section>{positions.length === 0 ? <section className="workspace-panel"><EmptyState title="Your portfolio is intentionally empty" description="Explore open fundraising pools and make a simulated commitment when a round fits your thesis." /></section> : <div className="document-list portfolio-list">{positions.map((position) => <article className="document-row portfolio-position" key={position.commitmentId}><div><span className="document-kind">{position.status} · {position.quants.toLocaleString('en-IN', { maximumFractionDigits: 4 })} QUANTS</span><strong>{position.companyName} · {position.poolTitle}</strong><span className="portfolio-amount">{money(position.amount)} committed · {position.currentValue == null ? 'Awaiting valuation' : `${money(position.currentValue)} illustrative value`}</span>{position.illustrativeGain != null && <small className={position.illustrativeGain >= 0 ? 'gain-positive' : 'gain-negative'}>{position.illustrativeGain >= 0 ? '+' : ''}{money(position.illustrativeGain)} illustrative gain</small>}</div>{position.status === 'ACTIVE' && <button className="text-button" type="button" onClick={() => void cancel(position.commitmentId)} disabled={workingId === position.commitmentId}>{workingId === position.commitmentId ? 'Cancelling…' : 'Cancel'}</button>}</article>)}</div>}<div className="portfolio-footnote">{cancelled} cancelled position{cancelled === 1 ? '' : 's'} retained for history.</div></div>
}

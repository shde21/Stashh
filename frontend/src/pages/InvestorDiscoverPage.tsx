import { useEffect, useState, type FormEvent } from 'react'
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

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function InvestorDiscoverPage() {
  const { withCsrf } = useAuth()
  const [pools, setPools] = useState<FundraisingPool[]>([])
  const [watchlist, setWatchlist] = useState<MarketplaceStartup[]>([])
  const [interests, setInterests] = useState<InterestResponse[]>([])
  const [sector, setSector] = useState('')
  const [stage, setStage] = useState<StartupStage | ''>('')
  const [query, setQuery] = useState('')
  const [commitAmounts, setCommitAmounts] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchInvestorPools(), fetchWatchlist(), fetchInvestorInterests()])
      .then(([nextPools, nextWatchlist, nextInterests]) => {
        setPools(nextPools)
        setWatchlist(nextWatchlist)
        setInterests(nextInterests)
      })
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'The marketplace could not be loaded.'))
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

  async function commit(pool: FundraisingPool) {
    const amount = Number(commitAmounts[pool.id])
    if (!amount) {
      setError('Enter a commitment amount first.')
      return
    }
    setWorkingId(pool.id)
    setError('')
    try {
      const saved = await withCsrf((token) => commitToPool(pool.id, amount, token))
      setPools((current) => current.map((item) => item.id === pool.id ? { ...item, totalCommitted: item.totalCommitted + saved.amount, commitmentCount: item.commitmentCount + 1, viewerCommitment: saved.amount } : item))
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The commitment could not be saved.')
    } finally {
      setWorkingId(null)
    }
  }

  async function toggleWatchlist(pool: FundraisingPool) {
    setWorkingId(pool.profileId)
    setError('')
    const saved = watchlist.some((item) => item.profileId === pool.profileId)
    try {
      if (saved) {
        await withCsrf((token) => removeFromWatchlist(pool.profileId, token))
        setWatchlist((current) => current.filter((item) => item.profileId !== pool.profileId))
      } else {
        const note = window.prompt(`Add a private thesis note for ${pool.companyName} (optional):`, '')
        if (note == null) return
        await withCsrf((token) => saveToWatchlist(pool.profileId, note, token))
        setWatchlist((current) => [...current, { profileId: pool.profileId, companyName: pool.companyName, tagline: pool.tagline, sector: pool.sector, stage: pool.stage, note: note || null, savedAt: new Date().toISOString() }])
      }
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'The watchlist could not be updated.')
    } finally {
      setWorkingId(null)
    }
  }

  async function showInterest(pool: FundraisingPool) {
    const existing = interests.find((item) => item.profileId === pool.profileId && item.status === 'PENDING')
    if (existing) {
      const confirmWithdraw = window.confirm(`Withdraw your pending introduction to ${pool.companyName}?`)
      if (!confirmWithdraw) return
      setWorkingId(pool.profileId)
      setError('')
      try {
        const updated = await withCsrf((token) => withdrawInterest(pool.profileId, token))
        setInterests((current) => current.map((item) => item.profileId === pool.profileId ? updated : item))
      } catch (nextError: unknown) {
        setError(nextError instanceof Error ? nextError.message : 'Your introduction could not be withdrawn.')
      } finally {
        setWorkingId(null)
      }
      return
    }

    const message = window.prompt(`Introduce yourself to ${pool.companyName}:`, 'I would like to learn more about the company and round.')
    if (message == null) return
    setWorkingId(pool.profileId)
    setError('')
    try {
      const sent = await withCsrf((token) => expressInterest(pool.profileId, message, token))
      setInterests((current) => {
        const filtered = current.filter((item) => item.profileId !== pool.profileId)
        return [sent, ...filtered]
      })
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Your interest could not be sent.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading open fundraising pools…" />

  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Discover rounds</p><h1>Find the signal before the rush.</h1><p>Explore approved startup rounds, save companies for later, introduce yourself, and record a simulated commitment when the opportunity fits your thesis. Visit your <Link to="/app/investor/watchlist">saved watchlist</Link> to review your thesis notes.</p></div><span className="status-badge">{pools.length} open</span></div>{error && <div className="form-alert" role="alert">{error}</div>}<form className="filter-bar" onSubmit={handleSearch}><label className="field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, sector, or thesis" /></label><label className="field"><span>Sector</span><input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Climate software" /></label><label className="field"><span>Stage</span><select value={stage} onChange={(event) => setStage(event.target.value as StartupStage | '')}><option value="">All stages</option><option value="PRE_REVENUE">Pre-revenue</option><option value="EARLY_REVENUE">Early revenue</option><option value="GROWTH">Growth</option></select></label><button className="button button-small" type="submit" disabled={searching}>{searching ? 'Filtering…' : 'Apply filters'}</button></form>{pools.length === 0 ? <section className="workspace-panel"><EmptyState title="No open rounds match" description="Try a broader search, or check back when approved startups open their terms." /></section> : <div className="startup-grid">{pools.map((pool) => { const progress = Math.min(100, (pool.totalCommitted / pool.targetAmount) * 100); const savedItem = watchlist.find((item) => item.profileId === pool.profileId); const saved = Boolean(savedItem); const activeInterest = interests.find((item) => item.profileId === pool.profileId && item.status === 'PENDING'); return <article className="startup-card fundraising-card" key={pool.id}><div className="startup-card-top"><span className="eyebrow">{pool.sector ?? 'Startup'} · {pool.stage.replace('_', ' ')}</span><span>{pool.commitmentCount} committed</span></div><h2>{pool.companyName}</h2><p className="startup-tagline">{pool.title}</p><p>{pool.tagline ?? 'An approved startup fundraising round.'}</p><div className="pool-terms"><span><strong>Target</strong>{money(pool.targetAmount)}</span><span><strong>Minimum</strong>{money(pool.minCommitment)}</span><span><strong>Cap</strong>{pool.valuationCap ? money(pool.valuationCap) : 'Not set'}</span></div><div className="progress-track" aria-label={`${progress.toFixed(0)} percent committed`}><span style={{ width: `${progress}%` }} /></div><div className="startup-card-footer"><span>{money(pool.totalCommitted)} committed</span><span>{money(Math.max(0, pool.targetAmount - pool.totalCommitted))} remaining</span></div><div className="marketplace-actions"><button className="text-button" type="button" onClick={() => void toggleWatchlist(pool)} disabled={workingId === pool.profileId}>{saved ? '★ Saved' : '☆ Save'}</button><button className="text-button" type="button" onClick={() => void showInterest(pool)} disabled={workingId === pool.profileId}>{activeInterest ? '✓ Interest sent (Withdraw)' : 'Express interest'}</button>{saved && <Link className="text-button" to="/app/investor/watchlist">View note</Link>}</div>{pool.viewerCommitment ? <div className="commitment-confirmation">You committed {money(pool.viewerCommitment)}. View it in your portfolio.</div> : <div className="commit-form"><label className="field"><span>Your commitment · ₹</span><input type="number" min={pool.minCommitment} max={pool.maxCommitment ?? undefined} value={commitAmounts[pool.id] ?? ''} onChange={(event) => setCommitAmounts((current) => ({ ...current, [pool.id]: event.target.value }))} placeholder={String(pool.minCommitment)} /></label><button className="button button-small" type="button" onClick={() => void commit(pool)} disabled={workingId === pool.id}>{workingId === pool.id ? 'Saving…' : 'Commit'}</button></div>}</article>})}</div>}</div>
}

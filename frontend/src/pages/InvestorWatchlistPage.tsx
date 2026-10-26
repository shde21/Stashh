import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import {
  fetchInvestorInterests,
  fetchWatchlist,
  removeFromWatchlist,
  saveToWatchlist,
  withdrawInterest,
} from '../marketplace/marketplace.api'
import type { InterestResponse, MarketplaceStartup } from '../marketplace/marketplace.types'

export default function InvestorWatchlistPage() {
  const { withCsrf } = useAuth()
  const [watchlist, setWatchlist] = useState<MarketplaceStartup[]>([])
  const [interests, setInterests] = useState<InterestResponse[]>([])
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([fetchWatchlist(), fetchInvestorInterests()])
      .then(([nextWatchlist, nextInterests]) => {
        setWatchlist(nextWatchlist)
        setInterests(nextInterests)
        const initialNotes: Record<number, string> = {}
        for (const item of nextWatchlist) {
          initialNotes[item.profileId] = item.note ?? ''
        }
        setEditingNotes(initialNotes)
      })
      .catch((nextError: unknown) => {
        setError(nextError instanceof Error ? nextError.message : 'Watchlist could not be loaded.')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveNote(profileId: number) {
    setWorkingId(profileId)
    setError('')
    setSuccess('')
    const note = editingNotes[profileId] ?? ''
    try {
      await withCsrf((token) => saveToWatchlist(profileId, note, token))
      setWatchlist((current) =>
        current.map((item) => (item.profileId === profileId ? { ...item, note: note || null } : item))
      )
      setSuccess('Thesis note updated.')
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'Failed to save note.')
    } finally {
      setWorkingId(null)
    }
  }

  async function handleRemove(profileId: number) {
    setWorkingId(profileId)
    setError('')
    setSuccess('')
    try {
      await withCsrf((token) => removeFromWatchlist(profileId, token))
      setWatchlist((current) => current.filter((item) => item.profileId !== profileId))
      setSuccess('Startup removed from watchlist.')
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'Failed to remove from watchlist.')
    } finally {
      setWorkingId(null)
    }
  }

  async function handleWithdrawInterest(profileId: number) {
    setWorkingId(profileId)
    setError('')
    setSuccess('')
    try {
      const updated = await withCsrf((token) => withdrawInterest(profileId, token))
      setInterests((current) =>
        current.map((item) => (item.profileId === profileId ? updated : item))
      )
      setSuccess('Interest request withdrawn.')
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'Failed to withdraw interest.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading your saved watchlist…" />

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Investor Watchlist</p>
          <h1>Track conviction before capital.</h1>
          <p>
            Review approved startups you are watching, record your investment theses, and manage your introductions.
          </p>
        </div>
        <span className="status-badge">{watchlist.length} saved</span>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}
      {success && <div className="form-alert form-alert-success" role="status">{success}</div>}

      <section className="workspace-panel">
        <div className="section-header">
          <div>
            <h2>Saved Startups & Thesis Notes</h2>
            <p>Keep your thoughts and conviction clear as companies develop.</p>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <EmptyState
            title="Your watchlist is empty"
            description="Explore open rounds and approved startups in the discovery room to bookmark companies for later evaluation."
          />
        ) : (
          <div className="document-list portfolio-list">
            {watchlist.map((item) => (
              <article className="document-row" key={item.profileId}>
                <div>
                  <span className="document-kind">
                    {item.sector ?? 'Startup'} · {item.stage.replace('_', ' ')} · Saved{' '}
                    {new Date(item.savedAt).toLocaleDateString()}
                  </span>
                  <strong>{item.companyName}</strong>
                  {item.tagline && <span>{item.tagline}</span>}

                  <div className="field" style={{ marginTop: '0.75rem' }}>
                    <label htmlFor={`thesis-${item.profileId}`}>
                      <span>Private thesis note</span>
                    </label>
                    <textarea
                      id={`thesis-${item.profileId}`}
                      rows={2}
                      value={editingNotes[item.profileId] ?? ''}
                      onChange={(e) =>
                        setEditingNotes((prev) => ({ ...prev, [item.profileId]: e.target.value }))
                      }
                      placeholder="Why are you watching this company? What milestones matter?"
                    />
                  </div>

                  <div className="marketplace-actions" style={{ marginTop: '0.5rem' }}>
                    <button
                      className="button button-small"
                      type="button"
                      onClick={() => void handleSaveNote(item.profileId)}
                      disabled={workingId === item.profileId}
                    >
                      {workingId === item.profileId ? 'Saving…' : 'Save thesis note'}
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => void handleRemove(item.profileId)}
                      disabled={workingId === item.profileId}
                    >
                      Remove from watchlist
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="workspace-panel" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <div>
            <h2>Your Introductions & Expressed Interest</h2>
            <p>Signal-level conversations you initiated from the marketplace.</p>
          </div>
          <span className="status-badge">{interests.length} introductions</span>
        </div>

        {interests.length === 0 ? (
          <EmptyState
            title="No introductions sent yet"
            description="When you find a company you would like to connect with, send a lightweight introduction from the discovery room."
          />
        ) : (
          <div className="document-list portfolio-list">
            {interests.map((interest) => (
              <article className="document-row" key={interest.id}>
                <div>
                  <span className="document-kind">
                    {interest.status} · {new Date(interest.updatedAt).toLocaleDateString()}
                  </span>
                  <strong>{interest.companyName}</strong>
                  <span>{interest.message ?? 'No introduction note provided.'}</span>
                </div>
                {interest.status === 'PENDING' && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => void handleWithdrawInterest(interest.profileId)}
                    disabled={workingId === interest.profileId}
                  >
                    {workingId === interest.profileId ? 'Withdrawing…' : 'Withdraw introduction'}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

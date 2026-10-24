import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchReviewQueue, reviewStartup, setStartupVisibility } from '../startup/startup.api'
import type { ReviewAction, StartupProfile } from '../startup/startup.types'

export default function AdminReviewsPage() {
  const { withCsrf } = useAuth()
  const [profiles, setProfiles] = useState<StartupProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState<number | null>(null)

  useEffect(() => {
    fetchReviewQueue()
      .then(setProfiles)
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'The review queue could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  async function takeAction(profile: StartupProfile, action: ReviewAction) {
    const note = action === 'CHANGES_REQUESTED' ? window.prompt('What should the founder improve?', profile.reviewNote ?? '') ?? '' : ''
    setWorkingId(profile.id)
    setError('')
    try {
      const updated = await withCsrf((token) => reviewStartup(profile.id, action, note, token))
      setProfiles((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The review action could not be completed.')
    } finally {
      setWorkingId(null)
    }
  }

  async function toggleVisibility(profile: StartupProfile) {
    setWorkingId(profile.id)
    setError('')
    try {
      const updated = await withCsrf((token) => setStartupVisibility(profile.id, profile.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC', token))
      setProfiles((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Visibility could not be updated.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading review queue…" />

  return (
    <div className="dashboard-page">
      <div className="page-heading"><div><p className="eyebrow">Review queue</p><h1>Keep context in the decision.</h1><p>Review submitted startup profiles, leave a useful loop, and control which approved companies are visible to investors.</p></div><span className="status-badge">{profiles.length} profiles</span></div>
      {error && <div className="form-alert" role="alert">{error}</div>}
      {profiles.length === 0 && <section className="workspace-panel"><EmptyState title="No startup submissions yet" description="Submitted profiles will appear here with their metrics, documents, and review history." /></section>}
      <div className="review-list">{profiles.map((profile) => <article className="review-card" key={profile.id}>
        <div className="review-card-header"><div><p className="eyebrow">{profile.sector ?? 'Startup'} · {profile.stage.replace('_', ' ')}</p><h2>{profile.companyName}</h2><p>{profile.tagline}</p></div><span className={`status-badge status-${profile.reviewStatus.toLowerCase()}`}>{profile.reviewStatus.replaceAll('_', ' ')}</span></div>
        <div className="review-summary"><span><strong>Team</strong>{profile.teamSize ?? '—'}</span><span><strong>Metrics</strong>{Object.keys(profile.metrics).length}</span><span><strong>Documents</strong>{profile.documents.length}</span><span><strong>Visibility</strong>{profile.visibility.toLowerCase()}</span></div>
        <p className="review-description">{profile.description}</p>
        {profile.reviewNote && <div className="review-note"><strong>Previous note</strong><span>{profile.reviewNote}</span></div>}
        <div className="review-actions"><button className="button button-small" type="button" onClick={() => void takeAction(profile, 'APPROVED')} disabled={workingId === profile.id}>Approve</button><button className="button button-small button-secondary" type="button" onClick={() => void takeAction(profile, 'CHANGES_REQUESTED')} disabled={workingId === profile.id}>Request changes</button><button className="text-button" type="button" onClick={() => void takeAction(profile, 'REJECTED')} disabled={workingId === profile.id}>Reject</button>{profile.reviewStatus === 'APPROVED' && <button className="text-button" type="button" onClick={() => void toggleVisibility(profile)} disabled={workingId === profile.id}>{profile.visibility === 'PUBLIC' ? 'Make private' : 'Make public'}</button>}</div>
      </article>)}</div>
    </div>
  )
}

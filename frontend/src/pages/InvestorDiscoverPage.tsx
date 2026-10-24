import { useEffect, useState } from 'react'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { fetchPublicStartups } from '../startup/startup.api'
import type { StartupProfile } from '../startup/startup.types'

export default function InvestorDiscoverPage() {
  const [profiles, setProfiles] = useState<StartupProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPublicStartups()
      .then(setProfiles)
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Public startups could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FullPageLoading label="Loading public startups…" />

  return (
    <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Discover startups</p><h1>Explore what is being built.</h1><p>Approved companies that have chosen to be visible appear here with the context behind the pitch.</p></div><span className="status-badge">{profiles.length} public</span></div>{error && <div className="form-alert" role="alert">{error}</div>}{profiles.length === 0 ? <section className="workspace-panel"><EmptyState title="The discovery room is quiet" description="Public startup listings will appear after an admin approves a profile and makes it visible." /></section> : <div className="startup-grid">{profiles.map((profile) => <article className="startup-card" key={profile.id}><div className="startup-card-top"><span className="eyebrow">{profile.sector ?? 'Startup'}</span><span>{profile.stage.replace('_', ' ')}</span></div><h2>{profile.companyName}</h2><p className="startup-tagline">{profile.tagline}</p><p>{profile.description}</p><div className="startup-card-footer"><span>{profile.headquarters ?? 'Location undisclosed'}</span><span>{profile.teamSize ?? '—'} people</span></div>{profile.website && <a className="button button-small button-secondary" href={profile.website} target="_blank" rel="noreferrer">Visit website ↗</a>}</article>)}</div>}</div>
  )
}

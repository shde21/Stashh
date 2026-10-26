import { useEffect, useState } from 'react'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { fetchStartupInterests } from '../marketplace/startup-marketplace.api'
import type { InterestResponse } from '../marketplace/marketplace.types'

export default function StartupInterestsPage() {
  const [interests, setInterests] = useState<InterestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStartupInterests()
      .then(setInterests)
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Investor interest could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FullPageLoading label="Loading investor interest…" />

  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Investor interest</p><h1>See who wants to continue the conversation.</h1><p>Investors can introduce themselves from the marketplace. Use this queue as a lightweight signal, not a promise of funding.</p></div><span className="status-badge">{interests.length} requests</span></div>{error && <div className="form-alert" role="alert">{error}</div>}{interests.length === 0 ? <section className="workspace-panel"><EmptyState title="No investor introductions yet" description="Once your profile is public, investors can save it and send a short introduction from the discovery experience." /></section> : <div className="document-list portfolio-list">{interests.map((interest) => <article className="document-row" key={interest.id}><div><span className="document-kind">{interest.status} · {new Date(interest.updatedAt).toLocaleDateString()}</span><strong>{interest.investorEmail}</strong><span>{interest.message ?? 'No message included.'}</span></div></article>)}</div>}</div>
}

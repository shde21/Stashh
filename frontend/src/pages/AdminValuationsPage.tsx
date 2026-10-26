import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchReviewQueue } from '../startup/startup.api'
import type { StartupProfile } from '../startup/startup.types'
import { createValuationSnapshot, fetchValuationSnapshots } from '../portfolio/portfolio.api'
import type { ValuationSnapshot } from '../portfolio/portfolio.types'

type FormState = {
  profileId: string
  valuationAmount: string
  snapshotAt: string
  note: string
}

const initialForm: FormState = {
  profileId: '',
  valuationAmount: '',
  snapshotAt: new Date().toISOString().slice(0, 16),
  note: '',
}

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function AdminValuationsPage() {
  const { withCsrf } = useAuth()
  const [profiles, setProfiles] = useState<StartupProfile[]>([])
  const [snapshots, setSnapshots] = useState<ValuationSnapshot[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchReviewQueue(), fetchValuationSnapshots()])
      .then(([nextProfiles, nextSnapshots]) => {
        setProfiles(nextProfiles.filter((profile) => profile.reviewStatus === 'APPROVED' && profile.visibility === 'PUBLIC'))
        setSnapshots(nextSnapshots)
      })
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Valuation data could not be loaded.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const snapshot = await withCsrf((token) => createValuationSnapshot({ profileId: form.profileId ? Number(form.profileId) : null, valuationAmount: form.valuationAmount ? Number(form.valuationAmount) : null, snapshotAt: form.snapshotAt, note: form.note }, token))
      setSnapshots((current) => [snapshot, ...current])
      setForm((current) => ({ ...current, valuationAmount: '', note: '' }))
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The valuation snapshot could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FullPageLoading label="Loading valuation workspace…" />

  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">Valuation snapshots</p><h1>Make portfolio math explainable.</h1><p>Record illustrative valuation snapshots for approved, public startups. Investor portfolio values update from the latest snapshot and the pool valuation cap.</p></div><span className="status-badge">{snapshots.length} snapshots</span></div>{error && <div className="form-alert" role="alert">{error}</div>}<section className="stage3-panel"><div className="panel-heading"><div><p className="eyebrow">01 · New snapshot</p><h2>Record a transparent reference point.</h2></div><span>Illustrative only</span></div>{profiles.length === 0 ? <EmptyState title="No approved public profiles" description="Approve and publish a startup profile before recording its valuation snapshot." /> : <form className="stage3-form" onSubmit={handleSubmit}><label className="field"><span>Startup profile</span><select value={form.profileId} onChange={(event) => setForm((current) => ({ ...current, profileId: event.target.value }))}><option value="">Choose a startup</option>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.companyName} · {profile.sector ?? 'Startup'}</option>)}</select></label><div className="field-grid"><label className="field"><span>Valuation <small className="field-suffix">₹</small></span><input type="number" min="1" step="1" value={form.valuationAmount} onChange={(event) => setForm((current) => ({ ...current, valuationAmount: event.target.value }))} placeholder="12000000" /></label><label className="field"><span>Snapshot time</span><input type="datetime-local" value={form.snapshotAt} onChange={(event) => setForm((current) => ({ ...current, snapshotAt: event.target.value }))} /></label></div><label className="field"><span>Note <small className="field-suffix">optional</small></span><textarea rows={3} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="What changed since the previous snapshot?" /></label><div className="stage3-actions"><button className="button" type="submit" disabled={saving}>{saving ? 'Saving snapshot…' : 'Record snapshot'} {!saving && <span>↗</span>}</button></div></form>}</section><section className="stage3-panel documents-panel"><div className="panel-heading"><div><p className="eyebrow">02 · History</p><h2>Keep the reference points visible.</h2></div><span>{snapshots.length} recorded</span></div>{snapshots.length === 0 ? <EmptyState title="No valuation snapshots yet" description="The first snapshot will appear here and become available to portfolio calculations." /> : <div className="document-list">{snapshots.map((snapshot) => <article className="document-row" key={snapshot.id}><div><span className="document-kind">{new Date(snapshot.snapshotAt).toLocaleDateString()}</span><strong>{snapshot.companyName} · {money(snapshot.valuationAmount)}</strong><span>{snapshot.note ?? 'No note added.'}</span></div></article>)}</div>}</section></div>
}

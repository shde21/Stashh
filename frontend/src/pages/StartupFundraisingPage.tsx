import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchStartupPool, saveStartupPool, setStartupPoolStatus } from '../fundraising/fundraising.api'
import type { FundraisingPool, FundraisingPoolInput } from '../fundraising/fundraising.types'

type FieldErrors = Record<string, string>

type FormState = {
  title: string
  targetAmount: string
  minCommitment: string
  maxCommitment: string
  valuationCap: string
  endsAt: string
}

const emptyForm: FormState = {
  title: '',
  targetAmount: '',
  minCommitment: '',
  maxCommitment: '',
  valuationCap: '',
  endsAt: '',
}

function formFromPool(pool?: FundraisingPool): FormState {
  if (!pool) return emptyForm
  return {
    title: pool.title,
    targetAmount: String(pool.targetAmount),
    minCommitment: String(pool.minCommitment),
    maxCommitment: pool.maxCommitment == null ? '' : String(pool.maxCommitment),
    valuationCap: pool.valuationCap == null ? '' : String(pool.valuationCap),
    endsAt: pool.endsAt ? new Date(pool.endsAt).toISOString().slice(0, 16) : '',
  }
}

function inputFromForm(form: FormState): FundraisingPoolInput {
  return {
    title: form.title,
    targetAmount: form.targetAmount ? Number(form.targetAmount) : null,
    minCommitment: form.minCommitment ? Number(form.minCommitment) : null,
    maxCommitment: form.maxCommitment ? Number(form.maxCommitment) : null,
    valuationCap: form.valuationCap ? Number(form.valuationCap) : null,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
  }
}

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function StartupFundraisingPage() {
  const { withCsrf } = useAuth()
  const [pool, setPool] = useState<FundraisingPool>()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  useEffect(() => {
    fetchStartupPool()
      .then((nextPool) => {
        setPool(nextPool)
        setForm(formFromPool(nextPool))
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return
        setFormError(error instanceof Error ? error.message : 'The fundraising pool could not be loaded.')
      })
      .finally(() => setLoading(false))
  }, [])

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError('')
    try {
      const saved = await withCsrf((token) => saveStartupPool(inputFromForm(form), token))
      setPool(saved)
      setForm(formFromPool(saved))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else setFormError(error instanceof Error ? error.message : 'The pool could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(status: 'OPEN' | 'CLOSED') {
    setChangingStatus(true)
    setFormError('')
    try {
      const updated = await withCsrf((token) => setStartupPoolStatus(status, token))
      setPool(updated)
      setForm(formFromPool(updated))
    } catch (error: unknown) {
      if (error instanceof ApiError) setFormError(error.message)
      else setFormError(error instanceof Error ? error.message : 'The pool status could not be changed.')
    } finally {
      setChangingStatus(false)
    }
  }

  if (loading) return <FullPageLoading label="Loading fundraising workspace…" />

  const progress = pool && pool.targetAmount > 0 ? Math.min(100, (pool.totalCommitted / pool.targetAmount) * 100) : 0

  return (
    <div className="dashboard-page">
      <div className="page-heading"><div><p className="eyebrow">Fundraising</p><h1>Make the round easy to understand.</h1><p>Configure a simulated fundraising pool with clear limits. No money moves here—commitments are illustrative and stored for the workflow.</p></div>{pool && <span className={`status-badge status-${pool.status.toLowerCase()}`}>{pool.status}</span>}</div>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      {!pool && <div className="review-note"><strong>Before you open a pool</strong><span>Your startup profile must be approved and public by an admin. You can prepare the terms after Stage 3 approval.</span></div>}
      {pool && <section className="metric-grid" aria-label="Fundraising summary"><article className="metric-card"><span>Target</span><strong>{money(pool.targetAmount)}</strong><small>{pool.title}</small></article><article className="metric-card"><span>Committed</span><strong>{money(pool.totalCommitted)}</strong><small>{pool.commitmentCount} active commitments</small></article><article className="metric-card"><span>Progress</span><strong>{progress.toFixed(0)}%</strong><small>{pool.status.toLowerCase()} pool</small></article></section>}

      <section className="stage3-panel">
        <div className="panel-heading"><div><p className="eyebrow">01 · Round terms</p><h2>Set the boundaries investors can trust.</h2></div><span>Currency: INR</span></div>
        <form className="stage3-form" onSubmit={handleSave} noValidate>
          <label className="field"><span>Round title</span><input value={form.title} onChange={(event) => updateField('title', event.target.value)} aria-invalid={Boolean(errors.title)} placeholder="Seed round · 2026" />{errors.title && <small className="field-error">{errors.title}</small>}</label>
          <div className="field-grid"><label className="field"><span>Target amount <small className="field-suffix">₹</small></span><input type="number" min="1" step="1" value={form.targetAmount} onChange={(event) => updateField('targetAmount', event.target.value)} aria-invalid={Boolean(errors.targetAmount)} placeholder="2500000" />{errors.targetAmount && <small className="field-error">{errors.targetAmount}</small>}</label><label className="field"><span>Minimum commitment <small className="field-suffix">₹</small></span><input type="number" min="1" step="1" value={form.minCommitment} onChange={(event) => updateField('minCommitment', event.target.value)} aria-invalid={Boolean(errors.minCommitment)} placeholder="25000" />{errors.minCommitment && <small className="field-error">{errors.minCommitment}</small>}</label></div>
          <div className="field-grid"><label className="field"><span>Maximum commitment <small className="field-suffix">optional · ₹</small></span><input type="number" min="1" step="1" value={form.maxCommitment} onChange={(event) => updateField('maxCommitment', event.target.value)} aria-invalid={Boolean(errors.maxCommitment)} placeholder="500000" />{errors.maxCommitment && <small className="field-error">{errors.maxCommitment}</small>}</label><label className="field"><span>Valuation cap <small className="field-suffix">optional · ₹</small></span><input type="number" min="1" step="1" value={form.valuationCap} onChange={(event) => updateField('valuationCap', event.target.value)} aria-invalid={Boolean(errors.valuationCap)} placeholder="25000000" />{errors.valuationCap && <small className="field-error">{errors.valuationCap}</small>}</label></div>
          <label className="field"><span>Pool closes</span><input type="datetime-local" value={form.endsAt} onChange={(event) => updateField('endsAt', event.target.value)} aria-invalid={Boolean(errors.endsAt)} />{errors.endsAt && <small className="field-error">{errors.endsAt}</small>}</label>
          <div className="stage3-actions"><button className="button" type="submit" disabled={saving}>{saving ? 'Saving terms…' : 'Save terms'} {!saving && <span>↗</span>}</button>{pool && pool.status !== 'OPEN' && <button className="button button-secondary" type="button" onClick={() => void changeStatus('OPEN')} disabled={changingStatus}>{changingStatus ? 'Opening…' : 'Open pool'}</button>}{pool?.status === 'OPEN' && <button className="button button-secondary" type="button" onClick={() => void changeStatus('CLOSED')} disabled={changingStatus}>{changingStatus ? 'Closing…' : 'Close pool'}</button>}</div>
        </form>
      </section>

      <section className="stage3-panel documents-panel"><div className="panel-heading"><div><p className="eyebrow">02 · Capacity</p><h2>See the round fill in real time.</h2></div><span>{pool ? `${progress.toFixed(0)}% of target` : 'No pool yet'}</span></div>{pool ? <><div className="progress-track" aria-label="Fundraising progress"><span style={{ width: `${progress}%` }} /></div><div className="startup-card-footer"><span>{money(pool.totalCommitted)} committed</span><span>{money(Math.max(0, pool.targetAmount - pool.totalCommitted))} remaining</span></div></> : <EmptyState title="No fundraising pool configured" description="Save approved, public round terms to start showing capacity and simulated commitments." />}</section>
    </div>
  )
}

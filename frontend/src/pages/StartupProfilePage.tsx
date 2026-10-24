import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import {
  addStartupDocument,
  deleteStartupDocument,
  fetchStartupProfile,
  saveStartupProfile,
  submitStartupProfile,
} from '../startup/startup.api'
import type { DocumentKind, StartupProfile, StartupProfileInput, StartupStage } from '../startup/startup.types'

type FieldErrors = Record<string, string>

const metricFields: Record<StartupStage, { key: string; label: string; suffix: string }[]> = {
  PRE_REVENUE: [
    { key: 'active_users', label: 'Active users', suffix: '' },
    { key: 'runway_months', label: 'Runway', suffix: 'months' },
  ],
  EARLY_REVENUE: [
    { key: 'monthly_revenue', label: 'Monthly revenue', suffix: '₹' },
    { key: 'monthly_growth_percent', label: 'Monthly growth', suffix: '%' },
    { key: 'active_users', label: 'Active users', suffix: '' },
  ],
  GROWTH: [
    { key: 'annual_revenue', label: 'Annual revenue', suffix: '₹' },
    { key: 'monthly_growth_percent', label: 'Monthly growth', suffix: '%' },
    { key: 'active_users', label: 'Active users', suffix: '' },
  ],
}

type FormState = {
  companyName: string
  tagline: string
  description: string
  website: string
  sector: string
  headquarters: string
  foundedYear: string
  stage: StartupStage
  teamSize: string
  pitchUrl: string
  metrics: Record<string, string>
}

const emptyForm: FormState = {
  companyName: '',
  tagline: '',
  description: '',
  website: '',
  sector: '',
  headquarters: '',
  foundedYear: '',
  stage: 'PRE_REVENUE',
  teamSize: '',
  pitchUrl: '',
  metrics: {},
}

function formFromProfile(profile?: StartupProfile): FormState {
  if (!profile) return emptyForm
  return {
    companyName: profile.companyName,
    tagline: profile.tagline ?? '',
    description: profile.description ?? '',
    website: profile.website ?? '',
    sector: profile.sector ?? '',
    headquarters: profile.headquarters ?? '',
    foundedYear: profile.foundedYear?.toString() ?? '',
    stage: profile.stage,
    teamSize: profile.teamSize?.toString() ?? '',
    pitchUrl: profile.pitchUrl ?? '',
    metrics: Object.fromEntries(Object.entries(profile.metrics).map(([key, value]) => [key, String(value)])),
  }
}

function inputFromForm(form: FormState): StartupProfileInput {
  return {
    companyName: form.companyName,
    tagline: form.tagline,
    description: form.description,
    website: form.website,
    sector: form.sector,
    headquarters: form.headquarters,
    foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
    stage: form.stage,
    teamSize: form.teamSize ? Number(form.teamSize) : null,
    pitchUrl: form.pitchUrl,
    metrics: Object.fromEntries(
      Object.entries(form.metrics)
        .filter(([, value]) => value.trim() !== '')
        .map(([key, value]) => [key, Number(value)]),
    ),
  }
}

export default function StartupProfilePage() {
  const { withCsrf } = useAuth()
  const [profile, setProfile] = useState<StartupProfile>()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [documentKind, setDocumentKind] = useState<DocumentKind>('PITCH_DECK')
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addingDocument, setAddingDocument] = useState(false)

  useEffect(() => {
    let active = true
    fetchStartupProfile()
      .then((nextProfile) => {
        if (!active) return
        setProfile(nextProfile)
        setForm(formFromProfile(nextProfile))
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return
        if (active) setFormError(error instanceof Error ? error.message : 'The company profile could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const metrics = useMemo(() => metricFields[form.stage], [form.stage])

  function updateField(field: keyof Omit<FormState, 'metrics'>, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function updateStage(stage: StartupStage) {
    setForm((current) => ({ ...current, stage, metrics: {} }))
    setErrors({})
  }

  function updateMetric(key: string, value: string) {
    setForm((current) => ({ ...current, metrics: { ...current.metrics, [key]: value } }))
    setErrors((current) => ({ ...current, [`metrics.${key}`]: '' }))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    setErrors({})
    try {
      const saved = await withCsrf((token) => saveStartupProfile(inputFromForm(form), token))
      setProfile(saved)
      setForm(formFromProfile(saved))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'The profile could not be saved.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setFormError('')
    try {
      const submitted = await withCsrf((token) => submitStartupProfile(token))
      setProfile(submitted)
      setForm(formFromProfile(submitted))
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'The profile could not be submitted.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAddingDocument(true)
    setFormError('')
    try {
      const document = await withCsrf((token) => addStartupDocument({ kind: documentKind, title: documentTitle, resourceUrl: documentUrl }, token))
      setProfile((current) => current ? { ...current, documents: [document, ...current.documents] } : current)
      setDocumentTitle('')
      setDocumentUrl('')
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'The document could not be added.')
      }
    } finally {
      setAddingDocument(false)
    }
  }

  async function handleDeleteDocument(documentId: number) {
    try {
      await withCsrf((token) => deleteStartupDocument(documentId, token))
      setProfile((current) => current ? { ...current, documents: current.documents.filter((document) => document.id !== documentId) } : current)
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'The document could not be removed.')
    }
  }

  if (loading) return <FullPageLoading label="Loading company workspace…" />

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Company profile</p>
          <h1>Make the right context easy to find.</h1>
          <p>Save a clear company story, add the metrics that fit your stage, and submit it when the picture is ready for review.</p>
        </div>
        {profile && <span className={`status-badge status-${profile.reviewStatus.toLowerCase()}`}>{profile.reviewStatus.replaceAll('_', ' ')}</span>}
      </div>

      {formError && <div className="form-alert" role="alert">{formError}</div>}
      {profile?.reviewNote && <div className="review-note"><strong>Reviewer note</strong><span>{profile.reviewNote}</span></div>}

      <form className="stage3-form" onSubmit={handleSave} noValidate>
        <section className="stage3-panel">
          <div className="panel-heading"><div><p className="eyebrow">01 · Company story</p><h2>Start with the essentials.</h2></div><span>Drafts are always private.</span></div>
          <div className="field-grid">
            <label className="field"><span>Company name</span><input value={form.companyName} onChange={(event) => updateField('companyName', event.target.value)} aria-invalid={Boolean(errors.companyName)} placeholder="Acme Labs" />{errors.companyName && <small className="field-error">{errors.companyName}</small>}</label>
            <label className="field"><span>Sector</span><input value={form.sector} onChange={(event) => updateField('sector', event.target.value)} aria-invalid={Boolean(errors.sector)} placeholder="Climate software" />{errors.sector && <small className="field-error">{errors.sector}</small>}</label>
          </div>
          <label className="field"><span>One-line description</span><input value={form.tagline} onChange={(event) => updateField('tagline', event.target.value)} aria-invalid={Boolean(errors.tagline)} placeholder="The operating system for ..." />{errors.tagline && <small className="field-error">{errors.tagline}</small>}</label>
          <label className="field"><span>Company description</span><textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} aria-invalid={Boolean(errors.description)} rows={5} placeholder="What are you building, for whom, and why now?" />{errors.description && <small className="field-error">{errors.description}</small>}</label>
          <div className="field-grid">
            <label className="field"><span>Website</span><input type="url" value={form.website} onChange={(event) => updateField('website', event.target.value)} aria-invalid={Boolean(errors.website)} placeholder="https://company.com" />{errors.website && <small className="field-error">{errors.website}</small>}</label>
            <label className="field"><span>Pitch link</span><input type="url" value={form.pitchUrl} onChange={(event) => updateField('pitchUrl', event.target.value)} aria-invalid={Boolean(errors.pitchUrl)} placeholder="https://..." />{errors.pitchUrl && <small className="field-error">{errors.pitchUrl}</small>}</label>
          </div>
          <div className="field-grid">
            <label className="field"><span>Headquarters</span><input value={form.headquarters} onChange={(event) => updateField('headquarters', event.target.value)} placeholder="Bengaluru, India" /></label>
            <label className="field"><span>Team size</span><input type="number" min="1" value={form.teamSize} onChange={(event) => updateField('teamSize', event.target.value)} placeholder="8" /></label>
          </div>
          <label className="field"><span>Founded year</span><input type="number" min="1900" max="2100" value={form.foundedYear} onChange={(event) => updateField('foundedYear', event.target.value)} aria-invalid={Boolean(errors.foundedYear)} placeholder="2024" />{errors.foundedYear && <small className="field-error">{errors.foundedYear}</small>}</label>
        </section>

        <section className="stage3-panel">
          <div className="panel-heading"><div><p className="eyebrow">02 · Stage-aware metrics</p><h2>Use the numbers that fit the journey.</h2></div><span>Required metrics change by stage.</span></div>
          <label className="field"><span>Company stage</span><select value={form.stage} onChange={(event) => updateStage(event.target.value as StartupStage)}><option value="PRE_REVENUE">Pre-revenue</option><option value="EARLY_REVENUE">Early revenue</option><option value="GROWTH">Growth</option></select>{errors.stage && <small className="field-error">{errors.stage}</small>}</label>
          <div className="field-grid metric-fields">
            {metrics.map((metric) => <label className="field" key={metric.key}><span>{metric.label}{metric.suffix && <small className="field-suffix">{metric.suffix}</small>}</span><input type="number" min="0" step="0.01" value={form.metrics[metric.key] ?? ''} onChange={(event) => updateMetric(metric.key, event.target.value)} aria-invalid={Boolean(errors[`metrics.${metric.key}`])} placeholder="0" />{errors[`metrics.${metric.key}`] && <small className="field-error">{errors[`metrics.${metric.key}`]}</small>}</label>)}
          </div>
        </section>

        <div className="stage3-actions"><button className="button" type="submit" disabled={saving}>{saving ? 'Saving draft…' : 'Save profile'} {!saving && <span>↗</span>}</button>{profile && <button className="button button-secondary" type="button" onClick={() => void handleSubmit()} disabled={submitting || profile.reviewStatus === 'SUBMITTED'}>{submitting ? 'Submitting…' : profile.reviewStatus === 'SUBMITTED' ? 'Waiting for review' : 'Submit for review'}</button>}</div>
      </form>

      <section className="stage3-panel documents-panel">
        <div className="panel-heading"><div><p className="eyebrow">03 · Documents</p><h2>Keep supporting material close to the story.</h2></div><span>Link-based handling for this stage.</span></div>
        {!profile && <EmptyState title="Save your profile first" description="Once a profile exists, you can add a pitch deck, financials, or other supporting links." />}
        {profile && <>
          <form className="document-form" onSubmit={handleAddDocument}>
            <label className="field"><span>Type</span><select value={documentKind} onChange={(event) => setDocumentKind(event.target.value as DocumentKind)}><option value="PITCH_DECK">Pitch deck</option><option value="FINANCIALS">Financials</option><option value="OTHER">Other</option></select></label>
            <label className="field"><span>Title</span><input value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} placeholder="Investor deck · October 2026" /></label>
            <label className="field"><span>Secure link</span><input type="url" value={documentUrl} onChange={(event) => setDocumentUrl(event.target.value)} placeholder="https://..." /></label>
            <button className="button button-small" type="submit" disabled={addingDocument}>{addingDocument ? 'Adding…' : 'Add document'}</button>
          </form>
          {profile.documents.length === 0 ? <EmptyState title="No supporting documents yet" description="Add a link to the material that helps a reviewer understand the company." /> : <div className="document-list">{profile.documents.map((document) => <article className="document-row" key={document.id}><div><span className="document-kind">{document.kind.replace('_', ' ')}</span><strong>{document.title}</strong><a href={document.resourceUrl} target="_blank" rel="noreferrer">Open document ↗</a></div><button className="text-button" type="button" onClick={() => void handleDeleteDocument(document.id)}>Remove</button></article>)}</div>}
        </>}
      </section>
    </div>
  )
}

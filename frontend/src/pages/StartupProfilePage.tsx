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
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Textarea,
  Th,
  useToast,
} from '../design-system'
import { AlertCircle, ExternalLink, Send } from 'lucide-react'

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
  const { showToast } = useToast()

  const [profile, setProfile] = useState<StartupProfile>()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [initialJson, setInitialJson] = useState<string>(JSON.stringify(emptyForm))

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
        const nextForm = formFromProfile(nextProfile)
        setForm(nextForm)
        setInitialJson(JSON.stringify(nextForm))
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return
        if (active) setFormError(error instanceof Error ? error.message : 'The company profile could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== initialJson
  }, [form, initialJson])

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
      const nextForm = formFromProfile(saved)
      setForm(nextForm)
      setInitialJson(JSON.stringify(nextForm))
      showToast('Profile draft saved successfully.', 'success')
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
      const nextForm = formFromProfile(submitted)
      setForm(nextForm)
      setInitialJson(JSON.stringify(nextForm))
      showToast('Profile submitted for admin review.', 'success')
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
      const document = await withCsrf((token) =>
        addStartupDocument(
          { kind: documentKind, title: documentTitle, resourceUrl: documentUrl },
          token,
        ),
      )
      setProfile((current) =>
        current ? { ...current, documents: [document, ...current.documents] } : current,
      )
      setDocumentTitle('')
      setDocumentUrl('')
      showToast('Document added to profile.', 'success')
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
      setProfile((current) =>
        current
          ? { ...current, documents: current.documents.filter((d) => d.id !== documentId) }
          : current,
      )
      showToast('Document removed.', 'info')
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'The document could not be removed.')
    }
  }

  if (loading) return <FullPageLoading label="Loading company workspace…" />

  return (
    <div className="dashboard-page" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Startup Workspace</p>
          <h1>Make the right context easy to find.</h1>
          <p>
            Build your company profile, add stage-aware metrics, and submit your story when it is ready for administrator review.
          </p>
        </div>
        {profile && <StatusPill status={profile.reviewStatus} />}
      </div>

      {formError && <div className="form-alert" role="alert">{formError}</div>}

      {/* Reviewer Note Callout */}
      {profile?.reviewNote && (
        <div className="review-note">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertCircle size={16} strokeWidth={1.75} />
            <strong>Reviewer note</strong>
          </div>
          <span>{profile.reviewNote}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} noValidate>
        {/* Section 01: Company Story */}
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 · Company story</p>
              <h2>Start with the essentials.</h2>
            </div>
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
              Drafts remain private until submitted.
            </span>
          </div>

          <div className="field-grid">
            <Field label="Company name" htmlFor="company-name-input" error={errors.companyName} required>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="e.g. Acme Technologies"
                />
              )}
            </Field>

            <Field label="Sector" htmlFor="sector-input" error={errors.sector} required>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  value={form.sector}
                  onChange={(e) => updateField('sector', e.target.value)}
                  placeholder="e.g. Climate Software"
                />
              )}
            </Field>
          </div>

          <Field label="One-line description" htmlFor="tagline-input" error={errors.tagline} required>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={form.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="The operating system for..."
              />
            )}
          </Field>

          <Field label="Company description" htmlFor="description-input" error={errors.description} required>
            {(fieldProps) => (
              <Textarea
                {...fieldProps}
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="What are you building, for whom, and why now?"
              />
            )}
          </Field>

          <div className="field-grid">
            <Field label="Website" htmlFor="website-input" error={errors.website}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://company.com"
                />
              )}
            </Field>

            <Field label="Pitch link" htmlFor="pitch-url-input" error={errors.pitchUrl}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="url"
                  value={form.pitchUrl}
                  onChange={(e) => updateField('pitchUrl', e.target.value)}
                  placeholder="https://pitch.com/deck..."
                />
              )}
            </Field>
          </div>

          <div className="field-grid">
            <Field label="Headquarters" htmlFor="hq-input" error={errors.headquarters}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  value={form.headquarters}
                  onChange={(e) => updateField('headquarters', e.target.value)}
                  placeholder="Bengaluru, India"
                />
              )}
            </Field>

            <Field label="Team size" htmlFor="team-size-input" error={errors.teamSize}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="number"
                  min="1"
                  value={form.teamSize}
                  onChange={(e) => updateField('teamSize', e.target.value)}
                  placeholder="8"
                />
              )}
            </Field>

            <Field label="Founded year" htmlFor="founded-year-input" error={errors.foundedYear}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="number"
                  min="1900"
                  max="2100"
                  value={form.foundedYear}
                  onChange={(e) => updateField('foundedYear', e.target.value)}
                  placeholder="2024"
                />
              )}
            </Field>
          </div>
        </Card>

        {/* Section 02: Stage-aware Metrics */}
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">02 · Stage-aware metrics</p>
              <h2>Use the numbers that fit the journey.</h2>
            </div>
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
              Required fields update based on stage.
            </span>
          </div>

          <Field label="Company stage" htmlFor="stage-selector" error={errors.stage} required>
            {(fieldProps) => (
              <Select
                {...fieldProps}
                value={form.stage}
                onChange={(e) => updateStage(e.target.value as StartupStage)}
              >
                <option value="PRE_REVENUE">Pre-revenue</option>
                <option value="EARLY_REVENUE">Early revenue</option>
                <option value="GROWTH">Growth</option>
              </Select>
            )}
          </Field>

          <div className="field-grid" style={{ marginTop: 'var(--space-4)' }}>
            {metrics.map((metric) => (
              <Field
                key={metric.key}
                label={metric.label}
                htmlFor={`metric-${metric.key}`}
                suffix={metric.suffix}
                error={errors[`metrics.${metric.key}`]}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.metrics[metric.key] ?? ''}
                    onChange={(e) => updateMetric(metric.key, e.target.value)}
                    placeholder="0"
                  />
                )}
              </Field>
            ))}
          </div>
        </Card>

        {/* Sticky Action Bar */}
        <div className="stage-sticky-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isDirty ? 'var(--warning)' : 'var(--positive)',
              }}
              aria-hidden="true"
            />
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>

            {profile && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => void handleSubmit()}
                disabled={submitting || profile.reviewStatus === 'SUBMITTED'}
                loading={submitting}
                rightIcon={<Send size={14} strokeWidth={1.75} />}
              >
                {profile.reviewStatus === 'SUBMITTED' ? 'Submitted for review' : 'Submit for review'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Section 03: Documents */}
      <Card style={{ marginTop: 'var(--space-8)' }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">03 · Documents</p>
            <h2>Keep supporting material close to the story.</h2>
          </div>
          <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
            Link-based pitch decks and financial models.
          </span>
        </div>

        {!profile ? (
          <EmptyState
            title="Save your company profile first"
            description="Once your basic company profile is saved, you can attach links to pitch decks and financial models."
          />
        ) : (
          <div>
            <form onSubmit={handleAddDocument} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr auto', gap: 'var(--space-3)', alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
              <Field label="Type" htmlFor="doc-type-select">
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={documentKind}
                    onChange={(e) => setDocumentKind(e.target.value as DocumentKind)}
                  >
                    <option value="PITCH_DECK">Pitch deck</option>
                    <option value="FINANCIALS">Financials</option>
                    <option value="OTHER">Other</option>
                  </Select>
                )}
              </Field>

              <Field label="Title" htmlFor="doc-title-input" required>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g. Investor Deck · Oct 2026"
                  />
                )}
              </Field>

              <Field label="Secure Link URL" htmlFor="doc-url-input" required>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="url"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://..."
                  />
                )}
              </Field>

              <div style={{ marginBottom: 'var(--space-1)' }}>
                <Button type="submit" variant="secondary" size="md" loading={addingDocument}>
                  Add link
                </Button>
              </div>
            </form>

            {profile.documents.length === 0 ? (
              <EmptyState
                title="No supporting documents attached"
                description="Add a link to the deck or model that helps reviewers and investors evaluate your startup."
              />
            ) : (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Kind</Th>
                      <Th>Document Title</Th>
                      <Th>Link</Th>
                      <Th numeric>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.documents.map((doc) => (
                      <tr key={doc.id}>
                        <Td>
                          <Badge variant="neutral">{doc.kind.replace('_', ' ')}</Badge>
                        </Td>
                        <Td>
                          <strong>{doc.title}</strong>
                        </Td>
                        <Td>
                          <a
                            href={doc.resourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--accent)', fontSize: 'var(--font-small)' }}
                          >
                            <span>Open document</span>
                            <ExternalLink size={12} strokeWidth={1.75} />
                          </a>
                        </Td>
                        <Td numeric>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDeleteDocument(doc.id)}
                            style={{ color: 'var(--negative-text)' }}
                          >
                            Remove
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

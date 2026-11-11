import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchStartupPool, saveStartupPool, setStartupPoolStatus } from '../fundraising/fundraising.api'
import type { FundraisingPool, FundraisingPoolInput } from '../fundraising/fundraising.types'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  ProgressBar,
  Stat,
  StatusPill,
  daysLeft,
  formatCompactINR,
  formatDate,
  formatINR,
  formatShares,
  useToast,
} from '../design-system'
import { AlertCircle, Calendar, Eye, Lock, Play } from 'lucide-react'

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

export default function StartupFundraisingPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [pool, setPool] = useState<FundraisingPool>()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)

  // Status Change Confirmation Modal
  const [pendingStatusChange, setPendingStatusChange] = useState<'OPEN' | 'CLOSED' | null>(null)

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
      showToast('Fundraising terms saved successfully.', 'success')
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'The pool could not be saved.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmStatusChange() {
    if (!pendingStatusChange) return
    setChangingStatus(true)
    setFormError('')
    try {
      const updated = await withCsrf((token) => setStartupPoolStatus(pendingStatusChange, token))
      setPool(updated)
      setForm(formFromPool(updated))
      showToast(`Fundraising pool is now ${pendingStatusChange.toLowerCase()}.`, 'success')
      setPendingStatusChange(null)
    } catch (error: unknown) {
      if (error instanceof ApiError) setFormError(error.message)
      else setFormError(error instanceof Error ? error.message : 'The pool status could not be changed.')
    } finally {
      setChangingStatus(false)
    }
  }

  if (loading) return <FullPageLoading label="Loading fundraising workspace…" />

  const target = Number(form.targetAmount) || (pool?.targetAmount ?? 0)
  const committed = pool?.totalCommitted ?? 0
  const progress = target > 0 ? Math.min(100, (committed / target) * 100) : 0
  const remaining = Math.max(0, target - committed)
  const days = daysLeft(form.endsAt)

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Fundraising Workspace</p>
          <h1>Make the round easy to understand.</h1>
          <p>
            Configure company-specific equity fundraising terms with clear share limits and pricing. Allocations are simulated for marketplace evaluation.
          </p>
        </div>
        {pool && <StatusPill status={pool.status} />}
      </div>

      {formError && <div className="form-alert" role="alert">{formError}</div>}

      {!pool && (
        <Card style={{ backgroundColor: 'var(--surface-muted)', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <AlertCircle size={20} strokeWidth={1.75} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--font-small)' }}>Before opening a round</strong>
              <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Your company profile must be approved and set to public by an administrator. You can configure and save your terms below in advance.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Hero Stats */}
      {pool && (
        <div className="metric-grid" aria-label="Fundraising summary">
          <Card>
            <Stat label="Target Amount" value={formatINR(pool.targetAmount)} subtext={pool.title} />
          </Card>
          <Card>
            <Stat
              label="Committed Capacity"
              value={formatINR(pool.totalCommitted)}
              subtext={`${pool.commitmentCount} active commitments (${formatShares(pool.sharesAllocated)} shares allocated)`}
            />
          </Card>
          <Card>
            <Stat
              label="Remaining Capacity"
              value={formatINR(remaining)}
              subtext={`${progress.toFixed(0)}% subscribed`}
            />
          </Card>
        </div>
      )}

      {/* Two Column Layout: Terms Form on Left, Live Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Left Column: Form */}
        <div>
          <form onSubmit={handleSave} className="vl-card" noValidate>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Round Parameters</p>
                <h2>Configure round terms</h2>
              </div>
              <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
                Currency: INR (₹)
              </span>
            </div>

            <Field label="Round title" htmlFor="round-title-input" error={errors.title} required>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Seed Round · 2026"
                />
              )}
            </Field>

            <div className="field-grid">
              <Field
                label="Target amount"
                htmlFor="target-amount-input"
                suffix="₹"
                error={errors.targetAmount}
                required
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min="1"
                    step="1000"
                    value={form.targetAmount}
                    onChange={(e) => updateField('targetAmount', e.target.value)}
                    placeholder="2500000"
                  />
                )}
              </Field>

              <Field
                label="Minimum commitment"
                htmlFor="min-commitment-input"
                suffix="₹"
                error={errors.minCommitment}
                required
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min="1"
                    step="1000"
                    value={form.minCommitment}
                    onChange={(e) => updateField('minCommitment', e.target.value)}
                    placeholder="25000"
                  />
                )}
              </Field>
            </div>

            <div className="field-grid">
              <Field
                label="Maximum commitment"
                htmlFor="max-commitment-input"
                suffix="Optional · ₹"
                error={errors.maxCommitment}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min="1"
                    step="1000"
                    value={form.maxCommitment}
                    onChange={(e) => updateField('maxCommitment', e.target.value)}
                    placeholder="500000"
                  />
                )}
              </Field>

              <Field
                label="Valuation cap"
                htmlFor="val-cap-input"
                suffix="Optional · ₹"
                error={errors.valuationCap}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min="1"
                    step="1000"
                    value={form.valuationCap}
                    onChange={(e) => updateField('valuationCap', e.target.value)}
                    placeholder="25000000"
                  />
                )}
              </Field>
            </div>

            <Field label="Pool closing date" htmlFor="close-date-input" error={errors.endsAt}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => updateField('endsAt', e.target.value)}
                />
              )}
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
              <Button type="submit" variant="primary" size="md" loading={saving}>
                {saving ? 'Saving terms…' : 'Save terms'}
              </Button>

              {pool && pool.status !== 'OPEN' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setPendingStatusChange('OPEN')}
                  leftIcon={<Play size={14} strokeWidth={1.75} />}
                >
                  Open pool
                </Button>
              )}

              {pool?.status === 'OPEN' && (
                <Button
                  type="button"
                  variant="destructive"
                  size="md"
                  onClick={() => setPendingStatusChange('CLOSED')}
                  leftIcon={<Lock size={14} strokeWidth={1.75} />}
                >
                  Close pool
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Live Investor Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Eye size={16} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: 'var(--font-caption)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Live Investor Preview
            </span>
          </div>

          <Card className="startup-card" style={{ border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Badge variant="neutral">{pool?.sector || 'Sector'}</Badge>
                <Badge variant="neutral">{pool?.stage.replace('_', ' ') || 'Stage'}</Badge>
              </div>
              <StatusPill status={pool?.status || 'DRAFT'} />
            </div>

            <h2 style={{ fontSize: 'var(--font-h3)', margin: 'var(--space-2) 0 4px 0' }}>
              {pool?.companyName || 'Your Company Name'}
            </h2>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', minHeight: '36px' }}>
              {form.title || 'Seed round · 2026'}
            </p>

            <div className="pool-terms">
              <span>
                <strong>Target</strong>
                {target > 0 ? formatCompactINR(target) : '₹0'}
              </span>
              <span>
                <strong>Valuation cap</strong>
                {form.valuationCap ? formatCompactINR(Number(form.valuationCap)) : 'None'}
              </span>
              <span>
                <strong>Min. commit</strong>
                {form.minCommitment ? formatINR(Number(form.minCommitment)) : '—'}
              </span>
            </div>

            <div style={{ marginTop: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>{formatCompactINR(committed)} committed ({progress.toFixed(0)}%)</span>
                <span>{formatCompactINR(remaining)} remaining</span>
              </div>
              <ProgressBar value={progress} />
            </div>

            {days != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                <Calendar size={12} strokeWidth={1.75} />
                <span>Closing {formatDate(form.endsAt)} ({days} days left)</span>
              </div>
            )}

            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
              Company-specific equity shares · Simulation preview
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Open/Close Pool */}
      <Modal
        isOpen={Boolean(pendingStatusChange)}
        onClose={() => setPendingStatusChange(null)}
        title={pendingStatusChange === 'OPEN' ? 'Open fundraising pool?' : 'Close fundraising pool?'}
        description={
          pendingStatusChange === 'OPEN'
            ? 'Opening the pool makes your round terms visible in the investor discovery feed and allows simulated commitments to be recorded.'
            : 'Closing the pool stops accepting new simulated commitments from investors. Existing commitments remain preserved.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingStatusChange(null)} disabled={changingStatus}>
              Cancel
            </Button>
            <Button
              variant={pendingStatusChange === 'OPEN' ? 'primary' : 'destructive'}
              loading={changingStatus}
              onClick={() => void handleConfirmStatusChange()}
            >
              {pendingStatusChange === 'OPEN' ? 'Confirm & Open' : 'Confirm & Close'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <AlertCircle size={18} strokeWidth={1.75} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--text)', margin: 0 }}>
            Ensure your terms are verified. Changes can be saved at any time.
          </p>
        </div>
      </Modal>
    </div>
  )
}

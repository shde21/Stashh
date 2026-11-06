import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchReviewQueue } from '../startup/startup.api'
import type { StartupProfile } from '../startup/startup.types'
import { createValuationSnapshot, fetchValuationSnapshots } from '../portfolio/portfolio.api'
import type { ValuationSnapshot } from '../portfolio/portfolio.types'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Table,
  TableWrapper,
  Td,
  Textarea,
  Th,
  formatCompactINR,
  formatDate,
  formatINR,
  useToast,
} from '../design-system'

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

export default function AdminValuationsPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [profiles, setProfiles] = useState<StartupProfile[]>([])
  const [snapshots, setSnapshots] = useState<ValuationSnapshot[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [selectedProfileId, setSelectedProfileId] = useState<string>('ALL')

  useEffect(() => {
    Promise.all([fetchReviewQueue(), fetchValuationSnapshots()])
      .then(([nextProfiles, nextSnapshots]) => {
        const approvedPublic = nextProfiles.filter(
          (profile) => profile.reviewStatus === 'APPROVED' && profile.visibility === 'PUBLIC',
        )
        setProfiles(approvedPublic)
        setSnapshots(nextSnapshots)
      })
      .catch((nextError: unknown) =>
        setError(nextError instanceof Error ? nextError.message : 'Valuation data could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.profileId || !form.valuationAmount) {
      setError('Please select a startup and specify the valuation amount.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const snapshot = await withCsrf((token) =>
        createValuationSnapshot(
          {
            profileId: Number(form.profileId),
            valuationAmount: Number(form.valuationAmount),
            snapshotAt: form.snapshotAt,
            note: form.note.trim(),
          },
          token,
        ),
      )
      setSnapshots((current) => [snapshot, ...current])
      setForm((current) => ({ ...current, valuationAmount: '', note: '' }))
      showToast(`Recorded valuation snapshot for ${snapshot.companyName}.`, 'success')
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'The valuation snapshot could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  // Filter snapshots
  const filteredSnapshots = useMemo(() => {
    if (selectedProfileId === 'ALL') return snapshots
    return snapshots.filter((s) => s.profileId === Number(selectedProfileId))
  }, [snapshots, selectedProfileId])

  // Chart data for selected startup (sorted chronologically)
  const chartData = useMemo(() => {
    if (selectedProfileId === 'ALL') return []
    const profileSnapshots = snapshots
      .filter((s) => s.profileId === Number(selectedProfileId))
      .sort((a, b) => new Date(a.snapshotAt).getTime() - new Date(b.snapshotAt).getTime())
    return profileSnapshots
  }, [snapshots, selectedProfileId])

  if (loading) return <FullPageLoading label="Loading valuation workspace…" />

  // Calculate SVG line/step coordinates
  const svgWidth = 600
  const svgHeight = 180
  const padding = 36

  const minVal = chartData.length > 0 ? Math.min(...chartData.map((d) => d.valuationAmount)) * 0.9 : 0
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d) => d.valuationAmount)) * 1.1 : 1

  const points = chartData.map((d, i) => {
    const x =
      chartData.length === 1
        ? svgWidth / 2
        : padding + (i / (chartData.length - 1)) * (svgWidth - padding * 2)
    const y =
      maxVal === minVal
        ? svgHeight / 2
        : svgHeight - padding - ((d.valuationAmount - minVal) / (maxVal - minVal)) * (svgHeight - padding * 2)
    return { x, y, ...d }
  })

  const pathD =
    points.length > 1
      ? points.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')
      : ''

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Valuation Governance</p>
          <h1>Make portfolio math explainable.</h1>
          <p>
            Record illustrative valuation reference points for approved public startups. Investor holdings update deterministically from latest snapshots and round caps.
          </p>
        </div>
        <Badge variant="neutral">{snapshots.length} total snapshots</Badge>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {/* Grid: Form on Left, History & Chart on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Record Snapshot Form */}
        <form onSubmit={handleSubmit} className="vl-card" noValidate>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 · New snapshot</p>
              <h2>Record valuation</h2>
            </div>
            <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
              Illustrative only
            </span>
          </div>

          {profiles.length === 0 ? (
            <EmptyState
              title="No approved public startups"
              description="Approve and publish a startup profile before recording valuation snapshots."
            />
          ) : (
            <>
              <Field label="Startup profile" htmlFor="startup-select" required>
                {(fieldProps) => (
                  <Select
                    {...fieldProps}
                    value={form.profileId}
                    onChange={(e) => setForm((c) => ({ ...c, profileId: e.target.value }))}
                  >
                    <option value="">Choose an approved startup...</option>
                    {profiles.map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.companyName} · {p.sector || 'Startup'}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <div className="field-grid">
                <Field label="Valuation amount" htmlFor="val-amount-input" suffix="₹" required>
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      type="number"
                      min="1"
                      step="1000"
                      value={form.valuationAmount}
                      onChange={(e) => setForm((c) => ({ ...c, valuationAmount: e.target.value }))}
                      placeholder="12000000"
                    />
                  )}
                </Field>

                <Field label="Effective date" htmlFor="snapshot-date-input" required>
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      type="datetime-local"
                      value={form.snapshotAt}
                      onChange={(e) => setForm((c) => ({ ...c, snapshotAt: e.target.value }))}
                    />
                  )}
                </Field>
              </div>

              <Field label="Context / Thesis note" htmlFor="val-note-input" hint="Explain the driver (new round, revenue milestone, market adjustment)">
                {(fieldProps) => (
                  <Textarea
                    {...fieldProps}
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm((c) => ({ ...c, note: e.target.value }))}
                    placeholder="e.g. Series A term sheet priced at ₹25 Cr valuation cap..."
                  />
                )}
              </Field>

              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
                <Button type="submit" variant="primary" size="md" loading={saving}>
                  {saving ? 'Recording…' : 'Record snapshot'}
                </Button>
              </div>
            </>
          )}
        </form>

        {/* Snapshot History & Simple SVG Trend Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Historical Trend Chart (when a startup is filtered) */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Historical Trajectory</p>
                <h3 style={{ fontSize: 'var(--font-h3)', margin: 0 }}>Valuation Curve</h3>
              </div>
              <div style={{ width: '200px' }}>
                <Select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  style={{ height: '32px', fontSize: 'var(--font-caption)' }}
                >
                  <option value="ALL">All companies</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedProfileId === 'ALL' ? (
              <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', padding: 'var(--space-4) 0', textAlign: 'center' }}>
                Select a specific company from the dropdown to view its valuation trajectory.
              </p>
            ) : chartData.length < 2 ? (
              <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', padding: 'var(--space-4) 0', textAlign: 'center' }}>
                At least 2 snapshots are needed to plot a valuation curve. Currently {chartData.length} recorded.
              </p>
            ) : (
              <div style={{ padding: 'var(--space-2) 0' }}>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                  role="img"
                  aria-label="Valuation history line chart"
                >
                  {/* Grid Lines */}
                  <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="var(--border)" strokeDasharray="3 3" />
                  <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="var(--border)" />

                  {/* Value Line */}
                  <path d={pathD} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

                  {/* Points */}
                  {points.map((pt, idx) => (
                    <g key={pt.id}>
                      <circle cx={pt.x} cy={pt.y} r={4.5} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2.5} />
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                        fontSize="11"
                        fontWeight="600"
                        fill="var(--text)"
                        fontFamily="var(--font-sans)"
                      >
                        {formatCompactINR(pt.valuationAmount)}
                      </text>
                      <text
                        x={pt.x}
                        y={svgHeight - 10}
                        textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                        fontSize="10"
                        fill="var(--text-tertiary)"
                        fontFamily="var(--font-sans)"
                      >
                        {formatDate(pt.snapshotAt)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </Card>

          {/* History Table */}
          <Card>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">02 · History</p>
                <h2>Recorded snapshots</h2>
              </div>
              <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
                {filteredSnapshots.length} records
              </span>
            </div>

            {filteredSnapshots.length === 0 ? (
              <EmptyState
                title="No valuation snapshots yet"
                description="Recorded snapshots establish verifiable reference marks for investor portfolio tracking."
              />
            ) : (
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Company</Th>
                      <Th numeric>Valuation</Th>
                      <Th>Date</Th>
                      <Th>Note</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSnapshots.map((s) => (
                      <tr key={s.id}>
                        <Td>
                          <strong style={{ color: 'var(--text)' }}>{s.companyName}</strong>
                        </Td>
                        <Td numeric style={{ fontWeight: 'var(--weight-semibold)' }}>
                          {formatINR(s.valuationAmount)}
                        </Td>
                        <Td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {formatDate(s.snapshotAt)}
                        </Td>
                        <Td style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                          {s.note || '—'}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import { fetchReviewQueue, reviewStartup, setStartupVisibility } from '../startup/startup.api'
import type { ReviewAction, StartupProfile } from '../startup/startup.types'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  SegmentedControl,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Textarea,
  Th,
  formatINR,
  useToast,
} from '../design-system'
import {
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react'

type StatusFilter = 'ALL' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED'

export default function AdminReviewsPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [profiles, setProfiles] = useState<StartupProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState<number | null>(null)

  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Detail & Decision Panel State
  const [selectedProfile, setSelectedProfile] = useState<StartupProfile | null>(null)

  // Feedback Dialog State
  const [feedbackAction, setFeedbackAction] = useState<ReviewAction | null>(null)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [feedbackError, setFeedbackError] = useState('')
  const [submittingDecision, setSubmittingDecision] = useState(false)

  useEffect(() => {
    fetchReviewQueue()
      .then((data) => {
        setProfiles(data)
        if (data.length > 0) setSelectedProfile(data[0])
      })
      .catch((nextError: unknown) =>
        setError(nextError instanceof Error ? nextError.message : 'The review queue could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesFilter = filter === 'ALL' || p.reviewStatus === filter
      const matchesQuery =
        !searchQuery ||
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sector && p.sector.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesFilter && matchesQuery
    })
  }, [profiles, filter, searchQuery])

  function openDecisionDialog(action: ReviewAction) {
    setFeedbackAction(action)
    setFeedbackNote(selectedProfile?.reviewNote ?? '')
    setFeedbackError('')
  }

  async function handleExecuteDecision() {
    if (!selectedProfile || !feedbackAction) return
    if (feedbackAction === 'CHANGES_REQUESTED' && !feedbackNote.trim()) {
      setFeedbackError('Feedback note is required when requesting changes.')
      return
    }

    setSubmittingDecision(true)
    setFeedbackError('')
    try {
      const updated = await withCsrf((token) =>
        reviewStartup(selectedProfile.id, feedbackAction, feedbackNote.trim(), token),
      )
      setProfiles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setSelectedProfile(updated)
      showToast(`Review action '${feedbackAction.replace('_', ' ')}' recorded for ${updated.companyName}.`, 'success')
      setFeedbackAction(null)
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setFeedbackError(nextError.message)
      else setFeedbackError(nextError instanceof Error ? nextError.message : 'Review action failed.')
    } finally {
      setSubmittingDecision(false)
    }
  }

  async function handleToggleVisibility(profile: StartupProfile) {
    const nextVis = profile.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
    setWorkingId(profile.id)
    try {
      const updated = await withCsrf((token) => setStartupVisibility(profile.id, nextVis, token))
      setProfiles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      if (selectedProfile?.id === profile.id) setSelectedProfile(updated)
      showToast(`${profile.companyName} is now ${nextVis.toLowerCase()}.`, 'info')
    } catch (nextError: unknown) {
      showToast(nextError instanceof Error ? nextError.message : 'Visibility update failed.', 'error')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading review queue…" />

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administrative Governance</p>
          <h1>Keep context in the decision.</h1>
          <p>
            Review submitted startup profiles, provide structured feedback loops, and control marketplace visibility.
          </p>
        </div>
        <Badge variant="neutral">{profiles.length} total filings</Badge>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <SegmentedControl<StatusFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { id: 'ALL', label: 'All filings', count: profiles.length },
            { id: 'SUBMITTED', label: 'Needs review', count: profiles.filter((p) => p.reviewStatus === 'SUBMITTED').length },
            { id: 'CHANGES_REQUESTED', label: 'Changes requested', count: profiles.filter((p) => p.reviewStatus === 'CHANGES_REQUESTED').length },
            { id: 'APPROVED', label: 'Approved', count: profiles.filter((p) => p.reviewStatus === 'APPROVED').length },
            { id: 'REJECTED', label: 'Rejected', count: profiles.filter((p) => p.reviewStatus === 'REJECTED').length },
          ]}
        />

        <div style={{ width: '260px' }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or sector..."
          />
        </div>
      </div>

      {/* Main Review Workplace: Dense Queue on Left, Split Detail on Right */}
      {profiles.length === 0 ? (
        <Card>
          <EmptyState
            title="No startup submissions yet"
            description="When founders submit their company profiles, they will appear here with verified metrics, pitch decks, and review history."
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Dense Queue List */}
          <div>
            <div style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Showing {filteredProfiles.length} filings
            </div>

            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Company & Sector</Th>
                    <Th>Stage</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((p) => {
                    const isSelected = selectedProfile?.id === p.id
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProfile(p)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--bg-subtle)' : undefined,
                        }}
                      >
                        <Td>
                          <strong style={{ display: 'block', color: 'var(--text)' }}>
                            {p.companyName}
                          </strong>
                          <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                            {p.sector || 'Startup'}
                          </span>
                        </Td>
                        <Td>
                          <span style={{ fontSize: 'var(--font-caption)' }}>
                            {p.stage.replace('_', ' ')}
                          </span>
                        </Td>
                        <Td>
                          <StatusPill status={p.reviewStatus} />
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          </div>

          {/* Review Detail & Decision Panel */}
          {selectedProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Decision Panel */}
              <Card style={{ backgroundColor: 'var(--surface-muted)', borderLeft: '3px solid var(--ink)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <span className="eyebrow" style={{ margin: 0 }}>Review Decision</span>
                    <h3 style={{ fontSize: 'var(--font-h3)', margin: 0 }}>{selectedProfile.companyName}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <StatusPill status={selectedProfile.reviewStatus} />
                    <Badge variant={selectedProfile.visibility === 'PUBLIC' ? 'positive' : 'neutral'}>
                      {selectedProfile.visibility.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                {selectedProfile.reviewNote && (
                  <div className="review-note" style={{ marginBottom: 'var(--space-4)' }}>
                    <strong>Current admin note:</strong>
                    <span>{selectedProfile.reviewNote}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openDecisionDialog('APPROVED')}
                    disabled={selectedProfile.reviewStatus === 'APPROVED'}
                  >
                    Approve
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDecisionDialog('CHANGES_REQUESTED')}
                  >
                    Request changes
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDecisionDialog('REJECTED')}
                    disabled={selectedProfile.reviewStatus === 'REJECTED'}
                  >
                    Reject
                  </Button>

                  {selectedProfile.reviewStatus === 'APPROVED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleToggleVisibility(selectedProfile)}
                      disabled={workingId === selectedProfile.id}
                      leftIcon={selectedProfile.visibility === 'PUBLIC' ? <EyeOff size={14} /> : <Eye size={14} />}
                    >
                      {selectedProfile.visibility === 'PUBLIC' ? 'Make private' : 'Make public'}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Submitted Profile Details */}
              <Card>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Company Profile</p>
                    <h2>Filing Information</h2>
                  </div>
                  <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
                    ID #{selectedProfile.id}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div>
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>Tagline</span>
                    <p style={{ fontSize: 'var(--font-small)', fontWeight: 'var(--weight-medium)' }}>
                      {selectedProfile.tagline || '—'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>Website</span>
                    <p style={{ fontSize: 'var(--font-small)' }}>
                      {selectedProfile.website ? (
                        <a href={selectedProfile.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>{selectedProfile.website}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>Headquarters</span>
                    <p style={{ fontSize: 'var(--font-small)' }}>{selectedProfile.headquarters || '—'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>Team & Founded</span>
                    <p style={{ fontSize: 'var(--font-small)' }}>
                      {selectedProfile.teamSize ?? '—'} members · Founded {selectedProfile.foundedYear ?? '—'}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)' }}>Description</span>
                  <p style={{ fontSize: 'var(--font-small)', color: 'var(--text)', lineHeight: '1.5', marginTop: '2px' }}>
                    {selectedProfile.description || 'No description provided.'}
                  </p>
                </div>

                {/* Metrics */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <span className="eyebrow">Reported Metrics</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                    {Object.entries(selectedProfile.metrics).map(([key, val]) => (
                      <div key={key} style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {key.replace(/_/g, ' ')}
                        </span>
                        <strong style={{ display: 'block', fontSize: 'var(--font-body)', fontVariantNumeric: 'tabular-nums' }}>
                          {typeof val === 'number' && key.includes('revenue') ? formatINR(val) : val}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                  <span className="eyebrow">Attached Documents</span>
                  {selectedProfile.documents.length === 0 ? (
                    <p style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                      No documents submitted.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      {selectedProfile.documents.map((doc) => (
                        <div
                          key={doc.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-2) var(--space-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-small)',
                          }}
                        >
                          <div>
                            <Badge variant="neutral" style={{ marginRight: 'var(--space-2)' }}>
                              {doc.kind.replace('_', ' ')}
                            </Badge>
                            <strong>{doc.title}</strong>
                          </div>
                          <a href={doc.resourceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>Open</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <EmptyState title="Select a filing" description="Click on any startup in the queue to review its details and make a decision." />
            </Card>
          )}
        </div>
      )}

      {/* Decision Feedback Modal */}
      <Modal
        isOpen={Boolean(feedbackAction)}
        onClose={() => setFeedbackAction(null)}
        title={
          feedbackAction === 'APPROVED'
            ? `Approve ${selectedProfile?.companyName}`
            : feedbackAction === 'CHANGES_REQUESTED'
              ? `Request changes for ${selectedProfile?.companyName}`
              : `Reject ${selectedProfile?.companyName}`
        }
        description={
          feedbackAction === 'CHANGES_REQUESTED'
            ? 'Provide clear, constructive feedback on what the founder needs to update before approval.'
            : feedbackAction === 'APPROVED'
              ? 'Add an optional approval note for the founder.'
              : 'Add an optional reason for rejecting this filing.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setFeedbackAction(null)} disabled={submittingDecision}>
              Cancel
            </Button>
            <Button
              variant={
                feedbackAction === 'APPROVED'
                  ? 'primary'
                  : feedbackAction === 'CHANGES_REQUESTED'
                    ? 'secondary'
                    : 'destructive'
              }
              loading={submittingDecision}
              onClick={() => void handleExecuteDecision()}
            >
              {feedbackAction === 'APPROVED'
                ? 'Confirm Approval'
                : feedbackAction === 'CHANGES_REQUESTED'
                  ? 'Send Feedback'
                  : 'Confirm Rejection'}
            </Button>
          </>
        }
      >
        <div>
          {feedbackError && <div className="form-alert" role="alert">{feedbackError}</div>}

          <Field
            label={feedbackAction === 'CHANGES_REQUESTED' ? 'Required feedback note' : 'Feedback note (optional)'}
            htmlFor="feedback-note-input"
            required={feedbackAction === 'CHANGES_REQUESTED'}
            hint="This note will be displayed prominently on the founder's workspace."
          >
            {(fieldProps) => (
              <Textarea
                {...fieldProps}
                rows={4}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder={
                  feedbackAction === 'CHANGES_REQUESTED'
                    ? 'e.g. Please attach your audited runway financials and clarify monthly revenue numbers...'
                    : 'Add any contextual note for the founder...'
                }
              />
            )}
          </Field>
        </div>
      </Modal>
    </div>
  )
}

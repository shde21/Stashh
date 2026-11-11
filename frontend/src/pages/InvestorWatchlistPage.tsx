import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { useAuth } from '../auth/useAuth'
import {
  fetchInvestorInterests,
  fetchWatchlist,
  removeFromWatchlist,
  saveToWatchlist,
  withdrawInterest,
} from '../marketplace/marketplace.api'
import type { InterestResponse, MarketplaceStartup } from '../marketplace/marketplace.types'
import {
  Badge,
  Button,
  Card,
  Field,
  Modal,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Textarea,
  Th,
  formatDate,
  useToast,
} from '../design-system'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function InvestorWatchlistPage() {
  const { withCsrf } = useAuth()
  const { showToast } = useToast()

  const [watchlist, setWatchlist] = useState<MarketplaceStartup[]>([])
  const [interests, setInterests] = useState<InterestResponse[]>([])
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [removingItem, setRemovingItem] = useState<MarketplaceStartup | null>(null)
  const [withdrawingItem, setWithdrawingItem] = useState<InterestResponse | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([fetchWatchlist(), fetchInvestorInterests()])
      .then(([nextWatchlist, nextInterests]) => {
        setWatchlist(nextWatchlist)
        setInterests(nextInterests)
        const initialNotes: Record<number, string> = {}
        for (const item of nextWatchlist) {
          initialNotes[item.profileId] = item.note ?? ''
        }
        setEditingNotes(initialNotes)
      })
      .catch((nextError: unknown) => {
        setError(nextError instanceof Error ? nextError.message : 'Watchlist could not be loaded.')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveNote(profileId: number) {
    setWorkingId(profileId)
    setError('')
    setSuccess('')
    const note = editingNotes[profileId] ?? ''
    try {
      await withCsrf((token) => saveToWatchlist(profileId, note, token))
      setWatchlist((current) =>
        current.map((item) => (item.profileId === profileId ? { ...item, note: note || null } : item)),
      )
      setSuccess('Thesis note updated.')
      showToast('Thesis note updated.', 'success')
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'Failed to save note.')
    } finally {
      setWorkingId(null)
    }
  }

  async function handleConfirmRemove() {
    if (!removingItem) return
    const profileId = removingItem.profileId
    setWorkingId(profileId)
    setError('')
    setSuccess('')
    try {
      await withCsrf((token) => removeFromWatchlist(profileId, token))
      setWatchlist((current) => current.filter((item) => item.profileId !== profileId))
      setSuccess('Startup removed from watchlist.')
      showToast('Startup removed from watchlist.', 'info')
      setRemovingItem(null)
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'Failed to remove from watchlist.')
    } finally {
      setWorkingId(null)
    }
  }

  async function handleConfirmWithdraw() {
    if (!withdrawingItem) return
    const profileId = withdrawingItem.profileId
    setWorkingId(profileId)
    setError('')
    setSuccess('')
    try {
      const updated = await withCsrf((token) => withdrawInterest(profileId, token))
      setInterests((current) =>
        current.map((item) => (item.profileId === profileId ? updated : item)),
      )
      setSuccess('Interest request withdrawn.')
      showToast('Interest request withdrawn.', 'info')
      setWithdrawingItem(null)
    } catch (nextError: unknown) {
      if (nextError instanceof ApiError) setError(nextError.message)
      else setError(nextError instanceof Error ? nextError.message : 'Failed to withdraw interest.')
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <FullPageLoading label="Loading your saved watchlist…" />

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Investor Watchlist</p>
          <h1>Track conviction before capital.</h1>
          <p>
            Review approved startups you are watching, record private investment theses, and manage your introductions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Badge variant="neutral">{watchlist.length} saved</Badge>
          <Badge variant="neutral">{interests.length} introductions</Badge>
        </div>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}
      {success && <div className="form-alert form-alert-success" role="status">{success}</div>}

      {/* Section 1: Saved Startups & Theses */}
      <section aria-labelledby="watchlist-title">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 id="watchlist-title" style={{ fontSize: 'var(--font-h3)', margin: 0 }}>Saved Startups & Thesis Notes</h2>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
              Keep your thoughts and conviction clear as companies develop. Notes are strictly private.
            </p>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <Card>
            <EmptyState
              title="Your watchlist is empty"
              description="Explore open rounds and approved startups in the discovery room to bookmark companies for later evaluation."
              action={
                <Link to="/app/investor/discover">
                  <Button variant="primary" size="sm">
                    Discover startups
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {watchlist.map((item) => (
              <Card key={item.profileId} as="article" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <Badge variant="neutral">{item.sector ?? 'Startup'}</Badge>
                      <Badge variant="neutral">{item.stage.replace('_', ' ')}</Badge>
                      <span style={{ fontSize: 'var(--font-caption)', color: 'var(--text-tertiary)' }}>
                        Saved {formatDate(item.savedAt)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--font-h3)', margin: 0 }}>{item.companyName}</h3>
                    {item.tagline && (
                      <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                        {item.tagline}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemovingItem(item)}
                    disabled={workingId === item.profileId}
                    leftIcon={<Trash2 size={14} strokeWidth={1.75} />}
                    style={{ color: 'var(--negative-text)' }}
                    aria-label={`Remove ${item.companyName} from watchlist`}
                  >
                    Remove from watchlist
                  </Button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                  <Field
                    label="Private thesis note"
                    htmlFor={`thesis-${item.profileId}`}
                    hint="Only you can see this. Record why you are watching and key milestones."
                    suffix="Confidential"
                  >
                    {(fieldProps) => (
                      <Textarea
                        {...fieldProps}
                        id={`thesis-${item.profileId}`}
                        rows={2}
                        value={editingNotes[item.profileId] ?? ''}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({ ...prev, [item.profileId]: e.target.value }))
                        }
                        placeholder="Why are you watching this company? What milestones matter?"
                      />
                    )}
                  </Field>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleSaveNote(item.profileId)}
                      disabled={workingId === item.profileId}
                    >
                      {workingId === item.profileId ? 'Saving…' : 'Save thesis note'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Introductions & Expressed Interest */}
      <section aria-labelledby="introductions-title" style={{ marginTop: 'var(--space-12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 id="introductions-title" style={{ fontSize: 'var(--font-h3)', margin: 0 }}>
              Your Introductions & Expressed Interest
            </h2>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
              Signal-level conversations you initiated from the marketplace.
            </p>
          </div>
        </div>

        {interests.length === 0 ? (
          <Card>
            <EmptyState
              title="No introductions sent yet"
              description="When you find a company you would like to connect with, send a lightweight introduction from the discovery room."
            />
          </Card>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Company</Th>
                  <Th>Status</Th>
                  <Th>Introduction Message</Th>
                  <Th>Date</Th>
                  <Th numeric>Action</Th>
                </tr>
              </thead>
              <tbody>
                {interests.map((interest) => (
                  <tr key={interest.id}>
                    <Td>
                      <strong style={{ color: 'var(--text)' }}>{interest.companyName}</strong>
                    </Td>
                    <Td>
                      <StatusPill status={interest.status} />
                    </Td>
                    <Td style={{ maxWidth: '360px' }}>
                      <span style={{ fontSize: 'var(--font-small)', color: 'var(--text)' }}>
                        {interest.message ?? 'No introduction note provided.'}
                      </span>
                    </Td>
                    <Td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(interest.updatedAt)}
                    </Td>
                    <Td numeric>
                      {interest.status === 'PENDING' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setWithdrawingItem(interest)}
                          disabled={workingId === interest.profileId}
                        >
                          Withdraw introduction
                        </Button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </section>

      {/* REMOVE FROM WATCHLIST CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(removingItem)}
        onClose={() => setRemovingItem(null)}
        title="Remove from watchlist"
        description={`Remove ${removingItem?.companyName} from your private watchlist? Your saved thesis notes will be deleted.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemovingItem(null)} disabled={workingId === removingItem?.profileId}>
              Keep on watchlist
            </Button>
            <Button
              variant="destructive"
              loading={workingId === removingItem?.profileId}
              onClick={() => void handleConfirmRemove()}
            >
              Remove company
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 'var(--font-small)', color: 'var(--text-secondary)' }}>
          You can re-add this company to your watchlist anytime from the Discover Startups directory.
        </p>
      </Modal>

      {/* WITHDRAW INTRODUCTION CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(withdrawingItem)}
        onClose={() => setWithdrawingItem(null)}
        title="Withdraw introduction"
        description={`Are you sure you want to withdraw your formal expression of interest in ${withdrawingItem?.companyName}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setWithdrawingItem(null)} disabled={workingId === withdrawingItem?.profileId}>
              Keep active
            </Button>
            <Button
              variant="destructive"
              loading={workingId === withdrawingItem?.profileId}
              onClick={() => void handleConfirmWithdraw()}
            >
              Withdraw introduction
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 'var(--font-small)', color: 'var(--text-secondary)' }}>
          The founder will no longer see your pending interest. You can reach out again from the Discover page.
        </p>
      </Modal>
    </div>
  )
}

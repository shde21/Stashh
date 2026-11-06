import { useEffect, useState } from 'react'
import { EmptyState, FullPageLoading } from '../components/feedback/States'
import { fetchStartupInterests } from '../marketplace/startup-marketplace.api'
import type { InterestResponse } from '../marketplace/marketplace.types'
import {
  Badge,
  Card,
  StatusPill,
  Table,
  TableWrapper,
  Td,
  Th,
  formatDate,
} from '../design-system'
import { Mail } from 'lucide-react'

export default function StartupInterestsPage() {
  const [interests, setInterests] = useState<InterestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStartupInterests()
      .then(setInterests)
      .catch((nextError: unknown) =>
        setError(nextError instanceof Error ? nextError.message : 'Investor interest could not be loaded.'),
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FullPageLoading label="Loading investor interest…" />

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Conversations & Signal</p>
          <h1>Investor Interest Inbox</h1>
          <p>
            Review prospective introductions sent by investors who discovered your company in the marketplace. Use this as a lightweight signal for future conversations.
          </p>
        </div>
        <Badge variant="neutral">{interests.length} introductions</Badge>
      </div>

      {error && <div className="form-alert" role="alert">{error}</div>}

      {interests.length === 0 ? (
        <Card>
          <EmptyState
            title="No investor introductions yet"
            description="Once your company profile is approved and public, investors can review your terms and send an introduction note from the discovery experience."
          />
        </Card>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Investor Email</Th>
                <Th>Status</Th>
                <Th>Message</Th>
                <Th>Received Date</Th>
              </tr>
            </thead>
            <tbody>
              {interests.map((interest) => (
                <tr key={interest.id}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Mail size={14} strokeWidth={1.75} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                      <strong style={{ color: 'var(--text)' }}>{interest.investorEmail}</strong>
                    </div>
                  </Td>
                  <Td>
                    <StatusPill status={interest.status} />
                  </Td>
                  <Td style={{ maxWidth: '420px', lineHeight: '1.5' }}>
                    <p style={{ margin: 0, fontSize: 'var(--font-small)', color: 'var(--text)' }}>
                      {interest.message || 'No introduction note attached.'}
                    </p>
                  </Td>
                  <Td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(interest.updatedAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  )
}

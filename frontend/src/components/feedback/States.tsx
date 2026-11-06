import type { ReactNode } from 'react'
import { EmptyState as DSEmptyState } from '../../design-system/EmptyState'

export function FullPageLoading({ label = 'Loading Ventureline…' }: { label?: string }) {
  return (
    <main className="full-page-state" aria-busy="true">
      <span className="loading-orbit" aria-hidden="true" />
      <p role="status" style={{ fontSize: 'var(--font-small)', color: 'var(--text-secondary)' }}>
        {label}
      </p>
    </main>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return <DSEmptyState title={title} description={description} action={action} />
}

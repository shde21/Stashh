import type { ReactNode } from 'react'

export function FullPageLoading({ label = 'Loading Ventureline…' }: { label?: string }) {
  return (
    <main className="full-page-state" aria-busy="true">
      <span className="loading-orbit" aria-hidden="true" />
      <p role="status">{label}</p>
    </main>
  )
}

export function EmptyState({ title, description, action }: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-dot" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

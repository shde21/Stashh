import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`vl-empty-state ${className}`}>
      <div className="vl-empty-icon" aria-hidden="true">
        {icon || <Inbox size={20} strokeWidth={1.75} />}
      </div>
      <h3 className="vl-empty-title">{title}</h3>
      <p className="vl-empty-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

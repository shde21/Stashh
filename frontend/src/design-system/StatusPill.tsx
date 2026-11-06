import type { HTMLAttributes } from 'react'

export type BadgeVariant = 'neutral' | 'positive' | 'negative' | 'warning' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

export function Badge({
  variant = 'neutral',
  dot = true,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span className={`vl-badge vl-badge-${variant} ${className}`} {...props}>
      {dot && <span className="vl-badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}

function getVariantForStatus(status: string): BadgeVariant {
  switch (status.toUpperCase()) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'OPEN':
    case 'ACCEPTED':
    case 'PUBLIC':
      return 'positive'
    case 'CHANGES_REQUESTED':
    case 'PENDING':
    case 'SUBMITTED':
      return 'warning'
    case 'REJECTED':
    case 'CLOSED':
    case 'CANCELLED':
    case 'WITHDRAWN':
      return 'negative'
    case 'DRAFT':
    case 'PRIVATE':
    default:
      return 'neutral'
  }
}

/**
 * StatusPill maps domain status strings into semantic badge variants
 */
export function StatusPill({ status }: { status: string }) {
  const variant = getVariantForStatus(status)
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

  return <Badge variant={variant}>{label}</Badge>
}

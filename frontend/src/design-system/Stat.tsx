import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export interface StatProps {
  label: string
  value: ReactNode
  delta?: {
    value: ReactNode
    type: 'positive' | 'negative' | 'neutral'
  }
  subtext?: ReactNode
  className?: string
}

export function Stat({
  label,
  value,
  delta,
  subtext,
  className = '',
}: StatProps) {
  return (
    <div className={`vl-stat ${className}`}>
      <span className="vl-stat-label">{label}</span>
      <span className="vl-stat-value">{value}</span>
      {(delta || subtext) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {delta && (
            <span className={`vl-stat-delta ${delta.type}`}>
              {delta.type === 'positive' && <TrendingUp size={14} strokeWidth={1.75} aria-hidden="true" />}
              {delta.type === 'negative' && <TrendingDown size={14} strokeWidth={1.75} aria-hidden="true" />}
              <span>{delta.value}</span>
            </span>
          )}
          {subtext && <span className="vl-stat-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  )
}

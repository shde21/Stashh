import type { HTMLAttributes } from 'react'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  color?: string
  label?: string
}

export function ProgressBar({
  value,
  color,
  label = `${Math.round(value)}% complete`,
  className = '',
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`vl-progress ${className}`}
      {...props}
    >
      <div
        className="vl-progress-fill"
        style={{
          width: `${clamped}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  )
}

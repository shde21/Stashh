import type { ReactNode } from 'react'

export interface TabOption<T extends string> {
  id: T
  label: ReactNode
  count?: number
}

export interface SegmentedControlProps<T extends string> {
  options: TabOption<T>[]
  value: T
  onChange: (value: T) => void
  name?: string
  className?: string
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`vl-segmented ${className}`} role="tablist">
      {options.map((option) => {
        const isSelected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`vl-segmented-btn ${isSelected ? 'vl-segmented-active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {option.count != null && (
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '0.75rem',
                  opacity: 0.75,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ({option.count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export interface TabsProps<T extends string> {
  options: TabOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div className={`vl-tabs-nav ${className}`} role="tablist">
      {options.map((option) => {
        const isSelected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`vl-tab-item ${isSelected ? 'vl-tab-active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {option.count != null && (
              <span style={{ marginLeft: '6px', opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>
                ({option.count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

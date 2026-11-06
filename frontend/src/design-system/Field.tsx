import { type ReactNode, useId } from 'react'

export interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  suffix?: string
  required?: boolean
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  suffix,
  required,
  children,
  className = '',
}: FieldProps) {
  const generatedId = useId()
  const id = htmlFor || generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className={`vl-field ${className}`}>
      <div className="vl-field-label-row">
        <label htmlFor={id} className="vl-field-label">
          {label}
          {required && <span aria-hidden="true" style={{ color: 'var(--negative)', marginLeft: '2px' }}>*</span>}
        </label>
        {suffix && <span className="vl-field-suffix">{suffix}</span>}
      </div>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
      })}

      {hint && !error && (
        <span id={hintId} className="vl-field-hint">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} className="vl-field-error">
          {error}
        </span>
      )}
    </div>
  )
}

import { forwardRef, type SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', error, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`vl-select ${className}`}
      aria-invalid={error || props['aria-invalid']}
      {...props}
    >
      {children}
    </select>
  )
})

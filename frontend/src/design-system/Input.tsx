import { forwardRef, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`vl-input ${className}`}
      aria-invalid={error || props['aria-invalid']}
      {...props}
    />
  )
})

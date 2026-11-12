import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { ApiError } from '../../lib/api'
import { validateLogin, type FieldErrors } from '../../lib/validators'
import { useAuth } from '../../auth/useAuth'
import { Button, Field, Input } from '../../design-system'

export interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
}

export function LoginForm({ redirectTo = '/app', onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateLogin({ email, password })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await login({ email, password })
      onSuccess?.()
      navigate(redirectTo, { replace: true })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'We could not sign you in. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {formError && <div className="form-alert" role="alert">{formError}</div>}

      <Field label="Email address" htmlFor="login-email-input" error={errors.email}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="name@company.com"
          />
        )}
      </Field>

      <Field label="Password" htmlFor="login-password-input" error={errors.password}>
        {(fieldProps) => (
          <div className="password-input-wrap">
            <Input
              {...fieldProps}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Eye size={16} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </Field>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        rightIcon={!submitting ? <ArrowRight size={16} strokeWidth={2} /> : undefined}
        style={{ width: '100%', marginTop: 'var(--space-1)' }}
      >
        {submitting ? 'Signing you in…' : 'Sign in'}
      </Button>
    </form>
  )
}


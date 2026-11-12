import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ApiError } from '../../lib/api'
import type { UserRole } from '../../auth/auth.types'
import { validateRegistration, type FieldErrors } from '../../lib/validators'
import { useAuth } from '../../auth/useAuth'
import { Button, Field, Input } from '../../design-system'

export interface RegisterFormProps {
  initialRole?: UserRole
  onSuccess?: () => void
}

export function RegisterForm({ initialRole = 'STARTUP', onSuccess }: RegisterFormProps) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>(initialRole === 'INVESTOR' ? 'INVESTOR' : 'STARTUP')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setRole(initialRole === 'INVESTOR' ? 'INVESTOR' : 'STARTUP')
  }, [initialRole])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateRegistration({
      email,
      password,
      confirmPassword,
      role: role as 'STARTUP' | 'INVESTOR',
    })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({ email, password, role: role as 'STARTUP' | 'INVESTOR' })
      onSuccess?.()
      navigate('/app', { replace: true })
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError(error instanceof Error ? error.message : 'We could not create your account. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {formError && <div className="form-alert" role="alert">{formError}</div>}

      <fieldset className="role-picker">
        <legend>Account type</legend>
        <div className="role-options" role="radiogroup" aria-label="Account type">
          <label className={`role-option ${role === 'STARTUP' ? 'role-option-selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value="STARTUP"
              checked={role === 'STARTUP'}
              onChange={() => setRole('STARTUP')}
            />
            <span>
              <strong>Startup</strong>
              <small>Raise simulated rounds</small>
            </span>
          </label>
          <label className={`role-option ${role === 'INVESTOR' ? 'role-option-selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value="INVESTOR"
              checked={role === 'INVESTOR'}
              onChange={() => setRole('INVESTOR')}
            />
            <span>
              <strong>Investor</strong>
              <small>Discover &amp; evaluate equity shares</small>
            </span>
          </label>
        </div>
        {errors.role && <small className="field-error">{errors.role}</small>}
      </fieldset>

      <Field label="Email address" htmlFor="register-email-input" error={errors.email}>
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

      <div className="field-grid">
        <Field label="Password" htmlFor="register-password-input" error={errors.password}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 12 characters"
            />
          )}
        </Field>

        <Field label="Confirm password" htmlFor="register-confirm-password-input" error={errors.confirmPassword}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat password"
            />
          )}
        </Field>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        rightIcon={!submitting ? <ArrowRight size={16} strokeWidth={2} /> : undefined}
        style={{ width: '100%', marginTop: 'var(--space-1)' }}
      >
        {submitting ? 'Creating workspace…' : 'Create workspace'}
      </Button>
    </form>
  )
}


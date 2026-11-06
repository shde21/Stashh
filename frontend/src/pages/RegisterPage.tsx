import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ApiError } from '../lib/api'
import type { UserRole } from '../auth/auth.types'
import { validateRegistration, type FieldErrors } from '../lib/validators'
import { useAuth } from '../auth/useAuth'
import { Button, Field, Input } from '../design-system'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryRole = new URLSearchParams(location.search).get('role')
  const [role, setRole] = useState<UserRole>(queryRole === 'INVESTOR' ? 'INVESTOR' : 'STARTUP')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Choose your account role to set up your simulated workspace."
      footer={<span>Already have an account? <Link to="/login">Sign in</Link></span>}
    >
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
                <small>Discover & evaluate equity shares</small>
              </span>
            </label>
          </div>
          {errors.role && <small className="field-error">{errors.role}</small>}
        </fieldset>

        <Field label="Email address" htmlFor="email-input" error={errors.email}>
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
          <Field label="Password" htmlFor="password-input" error={errors.password}>
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

          <Field label="Confirm password" htmlFor="confirm-password-input" error={errors.confirmPassword}>
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
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {submitting ? 'Creating workspace…' : 'Create workspace'}
        </Button>
      </form>
    </AuthLayout>
  )
}

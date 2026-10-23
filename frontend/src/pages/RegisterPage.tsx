import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ApiError } from '../lib/api'
import type { UserRole } from '../auth/auth.types'
import { validateRegistration, type FieldErrors } from '../lib/validators'
import { useAuth } from '../auth/useAuth'

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
    const nextErrors = validateRegistration({ email, password, confirmPassword, role: role as 'STARTUP' | 'INVESTOR' })
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
      eyebrow="Start with the right context"
      title="Choose the path that fits your next move."
      description="Create a secure workspace. You can refine the details as the product takes shape."
      footer={<span>Already have an account? <Link to="/login">Sign in</Link></span>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        <fieldset className="role-picker">
          <legend>Account type</legend>
          <div className="role-options">
            <label className={`role-option ${role === 'STARTUP' ? 'role-option-selected' : ''}`}>
              <input type="radio" name="role" value="STARTUP" checked={role === 'STARTUP'} onChange={() => setRole('STARTUP')} />
              <span><strong>Startup</strong><small>Build the company profile</small></span>
            </label>
            <label className={`role-option ${role === 'INVESTOR' ? 'role-option-selected' : ''}`}>
              <input type="radio" name="role" value="INVESTOR" checked={role === 'INVESTOR'} onChange={() => setRole('INVESTOR')} />
              <span><strong>Investor</strong><small>Explore opportunities</small></span>
            </label>
          </div>
          {errors.role && <small className="field-error">{errors.role}</small>}
        </fieldset>
        <label className="field">
          <span>Email address</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} placeholder="you@company.com" />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>
        <div className="field-grid">
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.password)} placeholder="12+ characters" />
            {errors.password && <small className="field-error">{errors.password}</small>}
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} placeholder="Repeat password" />
            {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
          </label>
        </div>
        <button className="button form-submit" type="submit" disabled={submitting}>
          {submitting ? 'Creating workspace…' : 'Create workspace'}
          {!submitting && <span>↗</span>}
        </button>
      </form>
    </AuthLayout>
  )
}

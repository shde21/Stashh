import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ApiError } from '../lib/api'
import { validateLogin, type FieldErrors } from '../lib/validators'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const from = typeof location.state?.from === 'string' ? location.state.from : '/app'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateLogin({ email, password })
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
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
    <AuthLayout
      eyebrow="Welcome back"
      title="Return to the signal."
      description="Sign in to continue building, discovering, or reviewing what matters next."
      footer={<span>New to Ventureline? <Link to="/register">Create an account</Link></span>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            placeholder="you@company.com"
          />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            placeholder="At least 12 characters"
          />
          {errors.password && <small className="field-error">{errors.password}</small>}
        </label>
        <button className="button form-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing you in…' : 'Sign in'}
          {!submitting && <span>↗</span>}
        </button>
      </form>
    </AuthLayout>
  )
}

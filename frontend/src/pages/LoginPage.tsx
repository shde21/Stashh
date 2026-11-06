import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ApiError } from '../lib/api'
import { validateLogin, type FieldErrors } from '../lib/validators'
import { useAuth } from '../auth/useAuth'
import { Button, Field, Input } from '../design-system'

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
      eyebrow="Account access"
      title="Sign in to Stashh"
      description="Enter your credentials to access your workspace."
      footer={<span>Don’t have an account? <Link to="/register">Create an account</Link></span>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        
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

        <Field label="Password" htmlFor="password-input" error={errors.password}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          )}
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {submitting ? 'Signing you in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}

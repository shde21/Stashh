import { describe, expect, it } from 'vitest'
import { validateLogin, validateRegistration } from './validators'

describe('auth validators', () => {
  it('requires a valid login email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Enter your email address.',
      password: 'Enter your password.',
    })
    expect(validateLogin({ email: 'not-an-email', password: 'secret' }).email).toBe('Enter a valid email address.')
  })

  it('requires a strong matching registration password and role', () => {
    const errors = validateRegistration({
      email: 'founder@example.com',
      password: 'short',
      confirmPassword: 'different',
      role: '' as 'STARTUP',
    })

    expect(errors.password).toBe('Use at least 12 characters.')
    expect(errors.confirmPassword).toBe('Passwords must match.')
    expect(errors.role).toBe('Choose Startup or Investor.')
  })
})

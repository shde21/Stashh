import type { LoginCredentials, RegistrationInput, UserRole } from '../auth/auth.types'

export type FieldErrors = Record<string, string>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin(input: LoginCredentials): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.email.trim()) errors.email = 'Enter your email address.'
  else if (!emailPattern.test(input.email.trim())) errors.email = 'Enter a valid email address.'
  if (!input.password) errors.password = 'Enter your password.'
  return errors
}

export function validateRegistration(
  input: RegistrationInput & { confirmPassword: string },
): FieldErrors {
  const errors = validateLogin(input)
  if (input.password.length > 0 && input.password.length < 12) {
    errors.password = 'Use at least 12 characters.'
  }
  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords must match.'
  }
  if (!(['STARTUP', 'INVESTOR'] as UserRole[]).includes(input.role)) {
    errors.role = 'Choose Startup or Investor.'
  }
  return errors
}

import { apiRequest } from '../lib/api'
import type { AuthUser, LoginCredentials, RegistrationInput } from './auth.types'

type CsrfResponse = {
  token: string
}

export function fetchCsrfToken(): Promise<CsrfResponse> {
  return apiRequest<CsrfResponse>('/api/v1/auth/csrf')
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/me')
}

export function registerUser(input: RegistrationInput, csrfToken: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
    csrfToken,
  })
}

export function loginUser(input: LoginCredentials, csrfToken: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    csrfToken,
  })
}

export function logoutUser(csrfToken: string): Promise<void> {
  return apiRequest<void>('/api/v1/auth/logout', {
    method: 'POST',
    csrfToken,
  })
}

import { createContext } from 'react'
import type { AuthUser, LoginCredentials, RegistrationInput } from './auth.types'

export type AuthState =
  | { status: 'loading'; user: null; error: string | null }
  | { status: 'authenticated'; user: AuthUser; error: null }
  | { status: 'unauthenticated'; user: null; error: string | null }

export type AuthContextValue = {
  state: AuthState
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  register: (input: RegistrationInput) => Promise<AuthUser>
  logout: () => Promise<void>
  withCsrf: <T>(action: (token: string) => Promise<T>) => Promise<T>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

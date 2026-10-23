import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError } from '../lib/api'
import { fetchCsrfToken, fetchCurrentUser, loginUser, logoutUser, registerUser } from './auth.api'
import { AuthContext, type AuthContextValue, type AuthState } from './auth.context'
import type { LoginCredentials, RegistrationInput } from './auth.types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null, error: null })
  const csrfTokenRef = useRef<string | null>(null)

  const ensureCsrfToken = useCallback(async () => {
    if (csrfTokenRef.current) return csrfTokenRef.current
    const response = await fetchCsrfToken()
    csrfTokenRef.current = response.token
    return response.token
  }, [])

  const withCsrfRetry = useCallback(async <T,>(action: (token: string) => Promise<T>) => {
    let token = await ensureCsrfToken()
    try {
      return await action(token)
    } catch (error: unknown) {
      if (!(error instanceof ApiError) || error.status !== 403 || error.code !== 'CSRF_INVALID') {
        throw error
      }

      csrfTokenRef.current = null
      token = await ensureCsrfToken()
      return action(token)
    }
  }, [ensureCsrfToken])

  const refreshSession = useCallback(async () => {
    try {
      try {
        await ensureCsrfToken()
      } catch {
        csrfTokenRef.current = null
      }

      const user = await fetchCurrentUser()
      setState({ status: 'authenticated', user, error: null })
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setState({ status: 'unauthenticated', user: null, error: null })
        return
      }

      setState({
        status: 'unauthenticated',
        user: null,
        error: error instanceof Error ? error.message : 'The session could not be checked.',
      })
    }
  }, [ensureCsrfToken])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const user = await withCsrfRetry((token) => loginUser(credentials, token))
    setState({ status: 'authenticated', user, error: null })
    return user
  }, [withCsrfRetry])

  const register = useCallback(async (input: RegistrationInput) => {
    const user = await withCsrfRetry((token) => registerUser(input, token))
    setState({ status: 'authenticated', user, error: null })
    return user
  }, [withCsrfRetry])

  const logout = useCallback(async () => {
    await withCsrfRetry((token) => logoutUser(token))
    csrfTokenRef.current = null
    setState({ status: 'unauthenticated', user: null, error: null })
  }, [withCsrfRetry])

  const value = useMemo<AuthContextValue>(() => ({
    state,
    user: state.user,
    isAuthenticated: state.status === 'authenticated',
    login,
    register,
    logout,
    refreshSession,
  }), [login, logout, refreshSession, register, state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

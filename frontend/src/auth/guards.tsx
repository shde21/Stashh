import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageLoading } from '../components/feedback/States'
import { useAuth } from './useAuth'
import type { UserRole } from './auth.types'

export function RequireAuth() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') return <FullPageLoading label="Checking your session…" />
  if (state.status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return <Outlet />
}

export function RequireRole({ role }: { role: UserRole }) {
  const { state } = useAuth()

  if (state.status === 'loading') return <FullPageLoading label="Preparing your workspace…" />
  if (state.status !== 'authenticated') return <Navigate to="/login" replace />
  if (state.user.role !== role) return <Navigate to="/forbidden" replace />

  return <Outlet />
}

export function PublicOnly() {
  const { state } = useAuth()
  if (state.status === 'loading') return <FullPageLoading />
  if (state.status === 'authenticated') return <Navigate to="/app" replace />
  return <Outlet />
}

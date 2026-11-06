import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function DashboardRedirectPage() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={`/app/${user.role.toLowerCase()}`} replace />
}

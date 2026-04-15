import { Navigate } from 'react-router-dom'
import { PropsWithChildren } from 'react'
import { useAuth } from '../../hooks/useAuth'

type Props = PropsWithChildren<{
  allowedRoles?: Array<'admin' | 'practice_supervisor' | 'viewer'>
}>

export function ProtectedRoute({ allowedRoles, children }: Props) {
  const { isLoading, isAuthenticated, user } = useAuth()

  if (isLoading) {
    return <div className="page-content"><div className="panel">Загрузка...</div></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
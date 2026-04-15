import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const toast = useToast()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Practice Tracker</h1>
        <p className="login-subtitle">Вход в систему</p>

        <form
          className="entity-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setIsSubmitting(true)
            try {
              await login(username, password)
              toast.success('Вход выполнен')
            } catch (error) {
              toast.error('Не удалось войти', extractErrorMessage(error))
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <label>
            Логин
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
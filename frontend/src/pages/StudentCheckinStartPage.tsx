import { useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { startStudentCheckinSession, saveStudentToken } from '../api/studentCheckin'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function StudentCheckinStartPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const toast = useToast()

  useEffect(() => {
    async function run() {
      if (!token) return

      try {
        const result = await startStudentCheckinSession(token)
        saveStudentToken(result.session_token)
        window.location.href = '/student-checkin'
      } catch (error) {
        toast.error('Не удалось открыть check-in', extractErrorMessage(error))
      }
    }

    run()
  }, [token, toast])

  if (!token) {
    return <div className="page-content"><div className="panel">Токен не найден</div></div>
  }

  return <div className="page-content"><div className="panel">Подготовка check-in...</div></div>
}
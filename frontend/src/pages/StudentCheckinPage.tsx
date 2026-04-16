import { useEffect, useState } from 'react'
import { getStudentCheckinHistory, getStudentCheckinMe, submitStudentCheckin } from '../api/studentCheckin'
import { StudentCheckinCard } from '../components/student-checkin/StudentCheckinCard'
import { StudentCheckinHistory } from '../components/student-checkin/StudentCheckinHistory'
import type { StudentCheckinHistoryResponse, StudentCheckinMeResponse, StudentCheckinSubmitResponse } from '../types/studentCheckin'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function StudentCheckinPage() {
  const toast = useToast()

  const [me, setMe] = useState<StudentCheckinMeResponse | null>(null)
  const [history, setHistory] = useState<StudentCheckinHistoryResponse | null>(null)
  const [lastResult, setLastResult] = useState<StudentCheckinSubmitResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadAll() {
    setIsLoading(true)
    try {
      const [meData, historyData] = await Promise.all([
        getStudentCheckinMe(),
        getStudentCheckinHistory(),
      ])
      setMe(meData)
      setHistory(historyData)
    } catch (error) {
      toast.error('Не удалось загрузить данные', extractErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleSubmit() {
    if (!navigator.geolocation) {
      toast.error('Геолокация недоступна', 'Браузер не поддерживает геолокацию')
      return
    }

    setIsSubmitting(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await submitStudentCheckin({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy_m: position.coords.accuracy,
          })
          setLastResult(result)
          toast.success('Отметка отправлена')
          await loadAll()
        } catch (error) {
          toast.error('Не удалось отправить отметку', extractErrorMessage(error))
        } finally {
          setIsSubmitting(false)
        }
      },
      (error) => {
        toast.error('Не удалось получить геолокацию', error.message)
        setIsSubmitting(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  if (isLoading) {
    return <div className="page-content"><div className="panel">Загрузка...</div></div>
  }

  if (!me) {
    return <div className="page-content"><div className="panel">Нет данных</div></div>
  }

  return (
    <div className="student-checkin-page">
      <StudentCheckinCard
        me={me}
        lastResult={lastResult}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      <StudentCheckinHistory items={history?.items ?? []} />
    </div>
  )
}
import { apiFetch } from './client'
import type { StudentHistoryResponse } from '../types/studentHistory'

export function getStudentStatusHistory(params: {
  studentId: number
  dateFrom?: string
  dateTo?: string
  skip?: number
  limit?: number
}) {
  const search = new URLSearchParams({
    skip: String(params.skip ?? 0),
    limit: String(params.limit ?? 200),
  })

  if (params.dateFrom) search.set('date_from', params.dateFrom)
  if (params.dateTo) search.set('date_to', params.dateTo)

  return apiFetch<StudentHistoryResponse>(
    `/api/v1/daily-statuses/history/${params.studentId}?${search.toString()}`
  )
}
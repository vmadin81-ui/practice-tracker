import { apiFetch } from './client'
import type { PaginatedResponse } from '../types/common'
import type { GeolocationLogItem } from '../types/geolocation'

export function getGeolocationLogs(params: {
  studentId?: number
  assignmentId?: number
  source?: string
  date?: string
  dateFrom?: string
  dateTo?: string
  skip?: number
  limit?: number
}) {
  const search = new URLSearchParams({
    skip: String(params.skip ?? 0),
    limit: String(params.limit ?? 200),
  })

  if (params.studentId) search.set('student_id', String(params.studentId))
  if (params.assignmentId) search.set('assignment_id', String(params.assignmentId))
  if (params.source) search.set('source', params.source)
  if (params.date) search.set('date', params.date)
  if (params.dateFrom) search.set('date_from', params.dateFrom)
  if (params.dateTo) search.set('date_to', params.dateTo)

  return apiFetch<PaginatedResponse<GeolocationLogItem>>(
    `/api/v1/geolocation/logs?${search.toString()}`
  )
}
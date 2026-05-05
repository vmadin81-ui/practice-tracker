import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type { GeolocationLogItem } from '../types/geolocation'

export function getGeolocationLogs(params?: {
  skip?: number
  limit?: number
  studentId?: number
  dateFrom?: string
  dateTo?: string
  source?: string
  checkResult?: string
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.studentId) searchParams.set('student_id', String(params.studentId))
  if (params?.dateFrom) searchParams.set('date_from', params.dateFrom)
  if (params?.dateTo) searchParams.set('date_to', params.dateTo)
  if (params?.source) searchParams.set('source', params.source)
  if (params?.checkResult) searchParams.set('check_result', params.checkResult)

  return apiRequest<PaginatedResponse<GeolocationLogItem>>(
    `/api/v1/geolocation/logs?${searchParams.toString()}`
  )
}
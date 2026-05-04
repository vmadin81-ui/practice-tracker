import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type { DailyStatusItem } from '../types/dailyStatus'

export function getDailyStatuses(params: {
  statusDate?: string
  groupId?: number
  enterpriseId?: number
  statusColor?: string
  skip?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams({
    skip: String(params.skip ?? 0),
    limit: String(params.limit ?? 20),
  })

  if (params.statusDate) searchParams.set('status_date', params.statusDate)
  if (params.groupId) searchParams.set('group_id', String(params.groupId))
  if (params.enterpriseId) searchParams.set('enterprise_id', String(params.enterpriseId))
  if (params.statusColor) searchParams.set('status_color', params.statusColor)

  return apiRequest<PaginatedResponse<DailyStatusItem>>(
    `/api/v1/daily-statuses/?${searchParams.toString()}`
  )
}

export function recalculateDailyStatuses(statusDate: string) {
  return apiRequest<{ message: string }>(
    `/api/v1/daily-statuses/recalculate?status_date=${statusDate}`,
    {
      method: 'POST',
    }
  )
}
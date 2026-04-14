import { apiFetch } from './client'
import type { PaginatedDailyStatuses } from '../types/dailyStatus'

export function getDailyStatuses(params: {
  statusDate: string
  statusColor?: string
  groupId?: number
  enterpriseId?: number
  skip?: number
  limit?: number
}) {
  const search = new URLSearchParams({
    status_date: params.statusDate,
    skip: String(params.skip ?? 0),
    limit: String(params.limit ?? 100),
  })

  if (params.statusColor) search.set('status_color', params.statusColor)
  if (params.groupId) search.set('group_id', String(params.groupId))
  if (params.enterpriseId) search.set('enterprise_id', String(params.enterpriseId))

  return apiFetch<PaginatedDailyStatuses>(`/api/v1/daily-statuses/?${search.toString()}`)
}

export async function recalculateDailyStatuses(statusDate: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/api/v1/daily-statuses/recalculate?status_date=${encodeURIComponent(statusDate)}`,
    {
      method: 'POST',
    }
  )
}
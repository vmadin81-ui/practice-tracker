import { apiFetch } from './client'
import type { DashboardMapResponse, DashboardSummaryResponse } from '../types/dashboard'

export function getDashboardSummary(params: {
  statusDate: string
  groupId?: number
  enterpriseId?: number
  statusColor?: string
}) {
  const search = new URLSearchParams({ status_date: params.statusDate })

  if (params.groupId) search.set('group_id', String(params.groupId))
  if (params.enterpriseId) search.set('enterprise_id', String(params.enterpriseId))
  if (params.statusColor) search.set('status_color', params.statusColor)

  return apiFetch<DashboardSummaryResponse>(`/api/v1/dashboard/summary?${search.toString()}`)
}

export function getDashboardMap(params: {
  statusDate: string
  groupId?: number
  enterpriseId?: number
  statusColor?: string
}) {
  const search = new URLSearchParams({ status_date: params.statusDate })

  if (params.groupId) search.set('group_id', String(params.groupId))
  if (params.enterpriseId) search.set('enterprise_id', String(params.enterpriseId))
  if (params.statusColor) search.set('status_color', params.statusColor)

  return apiFetch<DashboardMapResponse>(`/api/v1/dashboard/map?${search.toString()}`)
}
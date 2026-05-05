import { apiRequest } from './client'
import { PaginatedResponse } from '../types/common'
import { EnterpriseAnalyticsItem } from '../types/analytics'

export function getEnterpriseAnalytics(params: {
  skip?: number
  limit?: number
  statusDate: string
  search?: string
  hasIssues?: boolean
  sort?: string
}) {
  const sp = new URLSearchParams({
    skip: String(params.skip ?? 0),
    limit: String(params.limit ?? 20),
    status_date: params.statusDate,
  })

  if (params.search) sp.set('search', params.search)
  if (typeof params.hasIssues === 'boolean') sp.set('has_issues', String(params.hasIssues))
  if (params.sort) sp.set('sort', params.sort)

  return apiRequest<PaginatedResponse<EnterpriseAnalyticsItem>>(
    `/api/v1/analytics/enterprises?${sp.toString()}`
  )
}
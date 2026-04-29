import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  EnterpriseCreatePayload,
  EnterpriseItem,
  EnterpriseUpdatePayload,
} from '../types/enterprises'

export function getEnterprises(params?: {
  skip?: number
  limit?: number
  search?: string
  isActive?: boolean
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.search) searchParams.set('search', params.search)
  if (typeof params?.isActive === 'boolean') {
    searchParams.set('is_active', String(params.isActive))
  }

  return apiRequest<PaginatedResponse<EnterpriseItem>>(
    `/api/v1/enterprises/?${searchParams.toString()}`
  )
}

export function createEnterprise(payload: EnterpriseCreatePayload) {
  return apiRequest<EnterpriseItem>('/api/v1/enterprises/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateEnterprise(enterpriseId: number, payload: EnterpriseUpdatePayload) {
  return apiRequest<EnterpriseItem>(`/api/v1/enterprises/${enterpriseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
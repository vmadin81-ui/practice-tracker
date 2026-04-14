import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  EnterpriseCreatePayload,
  EnterpriseItem,
  EnterpriseUpdatePayload,
} from '../types/enterprises'

export function getEnterprises() {
  return apiRequest<PaginatedResponse<EnterpriseItem>>('/api/v1/enterprises/?skip=0&limit=500')
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
import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  SpecialtyCreatePayload,
  SpecialtyItem,
  SpecialtyUpdatePayload,
} from '../types/specialties'

export function getSpecialties(params?: {
  skip?: number
  limit?: number
  search?: string
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.search) searchParams.set('search', params.search)

  return apiRequest<PaginatedResponse<SpecialtyItem>>(
    `/api/v1/specialties/?${searchParams.toString()}`
  )
}

export function createSpecialty(payload: SpecialtyCreatePayload) {
  return apiRequest<SpecialtyItem>('/api/v1/specialties/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSpecialty(specialtyId: number, payload: SpecialtyUpdatePayload) {
  return apiRequest<SpecialtyItem>(`/api/v1/specialties/${specialtyId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
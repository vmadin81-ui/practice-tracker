import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  SpecialtyCreatePayload,
  SpecialtyItem,
  SpecialtyUpdatePayload,
} from '../types/specialties'

export function getSpecialties() {
  return apiRequest<PaginatedResponse<SpecialtyItem>>(
    '/api/v1/specialties/?skip=0&limit=500'
  )
}

export function createSpecialty(payload: SpecialtyCreatePayload) {
  return apiRequest<SpecialtyItem>('/api/v1/specialties/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSpecialty(
  specialtyId: number,
  payload: SpecialtyUpdatePayload
) {
  return apiRequest<SpecialtyItem>(`/api/v1/specialties/${specialtyId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
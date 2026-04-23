import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  StudentCreatePayload,
  StudentItem,
  StudentUpdatePayload,
} from '../types/students'

export function getStudents(params?: {
  skip?: number
  limit?: number
  search?: string
  groupId?: number
  specialtyId?: number
  isActive?: boolean
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.search) searchParams.set('search', params.search)
  if (params?.groupId) searchParams.set('group_id', String(params.groupId))
  if (params?.specialtyId) searchParams.set('specialty_id', String(params.specialtyId))
  if (typeof params?.isActive === 'boolean') {
    searchParams.set('is_active', String(params.isActive))
  }

  return apiRequest<PaginatedResponse<StudentItem>>(
    `/api/v1/students/?${searchParams.toString()}`
  )
}

export function getStudentById(studentId: number) {
  return apiRequest<StudentItem>(`/api/v1/students/${studentId}`)
}

export function createStudent(payload: StudentCreatePayload) {
  return apiRequest<StudentItem>('/api/v1/students/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateStudent(studentId: number, payload: StudentUpdatePayload) {
  return apiRequest<StudentItem>(`/api/v1/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
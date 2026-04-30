import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  StudentAccessLinkCreatePayload,
  StudentAccessLinkCreateResponse,
  StudentAccessLinkItem,
} from '../types/studentAccessLink'

export function getStudentAccessLinks(params?: {
  skip?: number
  limit?: number
  search?: string
  studentId?: number
  isActive?: boolean
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.search) searchParams.set('search', params.search)
  if (params?.studentId) searchParams.set('student_id', String(params.studentId))
  if (typeof params?.isActive === 'boolean') {
    searchParams.set('is_active', String(params.isActive))
  }

  return apiRequest<PaginatedResponse<StudentAccessLinkItem>>(
    `/api/v1/student-access-links/?${searchParams.toString()}`
  )
}

export function createStudentAccessLink(payload: StudentAccessLinkCreatePayload) {
  return apiRequest<StudentAccessLinkCreateResponse>('/api/v1/student-access-links/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function revokeStudentAccessLink(linkId: number) {
  return apiRequest<StudentAccessLinkItem>(`/api/v1/student-access-links/${linkId}/revoke`, {
    method: 'POST',
  })
}

export function reissueStudentAccessLink(linkId: number) {
  return apiRequest<StudentAccessLinkCreateResponse>(
    `/api/v1/student-access-links/${linkId}/reissue`,
    {
      method: 'POST',
    }
  )
}
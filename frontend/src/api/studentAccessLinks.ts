import { apiRequest } from './client'
import type {
  StudentAccessLinkCreatePayload,
  StudentAccessLinkCreateResponse,
  StudentAccessLinkItem,
} from '../types/studentAccessLink'

export function getStudentAccessLinks(params?: {
  studentId?: number
  isActive?: boolean
}) {
  const search = new URLSearchParams()

  if (params?.studentId) search.set('student_id', String(params.studentId))
  if (typeof params?.isActive === 'boolean') {
    search.set('is_active', String(params.isActive))
  }

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return apiRequest<StudentAccessLinkItem[]>(`/api/v1/student-access-links/${suffix}`)
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
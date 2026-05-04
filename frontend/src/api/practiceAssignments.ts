import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  PracticeAssignmentCreatePayload,
  PracticeAssignmentItem,
  PracticeAssignmentUpdatePayload,
} from '../types/practiceAssignments'

export function getPracticeAssignments(params?: {
  skip?: number
  limit?: number
  studentId?: number
  enterpriseId?: number
  isActive?: boolean
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.studentId) searchParams.set('student_id', String(params.studentId))
  if (params?.enterpriseId) searchParams.set('enterprise_id', String(params.enterpriseId))
  if (typeof params?.isActive === 'boolean') {
    searchParams.set('is_active', String(params.isActive))
  }

  return apiRequest<PaginatedResponse<PracticeAssignmentItem>>(
    `/api/v1/practice-assignments/?${searchParams.toString()}`
  )
}

export function createPracticeAssignment(payload: PracticeAssignmentCreatePayload) {
  return apiRequest<PracticeAssignmentItem>('/api/v1/practice-assignments/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePracticeAssignment(
  assignmentId: number,
  payload: PracticeAssignmentUpdatePayload
) {
  return apiRequest<PracticeAssignmentItem>(`/api/v1/practice-assignments/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
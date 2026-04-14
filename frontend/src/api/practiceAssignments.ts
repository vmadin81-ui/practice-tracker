import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  PracticeAssignmentCreatePayload,
  PracticeAssignmentItem,
  PracticeAssignmentUpdatePayload,
} from '../types/practiceAssignments'

export function getPracticeAssignments() {
  return apiRequest<PaginatedResponse<PracticeAssignmentItem>>(
    '/api/v1/practice-assignments/?skip=0&limit=500'
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
import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type {
  StudentCreatePayload,
  StudentUpdatePayload,
} from '../types/student'

export function getStudents() {
  return apiRequest<PaginatedResponse<StudentItem>>('/api/v1/students/?skip=0&limit=500')
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
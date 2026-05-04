import { useQuery } from '@tanstack/react-query'
import { getPracticeAssignments } from '../api/practiceAssignments'

export function usePracticeAssignments(params?: {
  skip?: number
  limit?: number
  studentId?: number
  enterpriseId?: number
  isActive?: boolean
}) {
  return useQuery({
    queryKey: ['practice-assignments', params],
    queryFn: () => getPracticeAssignments(params),
  })
}
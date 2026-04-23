import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../api/students'

export function useStudents(params?: {
  skip?: number
  limit?: number
  search?: string
  groupId?: number
  specialtyId?: number
  isActive?: boolean
}) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
  })
}
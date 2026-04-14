import { useQuery } from '@tanstack/react-query'
import { getStudentById } from '../api/students'

export function useStudentDetails(studentId?: number) {
  return useQuery({
    queryKey: ['student-details', studentId],
    queryFn: () => getStudentById(studentId as number),
    enabled: Boolean(studentId),
  })
}
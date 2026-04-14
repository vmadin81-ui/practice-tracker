import { useQuery } from '@tanstack/react-query'
import { getPracticeAssignments } from '../api/practiceAssignments'

export function usePracticeAssignments() {
  return useQuery({
    queryKey: ['practice-assignments'],
    queryFn: getPracticeAssignments,
  })
}
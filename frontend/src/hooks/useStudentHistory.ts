import { useQuery } from '@tanstack/react-query'
import { getStudentStatusHistory } from '../api/studentHistory'

export function useStudentHistory(
  studentId?: number,
  dateFrom?: string,
  dateTo?: string
) {
  return useQuery({
    queryKey: ['student-history', studentId, dateFrom, dateTo],
    queryFn: () =>
      getStudentStatusHistory({
        studentId: studentId as number,
        dateFrom,
        dateTo,
      }),
    enabled: Boolean(studentId),
  })
}
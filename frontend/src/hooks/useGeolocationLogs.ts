import { useQuery } from '@tanstack/react-query'
import { getGeolocationLogs } from '../api/geolocation'

export function useGeolocationLogs(params: {
  studentId?: number
  assignmentId?: number
  source?: string
  date?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['geolocation-logs', params],
    queryFn: () => getGeolocationLogs(params),
  })
}
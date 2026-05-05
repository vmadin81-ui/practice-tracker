import { useQuery } from '@tanstack/react-query'
import { getGeolocationLogs } from '../api/geolocation'

export function useGeolocationLogs(params?: {
  skip?: number
  limit?: number
  studentId?: number
  dateFrom?: string
  dateTo?: string
  source?: string
  checkResult?: string
}) {
  return useQuery({
    queryKey: ['geolocation-logs', params],
    queryFn: () => getGeolocationLogs(params),
  })
}
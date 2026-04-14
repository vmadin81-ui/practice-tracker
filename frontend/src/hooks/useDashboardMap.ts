import { useQuery } from '@tanstack/react-query'
import { getDashboardMap } from '../api/dashboard'

export function useDashboardMap(
  statusDate: string,
  groupId?: number,
  enterpriseId?: number,
  statusColor?: string
) {
  return useQuery({
    queryKey: ['dashboard-map', statusDate, groupId, enterpriseId, statusColor],
    queryFn: () => getDashboardMap({ statusDate, groupId, enterpriseId, statusColor }),
    enabled: Boolean(statusDate),
  })
}
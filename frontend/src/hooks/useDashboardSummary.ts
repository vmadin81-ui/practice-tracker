import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../api/dashboard'

export function useDashboardSummary(
  statusDate: string,
  groupId?: number,
  enterpriseId?: number,
  statusColor?: string
) {
  return useQuery({
    queryKey: ['dashboard-summary', statusDate, groupId, enterpriseId, statusColor],
    queryFn: () => getDashboardSummary({ statusDate, groupId, enterpriseId, statusColor }),
    enabled: Boolean(statusDate),
  })
}
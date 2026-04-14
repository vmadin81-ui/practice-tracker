import { useQuery } from '@tanstack/react-query'
import { getDailyStatuses } from '../api/dailyStatuses'

export function useDailyStatuses(
  statusDate: string,
  statusColor?: string,
  groupId?: number,
  enterpriseId?: number
) {
  return useQuery({
    queryKey: ['daily-statuses', statusDate, statusColor, groupId, enterpriseId],
    queryFn: () =>
      getDailyStatuses({
        statusDate,
        statusColor,
        groupId,
        enterpriseId,
      }),
    enabled: Boolean(statusDate),
  })
}
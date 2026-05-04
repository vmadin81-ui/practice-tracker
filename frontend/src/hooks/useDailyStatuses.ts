import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDailyStatuses, recalculateDailyStatuses } from '../api/dailyStatuses'

export function useDailyStatuses(params: {
  statusDate?: string
  groupId?: number
  enterpriseId?: number
  statusColor?: string
  skip?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['daily-statuses', params],
    queryFn: () => getDailyStatuses(params),
  })
}

export function useRecalculateDailyStatuses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (statusDate: string) => recalculateDailyStatuses(statusDate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['daily-statuses'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-map'] })
    },
  })
}
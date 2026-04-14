import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recalculateDailyStatuses } from '../api/dailyStatuses'

export function useRecalculateStatuses(statusDate: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => recalculateDailyStatuses(statusDate),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-map'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-statuses'] }),
      ])
    },
  })
}
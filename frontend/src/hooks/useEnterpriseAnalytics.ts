import { useQuery } from '@tanstack/react-query'
import type { getEnterpriseAnalytics } from '../api/analytics'

export function useEnterpriseAnalytics(params: any) {
  return useQuery({
    queryKey: ['enterprise-analytics', params],
    queryFn: () => getEnterpriseAnalytics(params),
  })
}
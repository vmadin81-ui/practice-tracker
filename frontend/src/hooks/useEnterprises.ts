import { useQuery } from '@tanstack/react-query'
import { getEnterprises } from '../api/enterprises'

export function useEnterprises(params?: {
  skip?: number
  limit?: number
  search?: string
  isActive?: boolean
}) {
  return useQuery({
    queryKey: ['enterprises', params],
    queryFn: () => getEnterprises(params),
  })
}
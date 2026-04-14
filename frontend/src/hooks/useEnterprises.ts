import { useQuery } from '@tanstack/react-query'
import { getEnterprises } from '../api/enterprises'

export function useEnterprises() {
  return useQuery({
    queryKey: ['enterprises'],
    queryFn: getEnterprises,
  })
}
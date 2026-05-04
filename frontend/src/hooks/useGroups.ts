import { useQuery } from '@tanstack/react-query'
import { getGroups } from '../api/groups'

export function useGroups(params?: {
  skip?: number
  limit?: number
  search?: string
  specialtyId?: number
}) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => getGroups(params),
  })
}
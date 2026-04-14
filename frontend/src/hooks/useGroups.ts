import { useQuery } from '@tanstack/react-query'
import { getGroups } from '../api/groups'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })
}
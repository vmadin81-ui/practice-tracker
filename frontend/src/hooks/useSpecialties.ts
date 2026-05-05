import { useQuery } from '@tanstack/react-query'
import { getSpecialties } from '../api/specialties'

export function useSpecialties(params?: {
  skip?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: ['specialties', params],
    queryFn: () => getSpecialties(params),
  })
}
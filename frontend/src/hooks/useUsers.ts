import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, getUsers } from '../api/auth'
import type { UserCreatePayload } from '../types/auth'

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: () => getUsers(role),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
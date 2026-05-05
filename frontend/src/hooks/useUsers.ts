import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, getUsers, updateUser } from '../api/auth'
import type { UserCreatePayload } from '../types/auth'

export function useUsers(params?: {
  skip?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
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

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<UserCreatePayload> & { password?: string | null }
    }) => updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
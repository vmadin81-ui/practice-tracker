import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGroup, updateGroup } from '../api/groups'
import type { GroupCreatePayload, GroupUpdatePayload } from '../types/groups'

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GroupCreatePayload) => createGroup(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useUpdateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GroupUpdatePayload }) =>
      updateGroup(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
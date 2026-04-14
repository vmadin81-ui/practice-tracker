import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEnterprise, updateEnterprise } from '../api/enterprises'
import type {
  EnterpriseCreatePayload,
  EnterpriseUpdatePayload,
} from '../types/enterprises'

export function useCreateEnterprise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EnterpriseCreatePayload) => createEnterprise(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enterprises'] })
    },
  })
}

export function useUpdateEnterprise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EnterpriseUpdatePayload }) =>
      updateEnterprise(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enterprises'] })
    },
  })
}
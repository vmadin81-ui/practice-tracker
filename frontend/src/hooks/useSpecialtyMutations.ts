import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSpecialty, updateSpecialty } from '../api/specialties'
import type {
  SpecialtyCreatePayload,
  SpecialtyUpdatePayload,
} from '../types/specialties'

export function useCreateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SpecialtyCreatePayload) => createSpecialty(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialties'] })
    },
  })
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SpecialtyUpdatePayload }) =>
      updateSpecialty(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['specialties'] })
    },
  })
}
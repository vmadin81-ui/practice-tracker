import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createStudent, updateStudent } from '../api/students'
import type { StudentCreatePayload, StudentUpdatePayload } from '../types/students'

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: StudentCreatePayload) => createStudent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StudentUpdatePayload }) =>
      updateStudent(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
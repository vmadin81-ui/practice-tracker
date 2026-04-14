import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createPracticeAssignment,
  updatePracticeAssignment,
} from '../api/practiceAssignments'
import type {
  PracticeAssignmentCreatePayload,
  PracticeAssignmentUpdatePayload,
} from '../types/practiceAssignments'

export function useCreatePracticeAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PracticeAssignmentCreatePayload) =>
      createPracticeAssignment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['practice-assignments'] })
    },
  })
}

export function useUpdatePracticeAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: PracticeAssignmentUpdatePayload
    }) => updatePracticeAssignment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['practice-assignments'] })
    },
  })
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import  {
  createStudentAccessLink,
  getStudentAccessLinks,
  reissueStudentAccessLink,
  revokeStudentAccessLink,
} from '../api/studentAccessLinks'
import type { StudentAccessLinkCreatePayload } from '../types/studentAccessLink'

export function useStudentAccessLinks(params?: {
  studentId?: number
  isActive?: boolean
}) {
  return useQuery({
    queryKey: ['student-access-links', params],
    queryFn: () => getStudentAccessLinks(params),
  })
}

export function useCreateStudentAccessLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: StudentAccessLinkCreatePayload) =>
      createStudentAccessLink(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student-access-links'] })
    },
  })
}

export function useRevokeStudentAccessLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: number) => revokeStudentAccessLink(linkId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student-access-links'] })
    },
  })
}

export function useReissueStudentAccessLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: number) => reissueStudentAccessLink(linkId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student-access-links'] })
    },
  })
}
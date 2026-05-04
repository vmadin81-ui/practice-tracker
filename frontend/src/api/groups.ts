import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type { GroupCreatePayload, GroupItem, GroupUpdatePayload } from '../types/groups'

export function getGroups(params?: {
  skip?: number
  limit?: number
  search?: string
  specialtyId?: number
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 500),
  })

  if (params?.search) searchParams.set('search', params.search)
  if (params?.specialtyId) searchParams.set('specialty_id', String(params.specialtyId))

  return apiRequest<PaginatedResponse<GroupItem>>(
    `/api/v1/groups/?${searchParams.toString()}`
  )
}

export function createGroup(payload: GroupCreatePayload) {
  return apiRequest<GroupItem>('/api/v1/groups/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateGroup(groupId: number, payload: GroupUpdatePayload) {
  return apiRequest<GroupItem>(`/api/v1/groups/${groupId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
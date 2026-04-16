import { apiRequest } from './client'
import type { PaginatedResponse } from '../types/common'
import type { GroupCreatePayload, GroupItem, GroupUpdatePayload } from '../types/group'

export function getGroups() {
  return apiRequest<PaginatedResponse<GroupItem>>('/api/v1/groups/?skip=0&limit=500')
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

import type { AuthUser, TokenResponse, UserCreatePayload, UserItem } from '../types/auth'
import type { PaginatedResponse } from '../types/common'
import { apiRequest } from './client'

export async function loginRequest(username: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)

  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Login failed')
  }

  return response.json()
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Failed to get current user')
  }

  return response.json()
}

export function getUsers(params?: {
  skip?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
}) {
  const searchParams = new URLSearchParams({
    skip: String(params?.skip ?? 0),
    limit: String(params?.limit ?? 20),
  })

  if (params?.search) searchParams.set('search', params.search)
  if (params?.role) searchParams.set('role', params.role)
  if (typeof params?.isActive === 'boolean') {
    searchParams.set('is_active', String(params.isActive))
  }

  return apiRequest<PaginatedResponse<UserItem>>(
    `/api/v1/auth/users?${searchParams.toString()}`
  )
}

export function createUser(payload: UserCreatePayload) {
  return apiRequest<UserItem>('/api/v1/auth/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(
  userId: number,
  payload: Partial<UserCreatePayload> & { password?: string | null }
) {
  return apiRequest<UserItem>(`/api/v1/auth/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
import type { AuthUser, TokenResponse, UserCreatePayload, UserItem } from '../types/auth'
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

export function getUsers(role?: string) {
  const suffix = role ? `?role=${encodeURIComponent(role)}` : ''
  return apiRequest<UserItem[]>(`/api/v1/auth/users${suffix}`)
}

export function createUser(payload: UserCreatePayload) {
  return apiRequest<UserItem>('/api/v1/auth/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
import { extractErrorMessage } from '../utils/errors'

const TOKEN_KEY = 'practice_tracker_token'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  try {
    return await apiFetch<T>(path, init)
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
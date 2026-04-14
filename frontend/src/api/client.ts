import { extractErrorMessage } from '../utils/errors'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
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
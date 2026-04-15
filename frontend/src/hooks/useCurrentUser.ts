import { useAuth } from './useAuth'

export function useCurrentUser() {
  const { user } = useAuth()
  return user
}
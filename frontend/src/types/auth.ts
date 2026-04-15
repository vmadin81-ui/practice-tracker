export type UserRole = 'admin' | 'practice_supervisor' | 'viewer'

export type AuthUser = {
  id: number
  username: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
  group_ids: number[]
}

export type TokenResponse = {
  access_token: string
  token_type: string
}
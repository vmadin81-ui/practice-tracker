export type StudentAccessLinkItem = {
  id: number
  student_id: number
  channel: string
  label: string | null
  issued_by_user_id: number | null
  is_active: boolean
  expires_at: string | null
  last_used_at: string | null
  revoked_at: string | null
  usage_count: number
  last_device_id: string | null
  last_device_label: string | null
  created_at: string
  student?: {
    id: number
    full_name: string
    group?: { id: number; name: string } | null
  } | null
  issued_by_user?: {
    id: number
    username: string
    full_name: string | null
    role: 'admin' | 'practice_supervisor' | 'viewer'
    is_active: boolean
  } | null
}

export type StudentAccessLinkCreatePayload = {
  student_id: number
  label?: string | null
  expires_at?: string | null
  channel?: string
}

export type StudentAccessLinkCreateResponse = {
  item: StudentAccessLinkItem
  raw_access_token: string
}
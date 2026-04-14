export type StudentItem = {
  id: number
  last_name: string
  first_name: string
  middle_name: string | null
  full_name: string
  phone: string | null
  telegram_id: string | null
  group_id: number | null
  specialty_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  group?: {
    id: number
    name: string
  } | null
  specialty?: {
    id: number
    name: string
  } | null
}

export type StudentCreatePayload = {
  last_name: string
  first_name: string
  middle_name?: string | null
  full_name?: string | null
  phone?: string | null
  telegram_id?: string | null
  group_id?: number | null
  specialty_id?: number | null
  is_active: boolean
}

export type StudentUpdatePayload = Partial<StudentCreatePayload>
export type PaginatedResponse<T> = {
  total: number
  items: T[]
}

export type GroupItem = {
  id: number
  name: string
  course: number | null
  specialty_id: number | null
  created_at: string
  specialty?: {
    id: number
    name: string
    code?: string | null
  } | null
}

export type EnterpriseItem = {
  id: number
  name: string
  address: string | null
  contact_person: string | null
  contact_phone: string | null
  latitude: number
  longitude: number
  allowed_radius_m: number
  is_active: boolean
  created_at: string
  updated_at: string
}
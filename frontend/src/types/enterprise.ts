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

export type EnterpriseCreatePayload = {
  name: string
  address?: string | null
  contact_person?: string | null
  contact_phone?: string | null
  latitude: number
  longitude: number
  allowed_radius_m: number
  is_active: boolean
}

export type EnterpriseUpdatePayload = Partial<EnterpriseCreatePayload>
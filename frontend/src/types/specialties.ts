export type SpecialtyItem = {
  id: number
  code: string | null
  name: string
  created_at: string
}

export type SpecialtyCreatePayload = {
  code?: string | null
  name: string
}

export type SpecialtyUpdatePayload = Partial<SpecialtyCreatePayload>
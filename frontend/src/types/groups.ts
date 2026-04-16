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

export type GroupCreatePayload = {
  name: string
  course?: number | null
  specialty_id?: number | null
}

export type GroupUpdatePayload = Partial<GroupCreatePayload>
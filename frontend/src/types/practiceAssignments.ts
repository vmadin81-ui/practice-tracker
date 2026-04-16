export type PracticeAssignmentItem = {
  id: number
  student_id: number
  enterprise_id: number
  supervisor_user_id: number | null
  start_date: string
  end_date: string
  supervisor_name: string | null
  supervisor_phone: string | null
  schedule_json: Record<string, unknown> | null
  monitoring_mode: string
  required_checkins_per_day: number
  allowed_start_time: string | null
  allowed_end_time: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  student?: {
    id: number
    full_name: string
  } | null
  enterprise?: {
    id: number
    name: string
  } | null
  supervisor_user?: {
    id: number
    username: string
    full_name: string | null
    role: 'admin' | 'practice_supervisor' | 'viewer'
    is_active: boolean
  } | null
}

export type PracticeAssignmentCreatePayload = {
  student_id: number
  enterprise_id: number
  supervisor_user_id?: number | null
  start_date: string
  end_date: string
  supervisor_name?: string | null
  supervisor_phone?: string | null
  schedule_json?: Record<string, unknown> | null
  monitoring_mode: string
  required_checkins_per_day: number
  allowed_start_time?: string | null
  allowed_end_time?: string | null
  is_active: boolean
}

export type PracticeAssignmentUpdatePayload =
  Partial<PracticeAssignmentCreatePayload>
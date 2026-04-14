export type DailyStatusItem = {
  id: number
  student_id: number
  assignment_id: number | null
  status_date: string
  status_color: 'green' | 'yellow' | 'red' | 'gray'
  last_geolocation_log_id: number | null
  last_check_id: number | null
  checkins_count: number
  required_checkins_count: number
  is_on_place: boolean | null
  comment: string | null
  updated_at: string
  student?: {
    id: number
    full_name: string
    group_id?: number | null
    specialty_id?: number | null
  } | null
  assignment?: {
    id: number
    enterprise_id?: number | null
  } | null
}

export type PaginatedDailyStatuses = {
  total: number
  items: DailyStatusItem[]
}
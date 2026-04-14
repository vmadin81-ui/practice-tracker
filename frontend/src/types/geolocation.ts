export type GeolocationCheckResult = {
  id: number
  geolocation_log_id: number
  assignment_id: number | null
  enterprise_id: number | null
  distance_m: number | null
  within_radius: boolean | null
  accuracy_ok: boolean | null
  time_window_ok: boolean | null
  check_result: string
  comment: string | null
  checked_at: string
}

export type GeolocationLogItem = {
  id: number
  student_id: number
  assignment_id: number | null
  source: string
  latitude: number
  longitude: number
  accuracy_m: number | null
  sent_at: string
  received_at: string
  processing_status: string
  created_at: string
  student?: {
    id: number
    full_name: string
  } | null
  assignment?: {
    id: number
    enterprise_id?: number | null
    start_date?: string
    end_date?: string
    is_active?: boolean
  } | null
  check?: GeolocationCheckResult | null
}
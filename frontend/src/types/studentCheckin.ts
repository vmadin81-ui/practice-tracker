export type StudentCheckinSessionStartResponse = {
  session_token: string
  expires_at: string
}

export type StudentCheckinMeResponse = {
  student_id: number
  full_name: string
  group_name: string | null
  specialty_name: string | null
  assignment_id: number | null
  enterprise_name: string | null
  enterprise_address: string | null
  start_date: string | null
  end_date: string | null
  today_checkins_count: number
  required_checkins_per_day: number | null
  status_message: string
  has_geolocation_consent: boolean
  consent_text_version: string
}

export type StudentCheckinSubmitResponse = {
  geolocation_log_id: number
  status_color: string
  distance_m: number | null
  comment: string | null
}

export type StudentCheckinHistoryItem = {
  geolocation_log_id: number
  sent_at: string
  latitude: number
  longitude: number
  accuracy_m: number | null
  status_color: string | null
  distance_m: number | null
  comment: string | null
}

export type StudentCheckinHistoryResponse = {
  total: number
  items: StudentCheckinHistoryItem[]
}

export type StudentConsentSubmitResponse = {
  has_geolocation_consent: boolean
  consent_text_version: string
}
export type StatusCounters = {
  total: number
  checked_in: number
  green: number
  yellow: number
  red: number
  gray: number
}

export type GroupSummaryItem = {
  group_id: number | null
  group_name: string
  counters: StatusCounters
}

export type EnterpriseSummaryItem = {
  enterprise_id: number | null
  enterprise_name: string
  counters: StatusCounters
}

export type DashboardSummaryResponse = {
  date: string
  totals: StatusCounters
  by_groups: GroupSummaryItem[]
  by_enterprises: EnterpriseSummaryItem[]
}

export type MapStudentPoint = {
  student_id: number
  full_name: string
  group_name: string | null
  enterprise_name: string | null
  status_color: 'green' | 'yellow' | 'red' | 'gray'
  last_sent_at: string | null
  latitude: number | null
  longitude: number | null
  distance_m: number | null
  comment: string | null
}

export type MapEnterprisePoint = {
  enterprise_id: number
  name: string
  latitude: number
  longitude: number
  allowed_radius_m: number
}

export type DashboardMapResponse = {
  date: string
  students: MapStudentPoint[]
  enterprises: MapEnterprisePoint[]
}
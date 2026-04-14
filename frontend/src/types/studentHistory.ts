import type { DailyStatusItem } from './dailyStatus'

export type StudentHistoryResponse = {
  total: number
  items: DailyStatusItem[]
}
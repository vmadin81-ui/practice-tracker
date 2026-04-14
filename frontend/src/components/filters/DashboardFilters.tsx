import { FilterBar } from './FilterBar'
import type { GroupItem, EnterpriseItem } from '../../types/common'

type Props = {
  statusDate: string
  onStatusDateChange: (value: string) => void
  statusColor: string
  onStatusColorChange: (value: string) => void
  groupId: string
  onGroupIdChange: (value: string) => void
  enterpriseId: string
  onEnterpriseIdChange: (value: string) => void
  groups: GroupItem[]
  enterprises: EnterpriseItem[]
  onRecalculate?: () => void
  isRecalculating?: boolean
}

export function DashboardFilters(props: Props) {
  return <FilterBar {...props} />
}
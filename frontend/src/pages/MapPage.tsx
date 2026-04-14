import { useState } from 'react'
import { DashboardFilters } from '../components/filters/DashboardFilters'
import { PracticeMap } from '../components/map/PracticeMap'
import { useDashboardMap } from '../hooks/useDashboardMap'
import { useGroups } from '../hooks/useGroups'
import { useEnterprises } from '../hooks/useEnterprises'
import { useRecalculateStatuses } from '../hooks/useRecalculateStatuses'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function MapPage() {
  const [statusDate, setStatusDate] = useState(todayIso())
  const [statusColor, setStatusColor] = useState('')
  const [groupId, setGroupId] = useState('')
  const [enterpriseId, setEnterpriseId] = useState('')

  const groupsQuery = useGroups()
  const enterprisesQuery = useEnterprises()

  const numericGroupId = groupId ? Number(groupId) : undefined
  const numericEnterpriseId = enterpriseId ? Number(enterpriseId) : undefined

  const { data, isLoading, error } = useDashboardMap(
    statusDate,
    numericGroupId,
    numericEnterpriseId,
    statusColor || undefined
  )

  const recalcMutation = useRecalculateStatuses(statusDate)

  return (
    <div className="page-grid">
      <DashboardFilters
        statusDate={statusDate}
        onStatusDateChange={setStatusDate}
        statusColor={statusColor}
        onStatusColorChange={setStatusColor}
        groupId={groupId}
        onGroupIdChange={setGroupId}
        enterpriseId={enterpriseId}
        onEnterpriseIdChange={setEnterpriseId}
        groups={groupsQuery.data?.items ?? []}
        enterprises={enterprisesQuery.data?.items ?? []}
        onRecalculate={() => recalcMutation.mutate()}
        isRecalculating={recalcMutation.isPending}
      />

      {isLoading && <div className="panel">Загрузка карты...</div>}
      {error && <div className="panel">Ошибка загрузки карты</div>}

      {data && <PracticeMap data={data} />}
    </div>
  )
}
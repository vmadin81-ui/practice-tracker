import { useState } from 'react'
import { DashboardFilters } from '../components/filters/DashboardFilters'
import { StatCard } from '../components/dashboard/StatCard'
import { GroupSummaryTable } from '../components/dashboard/GroupSummaryTable'
import { EnterpriseSummaryTable } from '../components/dashboard/EnterpriseSummaryTable'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useGroups } from '../hooks/useGroups'
import { useEnterprises } from '../hooks/useEnterprises'
import { useRecalculateStatuses } from '../hooks/useRecalculateStatuses'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function DashboardPage() {
  const [statusDate, setStatusDate] = useState(todayIso())
  const [statusColor, setStatusColor] = useState('')
  const [groupId, setGroupId] = useState('')
  const [enterpriseId, setEnterpriseId] = useState('')

  const groupsQuery = useGroups()
  const enterprisesQuery = useEnterprises()

  const numericGroupId = groupId ? Number(groupId) : undefined
  const numericEnterpriseId = enterpriseId ? Number(enterpriseId) : undefined

  const { data, isLoading, error } = useDashboardSummary(
    statusDate,
    numericGroupId,
    numericEnterpriseId
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

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки данных</div>}

      {data && (
        <>
          <div className="stats-grid">
            <StatCard title="Всего студентов" value={data.totals.total} />
            <StatCard title="Отметились" value={data.totals.checked_in} />
            <StatCard title="Green" value={data.totals.green} tone="green" />
            <StatCard title="Yellow" value={data.totals.yellow} tone="yellow" />
            <StatCard title="Red" value={data.totals.red} tone="red" />
            <StatCard title="Gray" value={data.totals.gray} tone="gray" />
          </div>

          <div className="summary-grid">
            <GroupSummaryTable items={data.by_groups} />
            <EnterpriseSummaryTable items={data.by_enterprises} />
          </div>
        </>
      )}
    </div>
  )
}
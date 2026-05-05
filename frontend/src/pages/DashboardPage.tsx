import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

  const groupsQuery = useGroups({
    skip: 0,
    limit: 500,
  })

  const enterprisesQuery = useEnterprises({
    skip: 0,
    limit: 500,
    isActive: true,
  })

  const numericGroupId = groupId ? Number(groupId) : undefined
  const numericEnterpriseId = enterpriseId ? Number(enterpriseId) : undefined

  const { data, isLoading, error } = useDashboardSummary(
    statusDate,
    numericGroupId,
    numericEnterpriseId,
    statusColor || undefined
  )

  const recalcMutation = useRecalculateStatuses(statusDate)

  const topEnterprises = useMemo(() => {
    if (!data) return []

    return [...data.by_enterprises]
      .sort((a, b) => b.counters.total - a.counters.total)
      .slice(0, 10)
  }, [data])

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

            <div>
              <EnterpriseSummaryTable items={topEnterprises} />

              <div className="dashboard-note">
                Показаны 10 крупнейших предприятий по количеству студентов.
              </div>

              <Link className="secondary-btn" to="/enterprise-summary">
                Открыть полный отчёт по предприятиям
              </Link>

              {data.by_enterprises.length > 10 && (
                <div className="dashboard-note">
                  Всего предприятий в сводке: {data.by_enterprises.length}.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
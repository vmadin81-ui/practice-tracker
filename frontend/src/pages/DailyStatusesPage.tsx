import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Pagination } from '../components/ui/Pagination'
import { DailyStatusesFilters } from '../components/filters/DailyStatusesFilters'
import { DailyStatusesTable } from '../components/tables/DailyStatusesTable'
import {
  useDailyStatuses,
  useRecalculateDailyStatuses,
} from '../hooks/useDailyStatuses'
import { useGroups } from '../hooks/useGroups'
import { useEnterprises } from '../hooks/useEnterprises'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

const PAGE_SIZE = 20

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function DailyStatusesPage() {
  const toast = useToast()
  const recalculateMutation = useRecalculateDailyStatuses()

  const [skip, setSkip] = useState(0)
  const [statusDate, setStatusDate] = useState(todayIso())
  const [groupId, setGroupId] = useState('')
  const [enterpriseId, setEnterpriseId] = useState('')
  const [statusColor, setStatusColor] = useState('')

  const groupsQuery = useGroups({
    skip: 0,
    limit: 500,
  })

  const enterprisesQuery = useEnterprises({
    skip: 0,
    limit: 500,
    isActive: true,
  })

  const params = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      statusDate,
      groupId: groupId ? Number(groupId) : undefined,
      enterpriseId: enterpriseId ? Number(enterpriseId) : undefined,
      statusColor: statusColor || undefined,
    }
  }, [skip, statusDate, groupId, enterpriseId, statusColor])

  const { data, isLoading, error } = useDailyStatuses(params)

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  async function handleRecalculate() {
    try {
      await recalculateMutation.mutateAsync(statusDate)
      toast.success('Статусы пересчитаны')
    } catch (err) {
      toast.error('Не удалось пересчитать статусы', extractErrorMessage(err))
    }
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Статусы"
        onAdd={handleRecalculate}
        addLabel={recalculateMutation.isPending ? 'Пересчёт...' : 'Пересчитать'}
      />

      <DailyStatusesFilters
        statusDate={statusDate}
        onStatusDateChange={(value) => resetPagingAndSet(setStatusDate, value)}
        groupId={groupId}
        onGroupIdChange={(value) => resetPagingAndSet(setGroupId, value)}
        enterpriseId={enterpriseId}
        onEnterpriseIdChange={(value) => resetPagingAndSet(setEnterpriseId, value)}
        statusColor={statusColor}
        onStatusColorChange={(value) => resetPagingAndSet(setStatusColor, value)}
        groups={groupsQuery.data?.items ?? []}
        enterprises={enterprisesQuery.data?.items ?? []}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки статусов</div>}

      {data && (
        <>
          <DailyStatusesTable items={data.items} />

          <Pagination
            skip={skip}
            limit={PAGE_SIZE}
            total={data.total}
            onChange={setSkip}
          />
        </>
      )}
    </div>
  )
}
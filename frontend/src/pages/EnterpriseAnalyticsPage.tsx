import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Pagination } from '../components/ui/Pagination'
import { EnterpriseAnalyticsFilters } from '../components/filters/EnterpriseAnalyticsFilters'
import { EnterpriseAnalyticsTable } from '../components/tables/EnterpriseAnalyticsTable'
import { useEnterpriseAnalytics } from '../hooks/useEnterpriseAnalytics'

const PAGE_SIZE = 20

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function EnterpriseAnalyticsPage() {
  const [skip, setSkip] = useState(0)
  const [statusDate, setStatusDate] = useState(today())
  const [search, setSearch] = useState('')
  const [hasIssues, setHasIssues] = useState('')
  const [sort, setSort] = useState('total')

  const params = useMemo(() => ({
    skip,
    limit: PAGE_SIZE,
    statusDate,
    search: search || undefined,
    hasIssues: hasIssues === '' ? undefined : hasIssues === 'true',
    sort,
  }), [skip, statusDate, search, hasIssues, sort])

  const { data, isLoading } = useEnterpriseAnalytics(params)

  return (
    <div className="page-grid">
      <PageToolbar title="Отчёт по предприятиям" />

      <EnterpriseAnalyticsFilters
        statusDate={statusDate}
        onStatusDateChange={(v) => { setSkip(0); setStatusDate(v) }}
        search={search}
        onSearchChange={(v) => { setSkip(0); setSearch(v) }}
        hasIssues={hasIssues}
        onHasIssuesChange={(v) => { setSkip(0); setHasIssues(v) }}
        sort={sort}
        onSortChange={(v) => setSort(v)}
      />

      {isLoading && <div className="panel">Загрузка...</div>}

      {data && (
        <>
          <EnterpriseAnalyticsTable items={data.items} />

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
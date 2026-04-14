import { useMemo, useState } from 'react'
import { GeolocationLogFilters } from '../components/filters/GeolocationLogFilters'
import { GeolocationLogsTable } from '../components/tables/GeolocationLogsTable'
import { GeolocationSummaryCards } from '../components/geolocation/GeolocationSummaryCards'
import { useGeolocationLogs } from '../hooks/useGeolocationLogs'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function GeolocationLogsPage() {
  const [dateFrom, setDateFrom] = useState(todayIso())
  const [dateTo, setDateTo] = useState(todayIso())
  const [source, setSource] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useGeolocationLogs({
    dateFrom,
    dateTo,
    source: source || undefined,
  })

  const filteredItems = useMemo(() => {
    const items = data?.items ?? []
    if (!search.trim()) return items

    const needle = search.trim().toLowerCase()
    return items.filter((item) =>
      (item.student?.full_name ?? '').toLowerCase().includes(needle)
    )
  }, [data?.items, search])

  return (
    <div className="page-grid">
      <GeolocationLogFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        source={source}
        search={search}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSourceChange={setSource}
        onSearchChange={setSearch}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки журнала геолокации</div>}

      {data && (
        <>
          <GeolocationSummaryCards items={filteredItems} />
          <GeolocationLogsTable items={filteredItems} />
        </>
      )}
    </div>
  )
}
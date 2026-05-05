import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Pagination } from '../components/ui/Pagination'
import { StatCard } from '../components/dashboard/StatCard'
import { EnterpriseSummaryReportFilters } from '../components/filters/EnterpriseSummaryReportFilters'
import { EnterpriseSummaryReportTable } from '../components/tables/EnterpriseSummaryReportTable'
import { useDashboardSummary } from '../hooks/useDashboardSummary'

const PAGE_SIZE = 20

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function EnterpriseSummaryReportPage() {
  const [skip, setSkip] = useState(0)
  const [statusDate, setStatusDate] = useState(todayIso())
  const [search, setSearch] = useState('')
  const [onlyProblems, setOnlyProblems] = useState(false)
  const [sortBy, setSortBy] = useState('total_desc')

  const { data, isLoading, error } = useDashboardSummary(
    statusDate,
    undefined,
    undefined,
    undefined
  )

  const filteredItems = useMemo(() => {
    if (!data) return []

    let items = [...data.by_enterprises]

    if (search.trim()) {
      const value = search.trim().toLowerCase()
      items = items.filter((item) =>
        item.enterprise_name.toLowerCase().includes(value)
      )
    }

    if (onlyProblems) {
      items = items.filter(
        (item) => item.counters.red > 0 || item.counters.yellow > 0
      )
    }

    items.sort((a, b) => {
      if (sortBy === 'red_desc') return b.counters.red - a.counters.red
      if (sortBy === 'yellow_desc') return b.counters.yellow - a.counters.yellow
      if (sortBy === 'green_desc') return b.counters.green - a.counters.green
      if (sortBy === 'name_asc') {
        return a.enterprise_name.localeCompare(b.enterprise_name)
      }
      return b.counters.total - a.counters.total
    })

    return items
  }, [data, search, onlyProblems, sortBy])

  const pageItems = filteredItems.slice(skip, skip + PAGE_SIZE)

  const reportTotals = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.total += item.counters.total
        acc.checked_in += item.counters.checked_in
        acc.green += item.counters.green
        acc.yellow += item.counters.yellow
        acc.red += item.counters.red
        acc.gray += item.counters.gray
        return acc
      },
      {
        total: 0,
        checked_in: 0,
        green: 0,
        yellow: 0,
        red: 0,
        gray: 0,
      }
    )
  }, [filteredItems])

  function resetPagingAndSetString(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  function resetPagingAndSetBoolean(setter: (value: boolean) => void, value: boolean) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar title="Отчёт по предприятиям">
        <Link className="secondary-btn" to="/">
          Назад на дашборд
        </Link>
      </PageToolbar>

      <EnterpriseSummaryReportFilters
        statusDate={statusDate}
        onStatusDateChange={(value) => resetPagingAndSetString(setStatusDate, value)}
        search={search}
        onSearchChange={(value) => resetPagingAndSetString(setSearch, value)}
        onlyProblems={onlyProblems}
        onOnlyProblemsChange={(value) =>
          resetPagingAndSetBoolean(setOnlyProblems, value)
        }
        sortBy={sortBy}
        onSortByChange={(value) => resetPagingAndSetString(setSortBy, value)}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки отчёта</div>}

      {data && (
        <>
          <div className="stats-grid">
            <StatCard title="Предприятий" value={filteredItems.length} />
            <StatCard title="Всего студентов" value={reportTotals.total} />
            <StatCard title="Отметились" value={reportTotals.checked_in} />
            <StatCard title="Green" value={reportTotals.green} tone="green" />
            <StatCard title="Yellow" value={reportTotals.yellow} tone="yellow" />
            <StatCard title="Red" value={reportTotals.red} tone="red" />
            <StatCard title="Gray" value={reportTotals.gray} tone="gray" />
          </div>

          <EnterpriseSummaryReportTable items={pageItems} />

          <Pagination
            skip={skip}
            limit={PAGE_SIZE}
            total={filteredItems.length}
            onChange={setSkip}
          />
        </>
      )}
    </div>
  )
}
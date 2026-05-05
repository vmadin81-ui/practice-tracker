import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Pagination } from '../components/ui/Pagination'
import { GeolocationLogsFilters } from '../components/filters/GeolocationLogsFilters'
import { GeolocationLogsTable } from '../components/tables/GeolocationLogsTable'
import { GeolocationSummaryCards } from '../components/geolocation/GeolocationSummaryCards'
import { useGeolocationLogs } from '../hooks/useGeolocationLogs'
import { useStudents } from '../hooks/useStudents'

const PAGE_SIZE = 20

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function GeolocationLogsPage() {
  const [skip, setSkip] = useState(0)
  const [dateFrom, setDateFrom] = useState(todayIso())
  const [dateTo, setDateTo] = useState(todayIso())
  const [studentId, setStudentId] = useState('')
  const [source, setSource] = useState('')
  const [checkResult, setCheckResult] = useState('')

  const studentsQuery = useStudents({
    skip: 0,
    limit: 500,
    isActive: true,
  })

  const params = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      studentId: studentId ? Number(studentId) : undefined,
      source: source || undefined,
      checkResult: checkResult || undefined,
    }
  }, [skip, dateFrom, dateTo, studentId, source, checkResult])

  const { data, isLoading, error } = useGeolocationLogs(params)

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar title="Журнал геолокации" />

      <GeolocationLogsFilters
        dateFrom={dateFrom}
        onDateFromChange={(value) => resetPagingAndSet(setDateFrom, value)}
        dateTo={dateTo}
        onDateToChange={(value) => resetPagingAndSet(setDateTo, value)}
        studentId={studentId}
        onStudentIdChange={(value) => resetPagingAndSet(setStudentId, value)}
        source={source}
        onSourceChange={(value) => resetPagingAndSet(setSource, value)}
        checkResult={checkResult}
        onCheckResultChange={(value) => resetPagingAndSet(setCheckResult, value)}
        students={studentsQuery.data?.items ?? []}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки журнала геолокации</div>}

      {data && (
        <>
          <GeolocationSummaryCards items={data.items} />
          <GeolocationLogsTable items={data.items} />

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
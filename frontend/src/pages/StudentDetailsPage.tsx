import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StudentCard } from '../components/student/StudentCard'
import { StudentTabs } from '../components/student/StudentTabs'
import { StudentSummaryCards } from '../components/student/StudentSummaryCards'
import { StudentMiniMap } from '../components/student/StudentMiniMap'
import { StudentHistoryFilters } from '../components/filters/StudentHistoryFilters'
import { StudentStatusHistoryTable } from '../components/tables/StudentStatusHistoryTable'
import { StudentCheckinsTable } from '../components/tables/StudentCheckinsTable'
import { useStudentDetails } from '../hooks/useStudentDetails'
import { useStudentHistory } from '../hooks/useStudentHistory'
import { useGeolocationLogs } from '../hooks/useGeolocationLogs'

function last30DaysFromToday() {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - 30)

  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  }
}

type TabKey = 'info' | 'statuses' | 'checkins'

export function StudentDetailsPage() {
  const params = useParams()
  const studentId = Number(params.studentId)

  const defaults = useMemo(() => last30DaysFromToday(), [])
  const [dateFrom, setDateFrom] = useState(defaults.from)
  const [dateTo, setDateTo] = useState(defaults.to)
  const [activeTab, setActiveTab] = useState<TabKey>('info')

  const studentQuery = useStudentDetails(studentId)
  const historyQuery = useStudentHistory(studentId, dateFrom, dateTo)
  const logsQuery = useGeolocationLogs({
    studentId,
    dateFrom,
    dateTo,
  })

  const statusItems = historyQuery.data?.items ?? []
  const logItems = logsQuery.data?.items ?? []

  return (
    <div className="page-grid">
      {studentQuery.isLoading && <div className="panel">Загрузка...</div>}
      {studentQuery.error && <div className="panel">Ошибка загрузки карточки студента</div>}
      {studentQuery.data && <StudentCard student={studentQuery.data} />}

      <StudentSummaryCards statuses={statusItems} checkins={logItems} />

      <StudentHistoryFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <StudentTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'info' && (
        <>
          {logsQuery.isLoading && <div className="panel">Загрузка карты...</div>}
          {logsQuery.error && <div className="panel">Ошибка загрузки карты студента</div>}
          {logsQuery.data && <StudentMiniMap items={logsQuery.data.items} />}
        </>
      )}

      {activeTab === 'statuses' && (
        <>
          {historyQuery.isLoading && <div className="panel">Загрузка истории статусов...</div>}
          {historyQuery.error && <div className="panel">Ошибка загрузки истории статусов</div>}
          {historyQuery.data && <StudentStatusHistoryTable items={historyQuery.data.items} />}
        </>
      )}

      {activeTab === 'checkins' && (
        <>
          {logsQuery.isLoading && <div className="panel">Загрузка истории check-in...</div>}
          {logsQuery.error && <div className="panel">Ошибка загрузки истории check-in</div>}
          {logsQuery.data && <StudentCheckinsTable items={logsQuery.data.items} />}
        </>
      )}
    </div>
  )
}
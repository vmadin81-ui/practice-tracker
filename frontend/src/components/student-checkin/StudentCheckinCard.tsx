import type { StudentCheckinMeResponse, StudentCheckinSubmitResponse } from '../../types/studentCheckin'

type Props = {
  me: StudentCheckinMeResponse
  lastResult: StudentCheckinSubmitResponse | null
  isSubmitting: boolean
  onSubmit: () => void
}

export function StudentCheckinCard({ me, lastResult, isSubmitting, onSubmit }: Props) {
  return (
    <div className="student-checkin-card">
      <h2>{me.full_name}</h2>
      <div className="student-checkin-subtitle">{me.group_name ?? '—'}</div>

      <div className="student-checkin-grid">
        <div><strong>Предприятие:</strong> {me.enterprise_name ?? '—'}</div>
        <div><strong>Адрес:</strong> {me.enterprise_address ?? '—'}</div>
        <div><strong>Период:</strong> {me.start_date ?? '—'} — {me.end_date ?? '—'}</div>
        <div><strong>Сегодня отметок:</strong> {me.today_checkins_count}</div>
        <div><strong>Требуется:</strong> {me.required_checkins_per_day ?? '—'}</div>
      </div>

      <div className="student-checkin-status">{me.status_message}</div>

      <button className="primary-btn student-checkin-btn" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Отметиться'}
      </button>

      {lastResult && (
        <div className="student-checkin-result">
          <div>
            <strong>Результат:</strong>{' '}
            <span className={`status-badge status-${lastResult.status_color}`}>
              {lastResult.status_color}
            </span>
          </div>
          <div><strong>Расстояние:</strong> {lastResult.distance_m ?? '—'}</div>
          <div><strong>Комментарий:</strong> {lastResult.comment ?? '—'}</div>
        </div>
      )}
    </div>
  )
}
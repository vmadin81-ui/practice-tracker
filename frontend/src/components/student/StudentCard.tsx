import type { StudentItem } from '../../types/students'

type Props = {
  student: StudentItem
}

export function StudentCard({ student }: Props) {
  return (
    <div className="panel">
      <div className="student-card-header">
        <div>
          <h3>{student.full_name}</h3>
          <div className="student-card-subtitle">
            ID: {student.id} · {student.is_active ? 'Активен' : 'Неактивен'}
          </div>
        </div>

        <span className={`status-badge ${student.is_active ? 'status-green' : 'status-gray'}`}>
          {student.is_active ? 'Активен' : 'Неактивен'}
        </span>
      </div>

      <div className="details-grid">
        <div><strong>Группа:</strong> {student.group?.name ?? '—'}</div>
        <div><strong>Специальность:</strong> {student.specialty?.name ?? '—'}</div>
        <div><strong>Телефон:</strong> {student.phone ?? '—'}</div>
        <div><strong>Telegram ID:</strong> {student.telegram_id ?? '—'}</div>
        <div><strong>Фамилия:</strong> {student.last_name}</div>
        <div><strong>Имя:</strong> {student.first_name}</div>
        <div><strong>Отчество:</strong> {student.middle_name ?? '—'}</div>
      </div>
    </div>
  )
}
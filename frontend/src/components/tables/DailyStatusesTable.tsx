import type { DailyStatusItem } from '../../types/dailyStatus'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: DailyStatusItem[]
}

export function DailyStatusesTable({ items }: Props) {
  return (
    <TableContainer title="Статусы студентов">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата</th>
            <th>Студент</th>
            <th>Группа</th>
            <th>Статус</th>
            <th>Check-in</th>
            <th>Требуется</th>
            <th>Комментарий</th>
            <th>Обновлено</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.status_date}</td>
              <td className="truncate-cell">
                {item.student?.full_name ?? item.student_id}
              </td>
              <td>{item.student?.group?.name ?? '—'}</td>
              <td>
                <span className={`status-badge status-${item.status_color}`}>
                  {item.status_color}
                </span>
              </td>
              <td>{item.checkins_count}</td>
              <td>{item.required_checkins_count}</td>
              <td className="truncate-cell" title={item.comment ?? ''}>
                {item.comment ?? '—'}
              </td>
              <td>{item.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}
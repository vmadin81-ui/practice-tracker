import type { StudentCheckinHistoryItem } from '../../types/studentCheckin'

type Props = {
  items: StudentCheckinHistoryItem[]
}

export function StudentCheckinHistory({ items }: Props) {
  return (
    <div className="panel">
      <h3>Последние отметки</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Дата/время</th>
            <th>Статус</th>
            <th>Расстояние</th>
            <th>Точность</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.geolocation_log_id}>
              <td>{item.sent_at}</td>
              <td>
                <span className={`status-badge status-${item.status_color ?? 'gray'}`}>
                  {item.status_color ?? '—'}
                </span>
              </td>
              <td>{item.distance_m ?? '—'}</td>
              <td>{item.accuracy_m ?? '—'}</td>
              <td>{item.comment ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
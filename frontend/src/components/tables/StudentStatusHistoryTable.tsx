import type { DailyStatusItem } from '../../types/dailyStatus'

type Props = {
  items: DailyStatusItem[]
}

export function StudentStatusHistoryTable({ items }: Props) {
  return (
    <div className="panel">
      <h3>История дневных статусов</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Статус</th>
            <th>Check-in</th>
            <th>Требуется</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.status_date}</td>
              <td>
                <span className={`status-badge status-${item.status_color}`}>
                  {item.status_color}
                </span>
              </td>
              <td>{item.checkins_count}</td>
              <td>{item.required_checkins_count}</td>
              <td>{item.comment ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
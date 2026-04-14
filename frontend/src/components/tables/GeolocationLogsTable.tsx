import type { GeolocationLogItem } from '../../types/geolocation'

type Props = {
  items: GeolocationLogItem[]
}

function shortText(value: string | null | undefined, max = 60) {
  if (!value) return '—'
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}

export function GeolocationLogsTable({ items }: Props) {
  return (
    <div className="panel">
      <h3>Журнал геолокации</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Студент</th>
            <th>Дата/время</th>
            <th>Источник</th>
            <th>Координаты</th>
            <th>Точность</th>
            <th>Статус</th>
            <th>Расстояние</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.student?.full_name ?? item.student_id}</td>
              <td>{item.sent_at}</td>
              <td>{item.source}</td>
              <td>
                {item.latitude}, {item.longitude}
              </td>
              <td>{item.accuracy_m ?? '—'}</td>
              <td>
                <span className={`status-badge status-${item.check?.check_result ?? 'gray'}`}>
                  {item.check?.check_result ?? '—'}
                </span>
              </td>
              <td>{item.check?.distance_m ?? '—'}</td>
              <td title={item.check?.comment ?? ''}>
                {shortText(item.check?.comment)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
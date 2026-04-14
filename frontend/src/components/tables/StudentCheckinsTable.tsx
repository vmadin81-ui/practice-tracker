import type { GeolocationLogItem } from '../../types/geolocation'

type Props = {
  items: GeolocationLogItem[]
}

export function StudentCheckinsTable({ items }: Props) {
  return (
    <div className="panel">
      <h3>История check-in</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Дата/время</th>
            <th>Источник</th>
            <th>Координаты</th>
            <th>Статус</th>
            <th>Точность</th>
            <th>Расстояние</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.sent_at}</td>
              <td>{item.source}</td>
              <td>
                {item.latitude}, {item.longitude}
              </td>
              <td>
                <span className={`status-badge status-${item.check?.check_result ?? 'gray'}`}>
                  {item.check?.check_result ?? '—'}
                </span>
              </td>
              <td>{item.accuracy_m ?? '—'}</td>
              <td>{item.check?.distance_m ?? '—'}</td>
              <td>{item.check?.comment ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
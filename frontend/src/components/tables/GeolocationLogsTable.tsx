import type { GeolocationLogItem } from '../../types/geolocation'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: GeolocationLogItem[]
}

function short(value: string | null | undefined, max = 70) {
  if (!value) return '—'
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}

export function GeolocationLogsTable({ items }: Props) {
  return (
    <TableContainer title="Журнал геолокации">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Студент</th>
            <th>Дата/время</th>
            <th>Источник</th>
            <th>Координаты</th>
            <th>Точность</th>
            <th>Результат</th>
            <th>Расстояние</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td className="truncate-cell">
                {item.student?.full_name ?? item.student_id}
              </td>
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
              <td className="truncate-cell" title={item.check?.comment ?? ''}>
                {short(item.check?.comment)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}
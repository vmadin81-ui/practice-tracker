import type { EnterpriseSummaryItem } from '../../types/dashboard'

type Props = {
  items: EnterpriseSummaryItem[]
}

export function EnterpriseSummaryTable({ items }: Props) {
  return (
    <div className="panel">
      <h3>По предприятиям</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Предприятие</th>
            <th>Всего студентов</th>
            <th>Отметились</th>
            <th>Green</th>
            <th>Yellow</th>
            <th>Red</th>
            <th>Gray</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.enterprise_id}-${item.enterprise_name}`}>
              <td>{item.enterprise_name}</td>
              <td>{item.counters.total}</td>
              <td>{item.counters.checked_in}</td>
              <td>{item.counters.green}</td>
              <td>{item.counters.yellow}</td>
              <td>{item.counters.red}</td>
              <td>{item.counters.gray}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
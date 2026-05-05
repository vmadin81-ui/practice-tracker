import { TableContainer } from '../ui/TableContainer'

type EnterpriseSummaryItem = {
  enterprise_id: number | null
  enterprise_name: string
  counters: {
    total: number
    checked_in: number
    green: number
    yellow: number
    red: number
    gray: number
  }
}

type Props = {
  items: EnterpriseSummaryItem[]
}

export function EnterpriseSummaryReportTable({ items }: Props) {
  return (
    <TableContainer title="Полный список предприятий">
      <table className="table">
        <thead>
          <tr>
            <th>Предприятие</th>
            <th>Всего</th>
            <th>Отметились</th>
            <th>Green</th>
            <th>Yellow</th>
            <th>Red</th>
            <th>Gray</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.enterprise_id ?? item.enterprise_name}>
              <td className="truncate-cell">{item.enterprise_name}</td>
              <td>{item.counters.total}</td>
              <td>{item.counters.checked_in}</td>
              <td>
                <span className="status-badge status-green">
                  {item.counters.green}
                </span>
              </td>
              <td>
                <span className="status-badge status-yellow">
                  {item.counters.yellow}
                </span>
              </td>
              <td>
                <span className="status-badge status-red">
                  {item.counters.red}
                </span>
              </td>
              <td>
                <span className="status-badge status-gray">
                  {item.counters.gray}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}
export function EnterpriseAnalyticsTable({ items }: { items: any[] }) {
  return (
    <TableContainer title="Предприятия">
      <table className="table">
        <thead>
          <tr>
            <th>Предприятие</th>
            <th>Всего</th>
            <th>Green</th>
            <th>Yellow</th>
            <th>Red</th>
            <th>Gray</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.enterprise_id}>
              <td>{i.enterprise_name}</td>
              <td>{i.counters.total}</td>
              <td className="status-green">{i.counters.green}</td>
              <td className="status-yellow">{i.counters.yellow}</td>
              <td className="status-red">{i.counters.red}</td>
              <td className="status-gray">{i.counters.gray}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}
import type { EnterpriseItem } from '../../types/enterprises'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: EnterpriseItem[]
  onEdit: (item: EnterpriseItem) => void
}

export function EnterprisesTable({ items, onEdit }: Props) {
  return (
    <TableContainer title="Список предприятий">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Адрес</th>
            <th>Контактное лицо</th>
            <th>Телефон</th>
            <th>Радиус</th>
            <th>Активно</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td className="truncate-cell">{item.name}</td>
              <td className="truncate-cell">{item.address ?? '—'}</td>
              <td className="truncate-cell">{item.contact_person ?? '—'}</td>
              <td>{item.contact_phone ?? '—'}</td>
              <td>{item.allowed_radius_m} м</td>
              <td>{item.is_active ? 'Да' : 'Нет'}</td>
              <td>
                <button className="secondary-btn" onClick={() => onEdit(item)}>
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}
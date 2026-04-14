import type { EnterpriseItem } from '../../types/enterprises'

type Props = {
  items: EnterpriseItem[]
  onEdit: (item: EnterpriseItem) => void
}

export function EnterprisesTable({ items, onEdit }: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Адрес</th>
            <th>Радиус</th>
            <th>Активно</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.address ?? '—'}</td>
              <td>{item.allowed_radius_m}</td>
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
    </div>
  )
}
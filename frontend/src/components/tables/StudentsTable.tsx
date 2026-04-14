import { Link } from 'react-router-dom'
import type { StudentItem } from '../../types/students'

type Props = {
  items: StudentItem[]
  onEdit: (item: StudentItem) => void
}

export function StudentsTable({ items, onEdit }: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Группа</th>
            <th>Телефон</th>
            <th>Активен</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <Link className="table-link" to={`/students/${item.id}`}>
                  {item.full_name}
                </Link>
              </td>
              <td>{item.group?.name ?? item.group_id ?? '—'}</td>
              <td>{item.phone ?? '—'}</td>
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
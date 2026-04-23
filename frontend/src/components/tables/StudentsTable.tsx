import { Link } from 'react-router-dom'
import type { StudentItem } from '../../types/students'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: StudentItem[]
  onEdit: (item: StudentItem) => void
}

export function StudentsTable({ items, onEdit }: Props) {
  return (
    <TableContainer title="Список студентов">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ФИО</th>
            <th>Группа</th>
            <th>Специальность</th>
            <th>Телефон</th>
            <th>Активен</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td className="truncate-cell">
                <Link className="table-link" to={`/students/${item.id}`}>
                  {item.full_name}
                </Link>
              </td>
              <td>{item.group?.name ?? '—'}</td>
              <td className="truncate-cell">{item.specialty?.name ?? '—'}</td>
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
    </TableContainer>
  )
}
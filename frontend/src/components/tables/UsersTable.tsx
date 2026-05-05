import type { UserItem } from '../../types/auth'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: UserItem[]
  onEdit: (item: UserItem) => void
}

export function UsersTable({ items, onEdit }: Props) {
  return (
    <TableContainer title="Список пользователей">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>ФИО</th>
            <th>Роль</th>
            <th>Активен</th>
            <th>Группы доступа</th>
            <th>Создан</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td className="truncate-cell">{item.username}</td>
              <td className="truncate-cell">{item.full_name ?? '—'}</td>
              <td>
                <span className="role-badge">{item.role}</span>
              </td>
              <td>{item.is_active ? 'Да' : 'Нет'}</td>
              <td className="truncate-cell">
                {item.groups?.length ? item.groups.map((group) => group.name).join(', ') : '—'}
              </td>
              <td>{item.created_at}</td>
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
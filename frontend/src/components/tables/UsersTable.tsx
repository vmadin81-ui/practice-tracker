import type { UserItem } from '../../types/auth'

type Props = {
  items: UserItem[]
}

export function UsersTable({ items }: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>ФИО</th>
            <th>Роль</th>
            <th>Активен</th>
            <th>Группы</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.username}</td>
              <td>{item.full_name ?? '—'}</td>
              <td>{item.role}</td>
              <td>{item.is_active ? 'Да' : 'Нет'}</td>
              <td>{item.group_ids.length ? item.group_ids.join(', ') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
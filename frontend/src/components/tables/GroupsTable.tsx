import type { GroupItem } from '../../types/groups'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: GroupItem[]
  onEdit: (item: GroupItem) => void
}

export function GroupsTable({ items, onEdit }: Props) {
  return (
    <TableContainer title="Список групп">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Группа</th>
            <th>Курс</th>
            <th>Специальность</th>
            <th>Создана</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td className="truncate-cell">{item.name}</td>
              <td>{item.course ?? '—'}</td>
              <td className="truncate-cell">{item.specialty?.name ?? '—'}</td>
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
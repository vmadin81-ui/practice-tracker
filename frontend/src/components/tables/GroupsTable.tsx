import type { GroupItem } from '../../types/groups'

type Props = {
  items: GroupItem[]
  onEdit: (item: GroupItem) => void
}

export function GroupsTable({ items, onEdit }: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Группа</th>
            <th>Курс</th>
            <th>Specialty</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.course ?? '—'}</td>
              <td>{item.specialty?.name ?? item.specialty_id ?? '—'}</td>
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
import type { SpecialtyItem } from '../../types/specialties'

type Props = {
  items: SpecialtyItem[]
  onEdit: (item: SpecialtyItem) => void
}

export function SpecialtiesTable({ items, onEdit }: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Код</th>
            <th>Наименование</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.code ?? '—'}</td>
              <td>{item.name}</td>
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
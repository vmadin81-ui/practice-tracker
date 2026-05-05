import type { SpecialtyItem } from '../../types/specialties'
import { TableContainer } from '../ui/TableContainer'

type Props = {
  items: SpecialtyItem[]
  onEdit: (item: SpecialtyItem) => void
}

export function SpecialtiesTable({ items, onEdit }: Props) {
  return (
    <TableContainer title="Список специальностей">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Код</th>
            <th>Название</th>
            <th>Создана</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.code ?? '—'}</td>
              <td className="truncate-cell">{item.name}</td>
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
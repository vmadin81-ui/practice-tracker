import type { SpecialtyItem } from '../../types/specialties'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  specialtyId: string
  onSpecialtyIdChange: (value: string) => void
  specialties: SpecialtyItem[]
}

export function GroupsFilters({
  search,
  onSearchChange,
  specialtyId,
  onSpecialtyIdChange,
  specialties,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-2">
        <label>
          Поиск
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Название группы"
          />
        </label>

        <label>
          Специальность
          <select value={specialtyId} onChange={(e) => onSpecialtyIdChange(e.target.value)}>
            <option value="">Все</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={String(specialty.id)}>
                {specialty.code ? `${specialty.code} — ${specialty.name}` : specialty.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
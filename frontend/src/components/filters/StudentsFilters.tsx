import type { GroupItem } from '../../types/groups'
import type { SpecialtyItem } from '../../types/specialties'

type Props = {
  search: string
  onSearchChange: (value: string) => void
  groupId: string
  onGroupIdChange: (value: string) => void
  specialtyId: string
  onSpecialtyIdChange: (value: string) => void
  isActive: string
  onIsActiveChange: (value: string) => void
  groups: GroupItem[]
  specialties: SpecialtyItem[]
}

export function StudentsFilters({
  search,
  onSearchChange,
  groupId,
  onGroupIdChange,
  specialtyId,
  onSpecialtyIdChange,
  isActive,
  onIsActiveChange,
  groups,
  specialties,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-4">
        <label>
          Поиск
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ФИО или телефон"
          />
        </label>

        <label>
          Группа
          <select value={groupId} onChange={(e) => onGroupIdChange(e.target.value)}>
            <option value="">Все</option>
            {groups.map((group) => (
              <option key={group.id} value={String(group.id)}>
                {group.name}
              </option>
            ))}
          </select>
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

        <label>
          Активность
          <select value={isActive} onChange={(e) => onIsActiveChange(e.target.value)}>
            <option value="">Все</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>
        </label>
      </div>
    </div>
  )
}
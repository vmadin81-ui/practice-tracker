type Props = {
  search: string
  onSearchChange: (value: string) => void
  isActive: string
  onIsActiveChange: (value: string) => void
}

export function EnterprisesFilters({
  search,
  onSearchChange,
  isActive,
  onIsActiveChange,
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
            placeholder="Название, адрес, контакт"
          />
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
type Props = {
  search: string
  onSearchChange: (value: string) => void
}

export function SpecialtiesFilters({ search, onSearchChange }: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-1">
        <label>
          Поиск
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Код или название специальности"
          />
        </label>
      </div>
    </div>
  )
}
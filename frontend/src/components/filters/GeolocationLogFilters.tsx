type Props = {
  dateFrom: string
  dateTo: string
  source: string
  search: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onSourceChange: (value: string) => void
  onSearchChange: (value: string) => void
}

export function GeolocationLogFilters({
  dateFrom,
  dateTo,
  source,
  search,
  onDateFromChange,
  onDateToChange,
  onSourceChange,
  onSearchChange,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-4">
        <label>
          С даты
          <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
        </label>

        <label>
          По дату
          <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
        </label>

        <label>
          Источник
          <select value={source} onChange={(e) => onSourceChange(e.target.value)}>
            <option value="">Все</option>
            <option value="web">web</option>
            <option value="telegram">telegram</option>
            <option value="mobile">mobile</option>
          </select>
        </label>

        <label>
          Поиск по ФИО
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Введите имя"
          />
        </label>
      </div>
    </div>
  )
}
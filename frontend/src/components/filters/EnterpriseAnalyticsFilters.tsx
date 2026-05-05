type Props = {
  statusDate: string
  onStatusDateChange: (v: string) => void
  search: string
  onSearchChange: (v: string) => void
  hasIssues: string
  onHasIssuesChange: (v: string) => void
  sort: string
  onSortChange: (v: string) => void
}

export function EnterpriseAnalyticsFilters({
  statusDate,
  onStatusDateChange,
  search,
  onSearchChange,
  hasIssues,
  onHasIssuesChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-4">
        <label>
          Дата
          <input type="date" value={statusDate} onChange={(e) => onStatusDateChange(e.target.value)} />
        </label>

        <label>
          Поиск
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </label>

        <label>
          Проблемные
          <select value={hasIssues} onChange={(e) => onHasIssuesChange(e.target.value)}>
            <option value="">Все</option>
            <option value="true">Есть проблемы</option>
            <option value="false">Без проблем</option>
          </select>
        </label>

        <label>
          Сортировка
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="total">По количеству</option>
            <option value="red">По red</option>
            <option value="yellow">По yellow</option>
          </select>
        </label>
      </div>
    </div>
  )
}
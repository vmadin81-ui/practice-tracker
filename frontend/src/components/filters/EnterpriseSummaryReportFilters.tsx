type Props = {
  statusDate: string
  onStatusDateChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
  onlyProblems: boolean
  onOnlyProblemsChange: (value: boolean) => void
  sortBy: string
  onSortByChange: (value: string) => void
}

export function EnterpriseSummaryReportFilters({
  statusDate,
  onStatusDateChange,
  search,
  onSearchChange,
  onlyProblems,
  onOnlyProblemsChange,
  sortBy,
  onSortByChange,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-4">
        <label>
          Дата
          <input
            type="date"
            value={statusDate}
            onChange={(e) => onStatusDateChange(e.target.value)}
          />
        </label>

        <label>
          Поиск
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Название предприятия"
          />
        </label>

        <label>
          Сортировка
          <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
            <option value="total_desc">Всего студентов ↓</option>
            <option value="red_desc">Red ↓</option>
            <option value="yellow_desc">Yellow ↓</option>
            <option value="green_desc">Green ↓</option>
            <option value="name_asc">Название А–Я</option>
          </select>
        </label>

        <label className="checkbox-row enterprise-report-checkbox">
          <input
            type="checkbox"
            checked={onlyProblems}
            onChange={(e) => onOnlyProblemsChange(e.target.checked)}
          />
          Только проблемные
        </label>
      </div>
    </div>
  )
}
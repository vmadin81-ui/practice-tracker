type Props = {
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function StudentHistoryFilters({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-compact">
        <label>
          С даты
          <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
        </label>

        <label>
          По дату
          <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
        </label>
      </div>
    </div>
  )
}
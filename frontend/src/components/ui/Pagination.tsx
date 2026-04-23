type Props = {
  skip: number
  limit: number
  total: number
  onChange: (newSkip: number) => void
}

export function Pagination({ skip, limit, total, onChange }: Props) {
  const currentPage = Math.floor(skip / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className="pagination">
      <button
        className="secondary-btn"
        disabled={!canGoPrev}
        onClick={() => onChange(Math.max(0, skip - limit))}
      >
        ← Назад
      </button>

      <div className="pagination-info">
        Страница {currentPage} из {totalPages} · Всего: {total}
      </div>

      <button
        className="secondary-btn"
        disabled={!canGoNext}
        onClick={() => onChange(skip + limit)}
      >
        Вперёд →
      </button>
    </div>
  )
}
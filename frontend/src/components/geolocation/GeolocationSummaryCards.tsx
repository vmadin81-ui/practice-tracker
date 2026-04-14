import type { GeolocationLogItem } from '../../types/geolocation'

type Props = {
  items: GeolocationLogItem[]
}

function countByStatus(items: GeolocationLogItem[], color: string) {
  return items.filter((item) => item.check?.check_result === color).length
}

export function GeolocationSummaryCards({ items }: Props) {
  return (
    <div className="stats-grid stats-grid-compact">
      <div className="stat-card">
        <div className="stat-card-title">Всего логов</div>
        <div className="stat-card-value">{items.length}</div>
      </div>

      <div className="stat-card stat-card-green">
        <div className="stat-card-title">Green</div>
        <div className="stat-card-value">{countByStatus(items, 'green')}</div>
      </div>

      <div className="stat-card stat-card-yellow">
        <div className="stat-card-title">Yellow</div>
        <div className="stat-card-value">{countByStatus(items, 'yellow')}</div>
      </div>

      <div className="stat-card stat-card-red">
        <div className="stat-card-title">Red</div>
        <div className="stat-card-value">{countByStatus(items, 'red')}</div>
      </div>

      <div className="stat-card stat-card-gray">
        <div className="stat-card-title">Gray</div>
        <div className="stat-card-value">{countByStatus(items, 'gray')}</div>
      </div>
    </div>
  )
}
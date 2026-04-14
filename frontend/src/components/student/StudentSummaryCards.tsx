import type { DailyStatusItem } from '../../types/dailyStatus'
import type { GeolocationLogItem } from '../../types/geolocation'

type Props = {
  statuses: DailyStatusItem[]
  checkins: GeolocationLogItem[]
}

function countStatuses(statuses: DailyStatusItem[], color: string) {
  return statuses.filter((item) => item.status_color === color).length
}

export function StudentSummaryCards({ statuses, checkins }: Props) {
  return (
    <div className="stats-grid stats-grid-compact">
      <div className="stat-card">
        <div className="stat-card-title">Всего статусов</div>
        <div className="stat-card-value">{statuses.length}</div>
      </div>

      <div className="stat-card stat-card-green">
        <div className="stat-card-title">Green</div>
        <div className="stat-card-value">{countStatuses(statuses, 'green')}</div>
      </div>

      <div className="stat-card stat-card-yellow">
        <div className="stat-card-title">Yellow</div>
        <div className="stat-card-value">{countStatuses(statuses, 'yellow')}</div>
      </div>

      <div className="stat-card stat-card-red">
        <div className="stat-card-title">Red</div>
        <div className="stat-card-value">{countStatuses(statuses, 'red')}</div>
      </div>

      <div className="stat-card stat-card-gray">
        <div className="stat-card-title">Gray</div>
        <div className="stat-card-value">{countStatuses(statuses, 'gray')}</div>
      </div>

      <div className="stat-card">
        <div className="stat-card-title">Всего check-in</div>
        <div className="stat-card-value">{checkins.length}</div>
      </div>
    </div>
  )
}
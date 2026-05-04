import type { EnterpriseItem } from '../../types/enterprises'
import type { GroupItem } from '../../types/groups'

type Props = {
  statusDate: string
  onStatusDateChange: (value: string) => void
  groupId: string
  onGroupIdChange: (value: string) => void
  enterpriseId: string
  onEnterpriseIdChange: (value: string) => void
  statusColor: string
  onStatusColorChange: (value: string) => void
  groups: GroupItem[]
  enterprises: EnterpriseItem[]
}

export function DailyStatusesFilters({
  statusDate,
  onStatusDateChange,
  groupId,
  onGroupIdChange,
  enterpriseId,
  onEnterpriseIdChange,
  statusColor,
  onStatusColorChange,
  groups,
  enterprises,
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
          Предприятие
          <select value={enterpriseId} onChange={(e) => onEnterpriseIdChange(e.target.value)}>
            <option value="">Все</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={String(enterprise.id)}>
                {enterprise.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Статус
          <select value={statusColor} onChange={(e) => onStatusColorChange(e.target.value)}>
            <option value="">Все</option>
            <option value="green">green</option>
            <option value="yellow">yellow</option>
            <option value="red">red</option>
            <option value="gray">gray</option>
          </select>
        </label>
      </div>
    </div>
  )
}
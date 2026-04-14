import type { EnterpriseItem, GroupItem } from '../../types/common'

type Props = {
  statusDate: string
  onStatusDateChange: (value: string) => void
  statusColor: string
  onStatusColorChange: (value: string) => void
  groupId: string
  onGroupIdChange: (value: string) => void
  enterpriseId: string
  onEnterpriseIdChange: (value: string) => void
  groups: GroupItem[]
  enterprises: EnterpriseItem[]
  onRecalculate?: () => void
  isRecalculating?: boolean
}

export function FilterBar({
  statusDate,
  onStatusDateChange,
  statusColor,
  onStatusColorChange,
  groupId,
  onGroupIdChange,
  enterpriseId,
  onEnterpriseIdChange,
  groups,
  enterprises,
  onRecalculate,
  isRecalculating,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid">
        <label>
          Дата
          <input type="date" value={statusDate} onChange={(e) => onStatusDateChange(e.target.value)} />
        </label>

        <label>
          Статус
          <select value={statusColor} onChange={(e) => onStatusColorChange(e.target.value)}>
            <option value="">Все</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="red">Red</option>
            <option value="gray">Gray</option>
          </select>
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

        {onRecalculate && (
          <div className="filters-actions">
            <button className="primary-btn" onClick={onRecalculate} disabled={isRecalculating}>
              {isRecalculating ? 'Пересчет...' : 'Пересчитать статусы'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
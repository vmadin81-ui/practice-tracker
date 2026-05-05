type Props = {
  search: string
  onSearchChange: (value: string) => void
  role: string
  onRoleChange: (value: string) => void
  isActive: string
  onIsActiveChange: (value: string) => void
}

export function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  isActive,
  onIsActiveChange,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-3">
        <label>
          Поиск
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Логин или ФИО"
          />
        </label>

        <label>
          Роль
          <select value={role} onChange={(e) => onRoleChange(e.target.value)}>
            <option value="">Все</option>
            <option value="admin">admin</option>
            <option value="practice_supervisor">practice_supervisor</option>
            <option value="viewer">viewer</option>
          </select>
        </label>

        <label>
          Активность
          <select value={isActive} onChange={(e) => onIsActiveChange(e.target.value)}>
            <option value="">Все</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>
        </label>
      </div>
    </div>
  )
}
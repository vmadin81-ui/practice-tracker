import { useState } from 'react'
import type { GroupItem } from '../../types/groups'
import type { UserCreatePayload, UserItem, UserRole } from '../../types/auth'

type Props = {
  groups: GroupItem[]
  onSubmit: (payload: UserCreatePayload) => Promise<void> | void
}

export function UserForm({ groups, onSubmit }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('viewer')
  const [isActive, setIsActive] = useState(true)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          username,
          password,
          full_name: fullName || null,
          role,
          is_active: isActive,
          group_ids: selectedGroupIds.map(Number),
        })
      }}
    >
      <label>
        Логин
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>

      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <label>
        ФИО
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </label>

      <label>
        Роль
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="admin">admin</option>
          <option value="practice_supervisor">practice_supervisor</option>
          <option value="viewer">viewer</option>
        </select>
      </label>

      {role === 'practice_supervisor' && (
        <div>
          <div className="form-section-title">Назначенные группы</div>
          <div className="checkbox-list">
            {groups.map((group) => (
              <label key={group.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedGroupIds.includes(String(group.id))}
                  onChange={() => toggleGroup(String(group.id))}
                />
                {group.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Активен
      </label>

      <button className="primary-btn" type="submit">
        Сохранить
      </button>
    </form>
  )
}
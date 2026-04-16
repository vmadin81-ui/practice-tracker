import { useState } from 'react'
import type { GroupItem } from '../../types/groups'
import type { UserCreatePayload, UserItem, UserRole } from '../../types/auth'

type Props = {
  groups: GroupItem[]
  initialValue?: UserItem | null
  onSubmit: (
    payload: Partial<UserCreatePayload> & { password?: string | null }
  ) => Promise<void> | void
}

export function UserForm({ groups, initialValue, onSubmit }: Props) {
  const [username] = useState(initialValue?.username ?? '')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState(initialValue?.full_name ?? '')
  const [role, setRole] = useState<UserRole>(initialValue?.role ?? 'viewer')
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    initialValue?.group_ids?.map(String) ?? []
  )

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

        const payload: Partial<UserCreatePayload> & { password?: string | null } = {
          full_name: fullName || null,
          role,
          is_active: isActive,
          group_ids: selectedGroupIds.map(Number),
        }

        if (!initialValue) {
          payload.username = username
          payload.password = password
        } else if (password.trim()) {
          payload.password = password
        }

        await onSubmit(payload)
      }}
    >
      <label>
        Логин
        <input value={username} disabled />
      </label>

      <label>
        Новый пароль {initialValue ? '(необязательно)' : ''}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!initialValue}
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
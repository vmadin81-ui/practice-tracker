import { useState } from 'react'
import type { GroupItem } from '../../types/groups'
import type { SpecialtyItem } from '../../types/specialties'
import type { StudentCreatePayload, StudentItem } from '../../types/students'

type Props = {
  groups: GroupItem[]
  specialties: SpecialtyItem[]
  initialValue?: StudentItem | null
  onSubmit: (payload: StudentCreatePayload) => Promise<void> | void
}

export function StudentForm({
  groups,
  specialties,
  initialValue,
  onSubmit,
}: Props) {
  const [lastName, setLastName] = useState(initialValue?.last_name ?? '')
  const [firstName, setFirstName] = useState(initialValue?.first_name ?? '')
  const [middleName, setMiddleName] = useState(initialValue?.middle_name ?? '')
  const [phone, setPhone] = useState(initialValue?.phone ?? '')
  const [telegramId, setTelegramId] = useState(initialValue?.telegram_id ?? '')
  const [groupId, setGroupId] = useState(initialValue?.group_id?.toString() ?? '')
  const [specialtyId, setSpecialtyId] = useState(
    initialValue?.specialty_id?.toString() ?? ''
  )
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          last_name: lastName,
          first_name: firstName,
          middle_name: middleName || null,
          phone: phone || null,
          telegram_id: telegramId || null,
          group_id: groupId ? Number(groupId) : null,
          specialty_id: specialtyId ? Number(specialtyId) : null,
          is_active: isActive,
        })
      }}
    >
      <label>
        Фамилия
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </label>

      <label>
        Имя
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </label>

      <label>
        Отчество
        <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
      </label>

      <label>
        Телефон
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>

      <label>
        Telegram ID
        <input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} />
      </label>

      <label>
        Группа
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Не выбрано</option>
          {groups.map((group) => (
            <option key={group.id} value={String(group.id)}>
              {group.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Специальность
        <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
          <option value="">Не выбрано</option>
          {specialties.map((specialty) => (
            <option key={specialty.id} value={String(specialty.id)}>
              {specialty.code ? `${specialty.code} — ${specialty.name}` : specialty.name}
            </option>
          ))}
        </select>
      </label>

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
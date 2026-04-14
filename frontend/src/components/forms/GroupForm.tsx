import { useState } from 'react'
import type { GroupCreatePayload, GroupItem } from '../../types/groups'
import type { SpecialtyItem } from '../../types/specialties'

type Props = {
  specialties: SpecialtyItem[]
  initialValue?: GroupItem | null
  onSubmit: (payload: GroupCreatePayload) => Promise<void> | void
}

export function GroupForm({ specialties, initialValue, onSubmit }: Props) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [course, setCourse] = useState(initialValue?.course?.toString() ?? '')
  const [specialtyId, setSpecialtyId] = useState(
    initialValue?.specialty_id?.toString() ?? ''
  )

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          name,
          course: course ? Number(course) : null,
          specialty_id: specialtyId ? Number(specialtyId) : null,
        })
      }}
    >
      <label>
        Название группы
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Курс
        <input
          type="number"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
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

      <button className="primary-btn" type="submit">
        Сохранить
      </button>
    </form>
  )
}
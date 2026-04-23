import { useState } from 'react'
import type { StudentItem } from '../../types/students'
import type { StudentAccessLinkCreatePayload } from '../../types/studentAccessLink'

type Props = {
  students: StudentItem[]
  onSubmit: (payload: StudentAccessLinkCreatePayload) => Promise<void> | void
}

export function StudentAccessLinkForm({ students, onSubmit }: Props) {
  const [studentId, setStudentId] = useState('')
  const [label, setLabel] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          student_id: Number(studentId),
          label: label || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          channel: 'web',
        })
      }}
    >
      <label>
        Студент
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
          <option value="">Выберите</option>
          {students.map((student) => (
            <option key={student.id} value={String(student.id)}>
              {student.full_name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Метка ссылки
        <input value={label} onChange={(e) => setLabel(e.target.value)} />
      </label>

      <label>
        Истекает
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </label>

      <button className="primary-btn" type="submit">
        Создать ссылку
      </button>
    </form>
  )
}
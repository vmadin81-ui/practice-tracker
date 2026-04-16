import { useState } from 'react'
import type { UserItem } from '../../types/auth'
import type { EnterpriseItem } from '../../types/enterprises'
import type {
  PracticeAssignmentCreatePayload,
  PracticeAssignmentItem,
} from '../../types/practiceAssignments'
import type { StudentItem } from '../../types/students'

type Props = {
  students: StudentItem[]
  enterprises: EnterpriseItem[]
  supervisors: UserItem[]
  initialValue?: PracticeAssignmentItem | null
  onSubmit: (payload: PracticeAssignmentCreatePayload) => Promise<void> | void
}

export function PracticeAssignmentForm({
  students,
  enterprises,
  supervisors,
  initialValue,
  onSubmit,
}: Props) {
  const [studentId, setStudentId] = useState(initialValue?.student_id?.toString() ?? '')
  const [enterpriseId, setEnterpriseId] = useState(
    initialValue?.enterprise_id?.toString() ?? ''
  )
  const [supervisorUserId, setSupervisorUserId] = useState(
    initialValue?.supervisor_user_id?.toString() ?? ''
  )
  const [startDate, setStartDate] = useState(initialValue?.start_date ?? '')
  const [endDate, setEndDate] = useState(initialValue?.end_date ?? '')
  const [monitoringMode, setMonitoringMode] = useState(
    initialValue?.monitoring_mode ?? 'daily_once'
  )
  const [requiredCheckins, setRequiredCheckins] = useState(
    String(initialValue?.required_checkins_per_day ?? 1)
  )
  const [allowedStartTime, setAllowedStartTime] = useState(
    initialValue?.allowed_start_time ?? ''
  )
  const [allowedEndTime, setAllowedEndTime] = useState(
    initialValue?.allowed_end_time ?? ''
  )
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          student_id: Number(studentId),
          enterprise_id: Number(enterpriseId),
          supervisor_user_id: supervisorUserId ? Number(supervisorUserId) : null,
          start_date: startDate,
          end_date: endDate,
          supervisor_name: null,
          supervisor_phone: null,
          monitoring_mode: monitoringMode,
          required_checkins_per_day: Number(requiredCheckins),
          allowed_start_time: allowedStartTime || null,
          allowed_end_time: allowedEndTime || null,
          is_active: isActive,
          schedule_json: null,
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
        Предприятие
        <select
          value={enterpriseId}
          onChange={(e) => setEnterpriseId(e.target.value)}
          required
        >
          <option value="">Выберите</option>
          {enterprises.map((enterprise) => (
            <option key={enterprise.id} value={String(enterprise.id)}>
              {enterprise.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Руководитель практики
        <select
          value={supervisorUserId}
          onChange={(e) => setSupervisorUserId(e.target.value)}
        >
          <option value="">Не выбрано</option>
          {supervisors.map((supervisor) => (
            <option key={supervisor.id} value={String(supervisor.id)}>
              {supervisor.full_name ?? supervisor.username}
            </option>
          ))}
        </select>
      </label>

      <label>
        Дата начала
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </label>

      <label>
        Дата окончания
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </label>

      <label>
        Режим мониторинга
        <select
          value={monitoringMode}
          onChange={(e) => setMonitoringMode(e.target.value)}
        >
          <option value="daily_once">daily_once</option>
          <option value="daily_multiple">daily_multiple</option>
          <option value="manual">manual</option>
          <option value="disabled">disabled</option>
        </select>
      </label>

      <label>
        Требуемых check-in в день
        <input
          type="number"
          value={requiredCheckins}
          onChange={(e) => setRequiredCheckins(e.target.value)}
        />
      </label>

      <label>
        Разрешенное время с
        <input
          type="time"
          value={allowedStartTime}
          onChange={(e) => setAllowedStartTime(e.target.value)}
        />
      </label>

      <label>
        Разрешенное время до
        <input
          type="time"
          value={allowedEndTime}
          onChange={(e) => setAllowedEndTime(e.target.value)}
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Активно
      </label>

      <button className="primary-btn" type="submit">
        Сохранить
      </button>
    </form>
  )
}
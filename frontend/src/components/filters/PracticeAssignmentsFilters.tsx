import type { EnterpriseItem } from '../../types/enterprises'
import type { StudentItem } from '../../types/students'

type Props = {
  studentId: string
  onStudentIdChange: (value: string) => void
  enterpriseId: string
  onEnterpriseIdChange: (value: string) => void
  isActive: string
  onIsActiveChange: (value: string) => void
  students: StudentItem[]
  enterprises: EnterpriseItem[]
}

export function PracticeAssignmentsFilters({
  studentId,
  onStudentIdChange,
  enterpriseId,
  onEnterpriseIdChange,
  isActive,
  onIsActiveChange,
  students,
  enterprises,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-3">
        <label>
          Студент
          <select value={studentId} onChange={(e) => onStudentIdChange(e.target.value)}>
            <option value="">Все</option>
            {students.map((student) => (
              <option key={student.id} value={String(student.id)}>
                {student.full_name}
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
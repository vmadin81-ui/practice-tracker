import type { StudentItem } from '../../types/students'

type Props = {
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  studentId: string
  onStudentIdChange: (value: string) => void
  source: string
  onSourceChange: (value: string) => void
  checkResult: string
  onCheckResultChange: (value: string) => void
  students: StudentItem[]
}

export function GeolocationLogsFilters({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  studentId,
  onStudentIdChange,
  source,
  onSourceChange,
  checkResult,
  onCheckResultChange,
  students,
}: Props) {
  return (
    <div className="filters-panel">
      <div className="filters-grid filters-grid-5">
        <label>
          С даты
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </label>

        <label>
          По дату
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </label>

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
          Источник
          <select value={source} onChange={(e) => onSourceChange(e.target.value)}>
            <option value="">Все</option>
            <option value="student_web">student_web</option>
            <option value="web">web</option>
            <option value="telegram">telegram</option>
            <option value="mobile">mobile</option>
          </select>
        </label>

        <label>
          Результат
          <select
            value={checkResult}
            onChange={(e) => onCheckResultChange(e.target.value)}
          >
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
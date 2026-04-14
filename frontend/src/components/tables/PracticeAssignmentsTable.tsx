import type { PracticeAssignmentItem } from '../../types/practiceAssignments'

type Props = {
  items: PracticeAssignmentItem[]
  onEdit: (item: PracticeAssignmentItem) => void
}

export function PracticeAssignmentsTable({ items, onEdit }: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Студент</th>
            <th>Предприятие</th>
            <th>Период</th>
            <th>Check-in/день</th>
            <th>Активно</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.student?.full_name ?? item.student_id}</td>
              <td>{item.enterprise?.name ?? item.enterprise_id}</td>
              <td>
                {item.start_date} — {item.end_date}
              </td>
              <td>{item.required_checkins_per_day}</td>
              <td>{item.is_active ? 'Да' : 'Нет'}</td>
              <td>
                <button className="secondary-btn" onClick={() => onEdit(item)}>
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
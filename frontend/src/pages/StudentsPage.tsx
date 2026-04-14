import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { StudentsTable } from '../components/tables/StudentsTable'
import { StudentForm } from '../components/forms/StudentForm'
import { useStudents } from '../hooks/useStudents'
import { useGroups } from '../hooks/useGroups'
import { useSpecialties } from '../hooks/useSpecialties'
import { useCreateStudent, useUpdateStudent } from '../hooks/useStudentMutations'
import type { StudentItem } from '../types/students'

export function StudentsPage() {
  const { data, isLoading, error } = useStudents()
  const groupsQuery = useGroups()
  const specialtiesQuery = useSpecialties()
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<StudentItem | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Студенты"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки студентов</div>}
      {data && (
        <StudentsTable
          items={data.items}
          onEdit={(item) => {
            setEditing(item)
            setIsOpen(true)
          }}
        />
      )}

      {isOpen && (
        <Modal
          title={editing ? 'Редактировать студента' : 'Добавить студента'}
          onClose={() => setIsOpen(false)}
        >
          <StudentForm
            groups={groupsQuery.data?.items ?? []}
            specialties={specialtiesQuery.data?.items ?? []}
            initialValue={editing}
            onSubmit={async (payload) => {
              if (editing) {
                await updateMutation.mutateAsync({ id: editing.id, payload })
              } else {
                await createMutation.mutateAsync(payload)
              }
              setIsOpen(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
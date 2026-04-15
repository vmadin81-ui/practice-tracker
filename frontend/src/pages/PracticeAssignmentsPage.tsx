import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { PracticeAssignmentsTable } from '../components/tables/PracticeAssignmentsTable'
import { PracticeAssignmentForm } from '../components/forms/PracticeAssignmentForm'
import { usePracticeAssignments } from '../hooks/usePracticeAssignments'
import { useStudents } from '../hooks/useStudents'
import { useEnterprises } from '../hooks/useEnterprises'
import { useUsers } from '../hooks/useUsers'
import {
  useCreatePracticeAssignment,
  useUpdatePracticeAssignment,
} from '../hooks/usePracticeAssignmentMutations'
import type { PracticeAssignmentItem } from '../types/practiceAssignments'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function PracticeAssignmentsPage() {
  const { data, isLoading, error } = usePracticeAssignments()
  const studentsQuery = useStudents()
  const enterprisesQuery = useEnterprises()
  const supervisorsQuery = useUsers('practice_supervisor')
  const createMutation = useCreatePracticeAssignment()
  const updateMutation = useUpdatePracticeAssignment()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<PracticeAssignmentItem | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Назначения практики"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки назначений</div>}
      {data && (
        <PracticeAssignmentsTable
          items={data.items}
          onEdit={(item) => {
            setEditing(item)
            setIsOpen(true)
          }}
        />
      )}

      {isOpen && (
        <Modal
          title={editing ? 'Редактировать назначение' : 'Добавить назначение'}
          onClose={() => setIsOpen(false)}
        >
          <PracticeAssignmentForm
            students={studentsQuery.data?.items ?? []}
            enterprises={enterprisesQuery.data?.items ?? []}
            supervisors={supervisorsQuery.data ?? []}
            initialValue={editing}
            onSubmit={async (payload) => {
              try {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload })
                  toast.success('Назначение обновлено')
                } else {
                  await createMutation.mutateAsync(payload)
                  toast.success('Назначение добавлено')
                }
                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось сохранить назначение', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
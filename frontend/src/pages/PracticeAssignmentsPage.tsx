import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { PracticeAssignmentsTable } from '../components/tables/PracticeAssignmentsTable'
import { PracticeAssignmentForm } from '../components/forms/PracticeAssignmentForm'
import { PracticeAssignmentsFilters } from '../components/filters/PracticeAssignmentsFilters'
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

const PAGE_SIZE = 20

export function PracticeAssignmentsPage() {
  const toast = useToast()

  const [skip, setSkip] = useState(0)
  const [studentId, setStudentId] = useState('')
  const [enterpriseId, setEnterpriseId] = useState('')
  const [isActive, setIsActive] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<PracticeAssignmentItem | null>(null)

  const params = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      studentId: studentId ? Number(studentId) : undefined,
      enterpriseId: enterpriseId ? Number(enterpriseId) : undefined,
      isActive:
        isActive === ''
          ? undefined
          : isActive === 'true'
            ? true
            : false,
    }
  }, [skip, studentId, enterpriseId, isActive])

  const { data, isLoading, error } = usePracticeAssignments(params)

  const studentsQuery = useStudents({
    skip: 0,
    limit: 500,
    isActive: true,
  })

  const enterprisesQuery = useEnterprises({
    skip: 0,
    limit: 500,
    isActive: true,
  })

  const supervisorsQuery = useUsers('practice_supervisor')

  const createMutation = useCreatePracticeAssignment()
  const updateMutation = useUpdatePracticeAssignment()

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Назначения практики"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить назначение"
      />

      <PracticeAssignmentsFilters
        studentId={studentId}
        onStudentIdChange={(value) => resetPagingAndSet(setStudentId, value)}
        enterpriseId={enterpriseId}
        onEnterpriseIdChange={(value) => resetPagingAndSet(setEnterpriseId, value)}
        isActive={isActive}
        onIsActiveChange={(value) => resetPagingAndSet(setIsActive, value)}
        students={studentsQuery.data?.items ?? []}
        enterprises={enterprisesQuery.data?.items ?? []}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки назначений</div>}

      {data && (
        <>
          <PracticeAssignmentsTable
            items={data.items}
            onEdit={(item) => {
              setEditing(item)
              setIsOpen(true)
            }}
          />

          <Pagination
            skip={skip}
            limit={PAGE_SIZE}
            total={data.total}
            onChange={setSkip}
          />
        </>
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
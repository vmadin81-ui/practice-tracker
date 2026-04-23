import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { StudentsTable } from '../components/tables/StudentsTable'
import { StudentForm } from '../components/forms/StudentForm'
import { StudentsFilters } from '../components/filters/StudentsFilters'
import { useStudents } from '../hooks/useStudents'
import { useGroups } from '../hooks/useGroups'
import { useSpecialties } from '../hooks/useSpecialties'
import { useCreateStudent, useUpdateStudent } from '../hooks/useStudentMutations'
import type { StudentItem } from '../types/students'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

const PAGE_SIZE = 20

export function StudentsPage() {
  const groupsQuery = useGroups()
  const specialtiesQuery = useSpecialties()
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<StudentItem | null>(null)

  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [specialtyId, setSpecialtyId] = useState('')
  const [isActive, setIsActive] = useState('')

  const studentParams = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      groupId: groupId ? Number(groupId) : undefined,
      specialtyId: specialtyId ? Number(specialtyId) : undefined,
      isActive:
        isActive === ''
          ? undefined
          : isActive === 'true'
            ? true
            : false,
    }
  }, [skip, search, groupId, specialtyId, isActive])

  const { data, isLoading, error } = useStudents(studentParams)

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Студенты"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить студента"
      />

      <StudentsFilters
        search={search}
        onSearchChange={(value) => resetPagingAndSet(setSearch, value)}
        groupId={groupId}
        onGroupIdChange={(value) => resetPagingAndSet(setGroupId, value)}
        specialtyId={specialtyId}
        onSpecialtyIdChange={(value) => resetPagingAndSet(setSpecialtyId, value)}
        isActive={isActive}
        onIsActiveChange={(value) => resetPagingAndSet(setIsActive, value)}
        groups={groupsQuery.data?.items ?? []}
        specialties={specialtiesQuery.data?.items ?? []}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки студентов</div>}

      {data && (
        <>
          <StudentsTable
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
          title={editing ? 'Редактировать студента' : 'Добавить студента'}
          onClose={() => setIsOpen(false)}
        >
          <StudentForm
            groups={groupsQuery.data?.items ?? []}
            specialties={specialtiesQuery.data?.items ?? []}
            initialValue={editing}
            onSubmit={async (payload) => {
              try {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload })
                  toast.success('Студент обновлён')
                } else {
                  await createMutation.mutateAsync(payload)
                  toast.success('Студент добавлен')
                }
                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось сохранить студента', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
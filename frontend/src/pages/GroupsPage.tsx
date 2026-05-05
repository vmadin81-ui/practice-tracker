import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { GroupsFilters } from '../components/filters/GroupsFilters'
import { GroupsTable } from '../components/tables/GroupsTable'
import { GroupForm } from '../components/forms/GroupForm'
import { useGroups } from '../hooks/useGroups'
import { useSpecialties } from '../hooks/useSpecialties'
import { useCreateGroup, useUpdateGroup } from '../hooks/useGroupMutations'
import type { GroupItem } from '../types/groups'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

const PAGE_SIZE = 20

export function GroupsPage() {
  const toast = useToast()

  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')
  const [specialtyId, setSpecialtyId] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<GroupItem | null>(null)

  const params = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      specialtyId: specialtyId ? Number(specialtyId) : undefined,
    }
  }, [skip, search, specialtyId])

  const { data, isLoading, error } = useGroups(params)

  const specialtiesQuery = useSpecialties({
    skip: 0,
    limit: 500,
  })

  const createMutation = useCreateGroup()
  const updateMutation = useUpdateGroup()

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Группы"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить группу"
      />

      <GroupsFilters
        search={search}
        onSearchChange={(value) => resetPagingAndSet(setSearch, value)}
        specialtyId={specialtyId}
        onSpecialtyIdChange={(value) => resetPagingAndSet(setSpecialtyId, value)}
        specialties={specialtiesQuery.data?.items ?? []}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки групп</div>}

      {data && (
        <>
          <GroupsTable
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
          title={editing ? 'Редактировать группу' : 'Добавить группу'}
          onClose={() => setIsOpen(false)}
        >
          <GroupForm
            specialties={specialtiesQuery.data?.items ?? []}
            initialValue={editing}
            onSubmit={async (payload) => {
              try {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload })
                  toast.success('Группа обновлена')
                } else {
                  await createMutation.mutateAsync(payload)
                  toast.success('Группа добавлена')
                }

                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось сохранить группу', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
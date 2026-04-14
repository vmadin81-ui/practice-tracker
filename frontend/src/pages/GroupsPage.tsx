import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { GroupsTable } from '../components/tables/GroupsTable'
import { GroupForm } from '../components/forms/GroupForm'
import { useGroups } from '../hooks/useGroups'
import { useSpecialties } from '../hooks/useSpecialties'
import { useCreateGroup, useUpdateGroup } from '../hooks/useGroupMutations'
import type { GroupItem } from '../types/groups'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function GroupsPage() {
  const { data, isLoading, error } = useGroups()
  const specialtiesQuery = useSpecialties()
  const createMutation = useCreateGroup()
  const updateMutation = useUpdateGroup()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<GroupItem | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Группы"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки групп</div>}
      {data && (
        <GroupsTable
          items={data.items}
          onEdit={(item) => {
            setEditing(item)
            setIsOpen(true)
          }}
        />
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
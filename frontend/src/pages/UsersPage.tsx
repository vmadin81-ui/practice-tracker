import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { UserForm } from '../components/forms/UserForm'
import { UsersTable } from '../components/tables/UsersTable'
import { useUsers, useCreateUser, useUpdateUser } from '../hooks/useUsers'
import { useGroups } from '../hooks/useGroups'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'
import type { UserItem } from '../types/auth'

export function UsersPage() {
  const { data, isLoading, error } = useUsers()
  const groupsQuery = useGroups()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Пользователи"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить пользователя"
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки пользователей</div>}
      {data && (
        <UsersTable
          items={data}
          onEdit={(item) => {
            setEditing(item)
            setIsOpen(true)
          }}
        />
      )}

      {isOpen && (
        <Modal
          title={editing ? 'Редактировать пользователя' : 'Добавить пользователя'}
          onClose={() => setIsOpen(false)}
        >
          <UserForm
            groups={groupsQuery.data?.items ?? []}
            initialValue={editing}
            onSubmit={async (payload) => {
              try {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload })
                  toast.success('Пользователь обновлён')
                } else {
                  await createMutation.mutateAsync(payload as any)
                  toast.success('Пользователь добавлен')
                }
                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось сохранить пользователя', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
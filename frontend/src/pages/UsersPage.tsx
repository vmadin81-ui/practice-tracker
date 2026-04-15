import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { UserForm } from '../components/forms/UserForm'
import { UsersTable } from '../components/tables/UsersTable'
import { useUsers, useCreateUser } from '../hooks/useUsers'
import { useGroups } from '../hooks/useGroups'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function UsersPage() {
  const { data, isLoading, error } = useUsers()
  const groupsQuery = useGroups()
  const createMutation = useCreateUser()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="page-grid">
      <Toolbar title="Пользователи" onAdd={() => setIsOpen(true)} addLabel="Добавить пользователя" />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки пользователей</div>}
      {data && <UsersTable items={data} />}

      {isOpen && (
        <Modal title="Добавить пользователя" onClose={() => setIsOpen(false)}>
          <UserForm
            groups={groupsQuery.data?.items ?? []}
            onSubmit={async (payload) => {
              try {
                await createMutation.mutateAsync(payload)
                toast.success('Пользователь добавлен')
                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось создать пользователя', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
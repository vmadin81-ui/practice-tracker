import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { UserForm } from '../components/forms/UserForm'
import { UsersTable } from '../components/tables/UsersTable'
import { UsersFilters } from '../components/filters/UsersFilters'
import { useUsers, useCreateUser, useUpdateUser } from '../hooks/useUsers'
import { useGroups } from '../hooks/useGroups'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'
import type {UserItem } from '../types/auth'

const PAGE_SIZE = 20

export function UsersPage() {
  const toast = useToast()

  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)

  const params = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      role: role || undefined,
      isActive:
        isActive === ''
          ? undefined
          : isActive === 'true'
            ? true
            : false,
    }
  }, [skip, search, role, isActive])

  const { data, isLoading, error } = useUsers(params)

  const groupsQuery = useGroups({
    skip: 0,
    limit: 500,
  })

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Пользователи"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить пользователя"
      />

      <UsersFilters
        search={search}
        onSearchChange={(value) => resetPagingAndSet(setSearch, value)}
        role={role}
        onRoleChange={(value) => resetPagingAndSet(setRole, value)}
        isActive={isActive}
        onIsActiveChange={(value) => resetPagingAndSet(setIsActive, value)}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки пользователей</div>}

      {data && (
        <>
          <UsersTable
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
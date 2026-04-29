import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { EnterprisesTable } from '../components/tables/EnterprisesTable'
import { EnterpriseForm } from '../components/forms/EnterpriseForm'
import { EnterprisesFilters } from '../components/filters/EnterprisesFilters'
import { useEnterprises } from '../hooks/useEnterprises'
import {
  useCreateEnterprise,
  useUpdateEnterprise,
} from '../hooks/useEnterpriseMutations'
import type { EnterpriseItem } from '../types/enterprises'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

const PAGE_SIZE = 20

export function EnterprisesPage() {
  const createMutation = useCreateEnterprise()
  const updateMutation = useUpdateEnterprise()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EnterpriseItem | null>(null)

  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState('')

  const enterpriseParams = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      isActive:
        isActive === ''
          ? undefined
          : isActive === 'true'
            ? true
            : false,
    }
  }, [skip, search, isActive])

  const { data, isLoading, error } = useEnterprises(enterpriseParams)

  function resetPagingAndSet(setter: (value: string) => void, value: string) {
    setSkip(0)
    setter(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Предприятия"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить предприятие"
      />

      <EnterprisesFilters
        search={search}
        onSearchChange={(value) => resetPagingAndSet(setSearch, value)}
        isActive={isActive}
        onIsActiveChange={(value) => resetPagingAndSet(setIsActive, value)}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки предприятий</div>}

      {data && (
        <>
          <EnterprisesTable
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
          title={editing ? 'Редактировать предприятие' : 'Добавить предприятие'}
          onClose={() => setIsOpen(false)}
        >
          <EnterpriseForm
            initialValue={editing}
            onSubmit={async (payload) => {
              try {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload })
                  toast.success('Предприятие обновлено')
                } else {
                  await createMutation.mutateAsync(payload)
                  toast.success('Предприятие добавлено')
                }
                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось сохранить предприятие', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { EnterprisesTable } from '../components/tables/EnterprisesTable'
import { EnterpriseForm } from '../components/forms/EnterpriseForm'
import { useEnterprises } from '../hooks/useEnterprises'
import {
  useCreateEnterprise,
  useUpdateEnterprise,
} from '../hooks/useEnterpriseMutations'
import type { EnterpriseItem } from '../types/enterprises'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function EnterprisesPage() {
  const { data, isLoading, error } = useEnterprises()
  const createMutation = useCreateEnterprise()
  const updateMutation = useUpdateEnterprise()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<EnterpriseItem | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Предприятия"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки предприятий</div>}
      {data && (
        <EnterprisesTable
          items={data.items}
          onEdit={(item) => {
            setEditing(item)
            setIsOpen(true)
          }}
        />
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
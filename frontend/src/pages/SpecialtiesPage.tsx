import { useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { SpecialtyForm } from '../components/forms/SpecialtyForm'
import { SpecialtiesTable } from '../components/tables/SpecialtiesTable'
import { useSpecialties } from '../hooks/useSpecialties'
import {
  useCreateSpecialty,
  useUpdateSpecialty,
} from '../hooks/useSpecialtyMutations'
import type { SpecialtyItem } from '../types/specialties'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

export function SpecialtiesPage() {
  const { data, isLoading, error } = useSpecialties()
  const createMutation = useCreateSpecialty()
  const updateMutation = useUpdateSpecialty()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<SpecialtyItem | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Специальности"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки специальностей</div>}
      {data && (
        <SpecialtiesTable
          items={data.items}
          onEdit={(item) => {
            setEditing(item)
            setIsOpen(true)
          }}
        />
      )}

      {isOpen && (
        <Modal
          title={editing ? 'Редактировать специальность' : 'Добавить специальность'}
          onClose={() => setIsOpen(false)}
        >
          <SpecialtyForm
            initialValue={editing}
            onSubmit={async (payload) => {
              try {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload })
                  toast.success('Специальность обновлена')
                } else {
                  await createMutation.mutateAsync(payload)
                  toast.success('Специальность добавлена')
                }
                setIsOpen(false)
              } catch (err) {
                toast.error('Не удалось сохранить специальность', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
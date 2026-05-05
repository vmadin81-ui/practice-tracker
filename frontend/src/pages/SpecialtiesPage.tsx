import { useMemo, useState } from 'react'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SpecialtiesFilters } from '../components/filters/SpecialtiesFilters'
import { SpecialtiesTable } from '../components/tables/SpecialtiesTable'
import { SpecialtyForm } from '../components/forms/SpecialtyForm'
import { useSpecialties } from '../hooks/useSpecialties'
import {
  useCreateSpecialty,
  useUpdateSpecialty,
} from '../hooks/useSpecialtyMutations'
import type { SpecialtyItem } from '../types/specialties'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'

const PAGE_SIZE = 20

export function SpecialtiesPage() {
  const toast = useToast()

  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<SpecialtyItem | null>(null)

  const params = useMemo(() => {
    return {
      skip,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
    }
  }, [skip, search])

  const { data, isLoading, error } = useSpecialties(params)

  const createMutation = useCreateSpecialty()
  const updateMutation = useUpdateSpecialty()

  function resetPagingAndSet(value: string) {
    setSkip(0)
    setSearch(value)
  }

  return (
    <div className="page-grid">
      <PageToolbar
        title="Специальности"
        onAdd={() => {
          setEditing(null)
          setIsOpen(true)
        }}
        addLabel="Добавить специальность"
      />

      <SpecialtiesFilters
        search={search}
        onSearchChange={resetPagingAndSet}
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки специальностей</div>}

      {data && (
        <>
          <SpecialtiesTable
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
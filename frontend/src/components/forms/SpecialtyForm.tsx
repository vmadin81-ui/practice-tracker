import { useState } from 'react'
import type {
  SpecialtyCreatePayload,
  SpecialtyItem,
} from '../../types/specialties'

type Props = {
  initialValue?: SpecialtyItem | null
  onSubmit: (payload: SpecialtyCreatePayload) => Promise<void> | void
}

export function SpecialtyForm({ initialValue, onSubmit }: Props) {
  const [code, setCode] = useState(initialValue?.code ?? '')
  const [name, setName] = useState(initialValue?.name ?? '')

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          code: code || null,
          name,
        })
      }}
    >
      <label>
        Код специальности
        <input value={code} onChange={(e) => setCode(e.target.value)} />
      </label>

      <label>
        Наименование специальности
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <button className="primary-btn" type="submit">
        Сохранить
      </button>
    </form>
  )
}
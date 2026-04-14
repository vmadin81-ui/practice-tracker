import { useState } from 'react'
import type {
  EnterpriseCreatePayload,
  EnterpriseItem,
} from '../../types/enterprises'

type Props = {
  initialValue?: EnterpriseItem | null
  onSubmit: (payload: EnterpriseCreatePayload) => Promise<void> | void
}

export function EnterpriseForm({ initialValue, onSubmit }: Props) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [address, setAddress] = useState(initialValue?.address ?? '')
  const [contactPerson, setContactPerson] = useState(initialValue?.contact_person ?? '')
  const [contactPhone, setContactPhone] = useState(initialValue?.contact_phone ?? '')
  const [latitude, setLatitude] = useState(String(initialValue?.latitude ?? ''))
  const [longitude, setLongitude] = useState(String(initialValue?.longitude ?? ''))
  const [radius, setRadius] = useState(String(initialValue?.allowed_radius_m ?? 200))
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)

  return (
    <form
      className="entity-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          name,
          address: address || null,
          contact_person: contactPerson || null,
          contact_phone: contactPhone || null,
          latitude: Number(latitude),
          longitude: Number(longitude),
          allowed_radius_m: Number(radius),
          is_active: isActive,
        })
      }}
    >
      <label>
        Название
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Адрес
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>

      <label>
        Контактное лицо
        <input
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
      </label>

      <label>
        Телефон
        <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </label>

      <label>
        Широта
        <input value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
      </label>

      <label>
        Долгота
        <input value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
      </label>

      <label>
        Радиус (м)
        <input value={radius} onChange={(e) => setRadius(e.target.value)} required />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Активно
      </label>

      <button className="primary-btn" type="submit">
        Сохранить
      </button>
    </form>
  )
}
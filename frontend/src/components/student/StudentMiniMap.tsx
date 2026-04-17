import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { GeolocationLogItem } from '../../types/geolocation'
import { getMarkerIcon } from '../map/leafletIcons'

type Props = {
  items: GeolocationLogItem[]
}

const DEFAULT_CENTER: [number, number] = [53.2145, 63.6243]

export function StudentMiniMap({ items }: Props) {
  const validItems = items.filter(
    (item) => item.latitude !== null && item.longitude !== null
  )

  const center =
    validItems.length > 0
      ? ([validItems[0].latitude, validItems[0].longitude] as [number, number])
      : DEFAULT_CENTER

  return (
    <div className="panel">
      <h3>Точки студента на карте</h3>

      <MapContainer center={center} zoom={13} style={{ height: '360px', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validItems.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={getMarkerIcon(item.check?.check_result ?? 'gray')}
          >
            <Popup>
              <strong>{item.student?.full_name ?? item.student_id}</strong>
              <br />
              Время: {item.sent_at}
              <br />
              Статус: {item.check?.check_result ?? '—'}
              <br />
              Расстояние: {item.check?.distance_m ?? '—'}
              <br />
              Комментарий: {item.check?.comment ?? '—'}
            </Popup>
          </Marker>
        ))}

        {validItems.map((item) =>
          item.check?.distance_m && item.check.enterprise_id ? null : null
        )}

        {validItems
          .filter((item) => item.assignment?.enterprise_id && item.check?.distance_m !== null)
          .map((item) => null)}
      </MapContainer>
    </div>
  )
}
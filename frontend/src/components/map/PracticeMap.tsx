import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { DashboardMapResponse } from '../../types/dashboard'
import { getMarkerIcon } from './leafletIcons'
import { MapLegend } from './MapLegend'

type Props = {
  data: DashboardMapResponse
}

const DEFAULT_CENTER: [number, number] = [53.2145, 63.6243]

export function PracticeMap({ data }: Props) {
  return (
    <div className="panel map-panel">
      <div className="map-panel-header">
        <h3>Карта практикантов</h3>
        <MapLegend />
      </div>

      <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: '560px', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.enterprises.map((enterprise) => (
          <Circle
            key={`enterprise-${enterprise.enterprise_id}`}
            center={[enterprise.latitude, enterprise.longitude]}
            radius={enterprise.allowed_radius_m}
          >
            <Popup>
              <strong>{enterprise.name}</strong>
              <br />
              Радиус: {enterprise.allowed_radius_m} м
            </Popup>
          </Circle>
        ))}

        {data.students
          .filter((student) => student.latitude !== null && student.longitude !== null)
          .map((student) => (
            <Marker
              key={`student-${student.student_id}`}
              position={[student.latitude as number, student.longitude as number]}
              icon={getMarkerIcon(student.status_color)}
            >
              <Popup>
                <strong>{student.full_name}</strong>
                <br />
                Группа: {student.group_name ?? '—'}
                <br />
                Предприятие: {student.enterprise_name ?? '—'}
                <br />
                Статус: {student.status_color}
                <br />
                Расстояние: {student.distance_m ?? '—'}
                <br />
                Время: {student.last_sent_at ?? '—'}
                <br />
                Комментарий: {student.comment ?? '—'}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
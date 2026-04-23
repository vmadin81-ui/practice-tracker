import type { StudentAccessLinkItem } from '../../types/studentAccessLink'

type Props = {
  items: StudentAccessLinkItem[]
  onShowQr: (item: StudentAccessLinkItem) => void
  onReissue: (item: StudentAccessLinkItem) => void
  onRevoke: (item: StudentAccessLinkItem) => void
}

export function StudentAccessLinksTable({
  items,
  onShowQr,
  onReissue,
  onRevoke,
}: Props) {
  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Студент</th>
            <th>Метка</th>
            <th>Активна</th>
            <th>Истекает</th>
            <th>Последнее устройство</th>
            <th>Использований</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.student?.full_name ?? item.student_id}</td>
              <td>{item.label ?? '—'}</td>
              <td>{item.is_active ? 'Да' : 'Нет'}</td>
              <td>{item.expires_at ?? '—'}</td>
              <td>{item.last_device_label ?? '—'}</td>
              <td>{item.usage_count}</td>
              <td>
                <div className="table-actions">
                  <button className="secondary-btn" onClick={() => onShowQr(item)}>
                    QR
                  </button>
                  <button className="secondary-btn" onClick={() => onReissue(item)}>
                    Перевыпустить
                  </button>
                  {item.is_active && (
                    <button className="secondary-btn" onClick={() => onRevoke(item)}>
                      Отозвать
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
import { QRCodeCanvas } from 'qrcode.react'

type Props = {
  studentName: string
  checkinUrl: string
  onClose: () => void
}

export function StudentAccessQrCard({ studentName, checkinUrl, onClose }: Props) {
  async function copyLink() {
    await navigator.clipboard.writeText(checkinUrl)
  }

  return (
    <div className="panel">
      <h3>QR-код для студента</h3>
      <div className="qr-card-subtitle">{studentName}</div>

      <div className="qr-card-box">
        <QRCodeCanvas value={checkinUrl} size={220} />
      </div>

      <div className="qr-link-box">{checkinUrl}</div>

      <div className="toolbar-actions">
        <button className="secondary-btn" onClick={copyLink}>
          Копировать ссылку
        </button>
        <button className="primary-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  )
}
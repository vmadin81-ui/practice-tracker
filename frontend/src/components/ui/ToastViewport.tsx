import type { ToastItem } from '../../context/ToastContext'

type Props = {
  items: ToastItem[]
  onClose: (id: string) => void
}

export function ToastViewport({ items, onClose }: Props) {
  return (
    <div className="toast-viewport">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.tone}`}>
          <div className="toast-content">
            <div className="toast-title">{item.title}</div>
            {item.description ? (
              <div className="toast-description">{item.description}</div>
            ) : null}
          </div>

          <button className="toast-close" onClick={() => onClose(item.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
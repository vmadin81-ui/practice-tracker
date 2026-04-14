type Props = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  tone = 'default',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-title">{title}</div>
        {description ? <div className="confirm-description">{description}</div> : null}

        <div className="confirm-actions">
          <button className="secondary-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`primary-btn ${tone === 'danger' ? 'primary-btn-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
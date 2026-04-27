import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title: string
  onAdd?: () => void
  addLabel?: string
}>

export function PageToolbar({
  title,
  onAdd,
  addLabel = 'Добавить',
  children,
}: Props) {
  return (
    <div className="page-toolbar panel">
      <div className="page-toolbar-row">
        <h2 className="page-title">{title}</h2>

        <div className="page-toolbar-actions">
          {children}
          {onAdd && (
            <button className="primary-btn" onClick={onAdd}>
              {addLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
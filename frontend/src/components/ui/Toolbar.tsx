import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title: string
  onAdd: () => void
  addLabel?: string
}>

export function Toolbar({ title, onAdd, addLabel = 'Добавить', children }: Props) {
  return (
    <div className="toolbar panel">
      <div>
        <h2>{title}</h2>
      </div>
      <div className="toolbar-actions">
        {children}
        <button className="primary-btn" onClick={onAdd}>
          {addLabel}
        </button>
      </div>
    </div>
  )
}
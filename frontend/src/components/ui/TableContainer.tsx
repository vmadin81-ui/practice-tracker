import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title?: string
}>

export function TableContainer({ title, children }: Props) {
  return (
    <div className="panel">
      {title ? <h3 className="table-title">{title}</h3> : null}
      <div className="table-container">{children}</div>
    </div>
  )
}
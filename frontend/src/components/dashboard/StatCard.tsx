type Props = {
  title: string
  value: number
  tone?: 'default' | 'green' | 'yellow' | 'red' | 'gray'
}

export function StatCard({ title, value, tone = 'default' }: Props) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  )
}
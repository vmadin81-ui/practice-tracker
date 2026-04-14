type TabKey = 'info' | 'statuses' | 'checkins'

type Props = {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
}

export function StudentTabs({ activeTab, onChange }: Props) {
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'info', label: 'Общая информация' },
    { key: 'statuses', label: 'История статусов' },
    { key: 'checkins', label: 'История check-in' },
  ]

  return (
    <div className="tabs-row">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : ''}`}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
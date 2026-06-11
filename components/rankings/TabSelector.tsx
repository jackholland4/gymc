'use client'

import type { AppTab } from './RankingsShell'

const TABS: { id: AppTab; label: string }[] = [
  { id: 'AA',   label: 'All-Around' },
  { id: 'Team', label: 'Team Final' },
  { id: 'VT',   label: 'Vault' },
  { id: 'UB',   label: 'Uneven Bars' },
  { id: 'BB',   label: 'Balance Beam' },
  { id: 'FX',   label: 'Floor' },
]

export default function TabSelector({
  active,
  onChange,
}: {
  active: AppTab
  onChange: (t: AppTab) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="relative px-3.5 py-1.5 rounded-lg font-body text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor: active === id ? 'rgba(220,38,38,0.15)' : 'transparent',
            color: active === id ? '#ef4444' : '#666',
            border: active === id ? '1px solid rgba(220,38,38,0.35)' : '1px solid transparent',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

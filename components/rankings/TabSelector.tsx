'use client'

import type { AppTab } from './RankingsShell'

const TABS: { id: AppTab; label: string; beta?: true }[] = [
  { id: 'AA',          label: 'All-Around' },
  { id: 'Team',        label: 'Team Final' },
  { id: 'VT',          label: 'Vault' },
  { id: 'UB',          label: 'Uneven Bars' },
  { id: 'BB',          label: 'Balance Beam' },
  { id: 'FX',          label: 'Floor' },
  { id: 'Overscoring', label: 'Domestic Premium', beta: true },
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
      {TABS.map(({ id, label, beta }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="relative px-3.5 py-1.5 rounded-lg font-body text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor: active === id ? 'rgba(220,38,38,0.15)' : 'transparent',
            color: active === id ? '#ef4444' : 'var(--c-txt-4)',
            border: active === id ? '1px solid rgba(220,38,38,0.35)' : '1px solid transparent',
          }}
        >
          {label}
          {beta && (
            <span
              className="ml-1.5 px-1 py-px rounded text-[9px] font-semibold leading-none align-middle"
              style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#ef4444' }}
            >
              β
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

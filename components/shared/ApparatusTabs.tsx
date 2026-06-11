'use client'

import type { Apparatus } from '@/types/simulation'

const DEFAULT_LABELS: Record<Apparatus, string> = {
  VT: 'Vault',
  UB: 'Uneven Bars',
  BB: 'Balance Beam',
  FX: 'Floor',
}

export function ApparatusTabs({
  active,
  onChange,
  labels,
}: {
  active: Apparatus
  onChange: (a: Apparatus) => void
  labels?: Partial<Record<Apparatus, string>>
}) {
  const apparatuses: Apparatus[] = ['VT', 'UB', 'BB', 'FX']
  const resolved = { ...DEFAULT_LABELS, ...labels }

  return (
    <div className="flex flex-wrap gap-1">
      {apparatuses.map((app) => {
        const isActive = active === app
        return (
          <button
            key={app}
            onClick={() => onChange(app)}
            className="relative px-3.5 py-1.5 rounded-lg font-body text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: isActive ? 'rgba(220,38,38,0.15)' : 'transparent',
              color: isActive ? '#ef4444' : '#666',
              border: isActive ? '1px solid rgba(220,38,38,0.35)' : '1px solid transparent',
            }}
          >
            {resolved[app]}
          </button>
        )
      })}
    </div>
  )
}

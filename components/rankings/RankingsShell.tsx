'use client'

import { useState, useMemo } from 'react'
import TabSelector from './TabSelector'
import TeamToggle from './TeamToggle'
import RankingsTable from './RankingsTable'
import TeamFinalRankingsPanel from './TeamFinalRankingsPanel'
import OverscorePanel from './OverscorePanel'
import type { RankingsData, ApparatusRow, AARow, TeamRow } from '@/types/simulation'

export type { RankingsData, ApparatusRow, AARow, TeamRow }
export type AppTab = 'VT' | 'UB' | 'BB' | 'FX' | 'AA' | 'Team' | 'Overscoring'

type Preset = 'all' | 'international' | 'figOnly'

const PRESETS: { key: Preset; label: string; description: string }[] = [
  { key: 'all',           label: 'All meets',      description: 'Domestic + international + non-FIG' },
  { key: 'international', label: 'International',   description: 'Excludes domestic meets' },
  { key: 'figOnly',       label: 'FIG only',        description: 'FIG-sanctioned meets only' },
]

interface Datasets {
  all: RankingsData
  international: RankingsData | null
  figOnly: RankingsData | null
}

export default function RankingsShell({ datasets }: { datasets: Datasets }) {
  const [preset, setPreset] = useState<Preset>('all')
  const [tab, setTab] = useState<AppTab>('AA')
  const [worldsOnly, setWorldsOnly] = useState(false)
  const [filter, setFilter] = useState('')

  const data = datasets[preset] ?? datasets.all

  const worldsSet = useMemo(
    () => new Set(data.worlds_field_nocs),
    [data.worlds_field_nocs]
  )

  const rows = useMemo(() => {
    let base: (ApparatusRow | AARow | TeamRow)[]
    if (tab === 'Team') {
      base = data.team
    } else if (tab === 'AA') {
      base = data.aa
    } else {
      base = data.apparatus[tab] ?? []
    }

    if (worldsOnly) {
      base = base.filter((r) => worldsSet.has((r as ApparatusRow).noc ?? (r as TeamRow).noc))
    }

    if (filter.trim()) {
      const q = filter.toLowerCase()
      base = base.filter((r) => {
        const row = r as ApparatusRow & TeamRow
        return (
          (row.gymnast ?? '').toLowerCase().includes(q) ||
          row.noc.toLowerCase().includes(q)
        )
      })
    }

    return base
  }, [tab, worldsOnly, filter, data, worldsSet])

  const generated = new Date(data.generated_at)
  const dateStr = generated.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })

  return (
    <div className="space-y-6">
      {/* Metadata bar */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-body text-xs text-[var(--c-txt-4)]">
        <span>
          <span className="text-[var(--c-txt-1)]">Simulations</span>{' '}
          <span className="text-[var(--c-txt-0)] font-semibold tabular-nums">{data.n_sims.toLocaleString()}</span>
        </span>
        <span>
          <span className="text-[var(--c-txt-1)]">Updated</span>{' '}
          <span className="text-[var(--c-txt-0)]">{dateStr}</span>
        </span>
        <span>
          <span className="text-[var(--c-txt-1)]">Projected Worlds field</span>{' '}
          <span className="text-[var(--c-txt-0)] font-semibold">{data.worlds_field_nocs.length} teams</span>
        </span>
      </div>

      {/* Score data preset selector */}
      <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-[var(--c-border-sm)]">
        <span className="font-body text-xs font-semibold text-[var(--c-txt-4)] uppercase tracking-wider shrink-0">
          Score data
        </span>
        <div className="flex items-center gap-1 bg-[var(--c-bg-2)] rounded-lg p-0.5 border border-[var(--c-border-sm)]">
          {PRESETS.map((p) => {
            const available = datasets[p.key] !== null
            const active = preset === p.key
            return (
              <button
                key={p.key}
                onClick={() => available && setPreset(p.key)}
                disabled={!available}
                title={p.description}
                className="px-3 py-1 rounded-md font-body text-xs transition-all duration-150"
                style={{
                  backgroundColor: active ? 'rgba(220,38,38,0.15)' : 'transparent',
                  color: active ? '#ef4444' : available ? 'var(--c-txt-3)' : 'var(--c-txt-6)',
                  fontWeight: active ? 600 : 400,
                  cursor: available ? 'pointer' : 'not-allowed',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
        {!datasets.international && !datasets.figOnly && (
          <span className="font-body text-[10px] text-[var(--c-txt-5)]">
            Run <code className="bg-[var(--c-bg-2)] px-1 py-0.5 rounded">rankings_compute.py</code> to unlock filter presets
          </span>
        )}
      </div>

      {/* Controls row — hide filter/toggle for Team and Overscoring tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <TabSelector active={tab} onChange={setTab} />
        {tab !== 'Team' && tab !== 'Overscoring' && (
          <div className="ml-auto flex items-center gap-3">
            <TeamToggle worldsOnly={worldsOnly} onChange={setWorldsOnly} />
            <input
              type="search"
              placeholder="Filter by name / NOC…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 rounded-lg border border-[var(--c-border-lg)] bg-[var(--c-bg-2)] px-3 text-xs text-[var(--c-txt-0)] placeholder-[#555] outline-none focus:border-[rgba(220,38,38,0.5)] transition-colors w-48"
            />
          </div>
        )}
      </div>

      {/* Table */}
      {tab === 'Overscoring' ? (
        <OverscorePanel discipline="WAG" />
      ) : tab === 'Team' ? (
        <TeamFinalRankingsPanel rows={data.team_final_detail ?? []} />
      ) : (
        <RankingsTable key={tab} tab={tab} rows={rows} />
      )}
    </div>
  )
}

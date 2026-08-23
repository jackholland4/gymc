'use client'

import { useState, useMemo } from 'react'
import TabSelector from './TabSelector'
import TeamToggle from './TeamToggle'
import RankingsTable from './RankingsTable'
import TeamFinalRankingsPanel from './TeamFinalRankingsPanel'
import type { TeamFinalDetail } from './TeamFinalRankingsPanel'

export type AppTab = 'VT' | 'UB' | 'BB' | 'FX' | 'AA' | 'Team'

export interface ApparatusRow {
  gymnast: string
  noc: string
  ef_rate: number
  mean_score: number
  gold_pct: number
  medal_pct: number
  top8_pct: number
  avg_rank: number
}

export interface AARow {
  gymnast: string
  noc: string
  aa_rate: number
  mean_score: number
  gold_pct: number
  medal_pct: number
  top8_pct: number
  avg_rank: number
}

export interface TeamRow {
  noc: string
  tf_rate: number
  mean_score: number
  mean_per_app: Record<string, number>
  gold_pct: number
  medal_pct: number
  top8_pct: number
  avg_rank: number
}

export interface RankingsData {
  generated_at: string
  n_sims: number
  worlds_field_nocs: string[]
  apparatus: Record<string, ApparatusRow[]>
  aa: AARow[]
  team: TeamRow[]
  team_final_detail?: TeamFinalDetail[]
}

export default function RankingsShell({ data }: { data: RankingsData }) {
  const [tab, setTab] = useState<AppTab>('AA')
  const [worldsOnly, setWorldsOnly] = useState(false)
  const [filter, setFilter] = useState('')

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

      {/* Controls row — hide filter/toggle for Team tab */}
      <div className="flex flex-wrap items-center gap-4">
        <TabSelector active={tab} onChange={setTab} />
        {tab !== 'Team' && (
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
      {tab === 'Team' ? (
        <TeamFinalRankingsPanel rows={data.team_final_detail ?? []} />
      ) : (
        <RankingsTable key={tab} tab={tab} rows={rows} />
      )}
    </div>
  )
}

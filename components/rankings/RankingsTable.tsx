'use client'

import { useState, useMemo } from 'react'
import type { AppTab, ApparatusRow, AARow, TeamRow } from './RankingsShell'

type SortDir = 'asc' | 'desc'

function pct(v: number) {
  return v === 0 ? '—' : `${(v * 100).toFixed(1)}%`
}
function score(v: number) {
  return v === 0 ? '—' : v.toFixed(3)
}
function avgRank(v: number) {
  return v >= 9 ? '—' : v.toFixed(1)
}

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (!dir) return <span className="text-[var(--c-txt-6)] ml-1">↕</span>
  return <span className="text-[#ef4444] ml-1">{dir === 'desc' ? '↓' : '↑'}</span>
}

function Th({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
  right,
}: {
  label: string
  col: string
  sortCol: string
  sortDir: SortDir
  onSort: (c: string) => void
  right?: boolean
}) {
  const active = sortCol === col
  return (
    <th
      className={`px-3 py-2.5 font-body text-xs font-semibold tracking-wide cursor-pointer select-none whitespace-nowrap
        ${right ? 'text-right' : 'text-left'} text-[var(--c-txt-4)] hover:text-[var(--c-txt-1)] transition-colors`}
      onClick={() => onSort(col)}
    >
      {label}
      <SortIcon dir={active ? sortDir : null} />
    </th>
  )
}

function GoldBar({ pct: p }: { pct: number }) {
  if (p === 0) return null
  return (
    <div className="mt-1 h-0.5 rounded-full bg-[var(--c-bg-2)] w-full">
      <div
        className="h-0.5 rounded-full bg-[#dc2626] transition-all"
        style={{ width: `${Math.min(100, p * 100 * 2)}%` }}
      />
    </div>
  )
}

// Team row with expandable apparatus breakdown
function TeamRowEl({ row, rank, cols }: { row: TeamRow; rank: number; cols: string[] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr
        className="border-b border-[var(--c-border-sm)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-3 py-3 font-body text-xs text-[var(--c-txt-5)] tabular-nums">{rank}</td>
        <td className="px-3 py-3">
          <span className="font-display text-sm font-semibold text-[var(--c-txt-0)]">{row.noc}</span>
          <span className="ml-1.5 text-[var(--c-txt-5)] text-xs">{expanded ? '▲' : '▼'}</span>
        </td>
        {cols.map((col) => (
          <td key={col} className="px-3 py-3 text-right font-body text-xs text-[var(--c-txt-2)] tabular-nums">
            {col === 'mean_score' ? score(row.mean_score) :
             col === 'avg_rank'   ? avgRank(row.avg_rank) :
             pct((row as unknown as Record<string, number>)[col])}
          </td>
        ))}
      </tr>
      {expanded && (
        <tr className="border-b border-[var(--c-border-sm)] bg-[rgba(220,38,38,0.03)]">
          <td />
          <td colSpan={cols.length + 1} className="px-3 py-3">
            <div className="grid grid-cols-4 gap-4">
              {(['VT', 'UB', 'BB', 'FX'] as const).map((app) => (
                <div key={app} className="text-center">
                  <p className="font-display text-xs font-semibold text-[var(--c-txt-4)] mb-1">{app}</p>
                  <p className="font-body text-sm text-[var(--c-txt-0)] tabular-nums">
                    {score(row.mean_per_app[app] ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function RankingsTable({
  tab,
  rows,
}: {
  tab: AppTab
  rows: unknown[]
}) {
  const isTeam = tab === 'Team'
  const isAA   = tab === 'AA'

  const defaultSort = 'gold_pct'
  const [sortCol, setSortCol] = useState(defaultSort)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function onSort(col: string) {
    if (col === sortCol) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = (a as Record<string, number>)[sortCol] ?? 0
      const bv = (b as Record<string, number>)[sortCol] ?? 0
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [rows, sortCol, sortDir])

  const apparatusCols = [
    { col: 'gold_pct',   label: 'Gold%'   },
    { col: 'medal_pct',  label: 'Medal%'  },
    { col: 'top8_pct',   label: 'Top 8%'  },
    { col: 'avg_rank',   label: 'Avg Rank' },
    { col: 'mean_score', label: 'Mean Score' },
  ]
  const aaCols = [
    { col: 'gold_pct',   label: 'Gold%'    },
    { col: 'medal_pct',  label: 'Medal%'   },
    { col: 'top8_pct',   label: 'Top 8%'   },
    { col: 'avg_rank',   label: 'Avg Rank' },
    { col: 'mean_score', label: 'Mean Score' },
  ]
  const teamCols = [
    { col: 'gold_pct',   label: 'Gold%'    },
    { col: 'medal_pct',  label: 'Medal%'   },
    { col: 'tf_rate',    label: 'Final%'   },
    { col: 'avg_rank',   label: 'Avg Rank' },
    { col: 'mean_score', label: 'Mean Score' },
  ]

  const cols = isTeam ? teamCols : isAA ? aaCols : apparatusCols

  if (sorted.length === 0) {
    return (
      <div className="py-16 text-center font-body text-sm text-[var(--c-txt-5)]">
        No data. Run <code className="text-[var(--c-txt-1)]">rankings_compute.py</code> and refresh.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--c-border-sm)]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--c-border-md)] bg-[var(--c-bg-5)]">
            <th className="px-3 py-2.5 font-body text-xs font-semibold text-left text-[var(--c-txt-6)] w-10">#</th>
            <th className="px-3 py-2.5 font-body text-xs font-semibold text-left text-[var(--c-txt-4)]">
              {isTeam ? 'Country' : 'Gymnast'}
            </th>
            {cols.map(({ col, label }) => (
              <Th key={col} col={col} label={label} sortCol={sortCol} sortDir={sortDir} onSort={onSort} right />
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            if (isTeam) {
              return (
                <TeamRowEl
                  key={(row as TeamRow).noc}
                  row={row as TeamRow}
                  rank={i + 1}
                  cols={cols.map((c) => c.col)}
                />
              )
            }

            const r = row as ApparatusRow & AARow
            return (
              <tr
                key={`${r.gymnast}-${r.noc}`}
                className="border-b border-[var(--c-border-sm)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <td className="px-3 py-3 font-body text-xs text-[var(--c-txt-5)] tabular-nums">{i + 1}</td>
                <td className="px-3 py-3">
                  <p className="font-body text-sm text-[var(--c-txt-0)]">{r.gymnast}</p>
                  <p className="font-body text-xs text-[var(--c-txt-5)]">{r.noc}</p>
                </td>
                {cols.map(({ col }) => {
                  const v = (r as unknown as Record<string, number>)[col] ?? 0
                  const isGold = col === 'gold_pct'
                  return (
                    <td key={col} className="px-3 py-3 text-right align-top">
                      <p className="font-body text-xs text-[var(--c-txt-2)] tabular-nums">
                        {col === 'mean_score' ? score(v) :
                         col === 'avg_rank'   ? avgRank(v) :
                         pct(v)}
                      </p>
                      {isGold && <GoldBar pct={v} />}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

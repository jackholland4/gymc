'use client'

import { useState } from 'react'
import { MedalBadge } from '@/components/shared/MedalBadge'
import type { TeamFinalGymnast, TeamFinalDetail } from '@/types/simulation'

export type { TeamFinalGymnast, TeamFinalDetail }

const APPARATUS = ['VT', 'UB', 'BB', 'FX'] as const
const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

function ExpandedTeam({ row }: { row: TeamFinalDetail }) {
  const sorted = [...row.gymnasts].sort((a, b) => {
    const sa = APPARATUS.reduce((s, app) => s + ((a[app] as number | null) ?? 0), 0)
    const sb = APPARATUS.reduce((s, app) => s + ((b[app] as number | null) ?? 0), 0)
    return sb - sa
  })

  return (
    <div className="overflow-x-auto">
      <table className="text-xs font-body w-full">
        <thead>
          <tr className="border-b border-[var(--c-border-sm)]">
            <th className="text-left py-1 pr-3 text-[var(--c-txt-5)] font-semibold">Gymnast</th>
            {APPARATUS.map((a) => (
              <th key={a} className="text-right py-1 px-2 text-[var(--c-txt-5)] font-semibold">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((g) => (
            <tr key={g.gymnast} className="border-b border-[var(--c-border-sm)]">
              <td className="py-1.5 pr-3 font-body text-xs text-[var(--c-txt-1)] truncate max-w-[140px]">
                {g.gymnast}
              </td>
              {APPARATUS.map((a) => (
                <td
                  key={a}
                  className="py-1.5 px-2 text-right tabular-nums text-[var(--c-txt-1)]"
                  style={{ color: g[a] != null ? undefined : 'var(--c-txt-6)' }}
                >
                  {fmt(g[a] as number | null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamRow({ row, rank }: { row: TeamFinalDetail; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="border-b border-[var(--c-border-sm)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-3 py-3 text-center">
          <MedalBadge rank={rank} />
        </td>
        <td className="px-3 py-3">
          <span className="font-display text-sm font-semibold text-[var(--c-txt-0)]">{row.noc}</span>
          <span className="ml-1.5 text-[var(--c-txt-5)] text-xs">{expanded ? '▲' : '▼'}</span>
        </td>
        {APPARATUS.map((app) => (
          <td key={app} className="px-3 py-3 text-right font-body text-xs tabular-nums text-[var(--c-txt-2)]">
            {fmt(row.mean_per_app[app])}
          </td>
        ))}
        <td className="px-3 py-3 text-right font-body text-xs tabular-nums font-semibold text-[var(--c-txt-0)]">
          {fmt(row.mean_total)}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-[var(--c-border-sm)] bg-[rgba(220,38,38,0.03)]">
          <td />
          <td colSpan={APPARATUS.length + 1} className="px-3 py-3">
            <ExpandedTeam row={row} />
          </td>
        </tr>
      )}
    </>
  )
}

export default function TeamFinalRankingsPanel({ rows }: { rows: TeamFinalDetail[] }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="py-16 text-center font-body text-sm text-[var(--c-txt-5)]">
        No team final detail data. Re-run{' '}
        <code className="text-[var(--c-txt-1)]">rankings_compute.py</code> and refresh.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="font-body text-xs text-[var(--c-txt-5)]">
        Optimal team per country via 200-sim Monte Carlo. Scores are 200-sim converged means.
        Click a row to expand per-gymnast breakdown.
      </p>
      <div className="overflow-x-auto rounded-xl border border-[var(--c-border-sm)]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--c-border-md)] bg-[var(--c-bg-5)]">
              <th className="px-3 py-2.5 font-body text-xs font-semibold text-center text-[var(--c-txt-6)] w-10">
                #
              </th>
              <th className="px-3 py-2.5 font-body text-xs font-semibold text-left text-[var(--c-txt-4)]">
                Country
              </th>
              {APPARATUS.map((app) => (
                <th
                  key={app}
                  className="px-3 py-2.5 font-body text-xs font-semibold text-right text-[var(--c-txt-4)]"
                >
                  {app} ↕
                </th>
              ))}
              <th className="px-3 py-2.5 font-body text-xs font-semibold text-right text-[var(--c-txt-4)]">
                Total ↓
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <TeamRow key={row.noc} row={row} rank={i + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

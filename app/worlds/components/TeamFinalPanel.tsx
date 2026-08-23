'use client'

import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { MedalBadge } from '@/components/shared/MedalBadge'
import { useWorlds } from '../WorldsProvider'
import { GymnastName } from './GymnastName'
import type { Apparatus, TeamStanding } from '@/types/simulation'

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

function TeamExpandedRow({
  country,
  allScores,
  apparatus,
}: {
  country: string
  allScores: Array<{ country: string; gymnast: string; apparatus: Apparatus; score: number }>
  apparatus: Apparatus[]
}) {
  const scores = allScores.filter((s) => s.country === country)
  const gymnasts = Array.from(new Set(scores.map((s) => s.gymnast)))

  return (
    <div className="overflow-x-auto">
      <table className="text-xs font-body w-full">
        <thead>
          <tr className="border-b border-[var(--c-border-sm)]">
            <th className="text-left py-1 pr-3 text-[var(--c-txt-5)] font-semibold">Gymnast</th>
            {apparatus.map((a) => (
              <th key={a} className="text-right py-1 px-2 text-[var(--c-txt-5)] font-semibold">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gymnasts.map((g) => {
            const byApp = Object.fromEntries(
              apparatus.map((a) => {
                const match = scores.find((s) => s.gymnast === g && s.apparatus === a)
                return [a, match?.score ?? null]
              })
            ) as Record<Apparatus, number | null>
            return (
              <tr key={g} className="border-b border-[var(--c-border-sm)]">
                <td className="py-1.5 pr-3 truncate max-w-[120px]"><GymnastName name={g} noc={country} /></td>
                {apparatus.map((a) => (
                  <td key={a} className="py-1.5 px-2 text-right tabular-nums text-[var(--c-txt-1)]">
                    {fmt(byApp[a])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function TeamFinalPanel() {
  const [state] = useWorlds()
  const { apparatus } = state
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)

  const tf = state.simResult?.team_final
  if (!tf) return null

  const { standings, all_scores } = tf

  const columns = [
    {
      key: 'rank',
      header: '#',
      align: 'center' as const,
      render: (_row: TeamStanding, idx: number) => <MedalBadge rank={idx + 1} />,
    },
    {
      key: 'country',
      header: 'Country',
      render: (row: TeamStanding) => (
        <span className="font-body text-xs text-[var(--c-txt-0)] font-medium">{row.country}</span>
      ),
      sortValue: (row: TeamStanding) => row.country,
    },
    ...apparatus.map((app) => ({
      key: app,
      header: app,
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums text-[var(--c-txt-1)]">{fmt(row[app] as number)}</span>
      ),
      sortValue: (row: TeamStanding) => row[app] as number,
    })),
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums font-semibold text-[var(--c-txt-0)]">
          {fmt(row.total)}
        </span>
      ),
      sortValue: (row: TeamStanding) => row.total,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-[var(--c-txt-0)]">
        Team Final Standings
        <span className="ml-2 font-body text-xs text-[var(--c-txt-5)] font-normal">Click a row to see per-gymnast scores</span>
      </h3>
      <DataTable
        columns={columns}
        rows={standings}
        rowKey={(r) => r.country}
        defaultSortKey="total"
        defaultSortDir="desc"
        onRowClick={(row) =>
          setExpandedCountry((prev) => (prev === row.country ? null : row.country))
        }
        expandedKey={expandedCountry}
        renderExpanded={(row) => (
          <TeamExpandedRow country={row.country} allScores={all_scores} apparatus={apparatus} />
        )}
      />
    </div>
  )
}

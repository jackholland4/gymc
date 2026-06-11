'use client'

import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { MedalBadge } from '@/components/shared/MedalBadge'
import { useWorlds } from '../WorldsProvider'
import { GymnastName } from './GymnastName'
import type { Apparatus, TeamStanding } from '@/types/simulation'

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')
const APPARATUS: Apparatus[] = ['VT', 'UB', 'BB', 'FX']

function TeamExpandedRow({
  country,
  allScores,
}: {
  country: string
  allScores: Array<{ country: string; gymnast: string; apparatus: Apparatus; score: number }>
}) {
  const scores = allScores.filter((s) => s.country === country)
  const gymnasts = Array.from(new Set(scores.map((s) => s.gymnast)))

  return (
    <div className="overflow-x-auto">
      <table className="text-xs font-body w-full">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.06)]">
            <th className="text-left py-1 pr-3 text-[#555] font-semibold">Gymnast</th>
            {APPARATUS.map((a) => (
              <th key={a} className="text-right py-1 px-2 text-[#555] font-semibold">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gymnasts.map((g) => {
            const byApp = Object.fromEntries(
              APPARATUS.map((a) => {
                const match = scores.find((s) => s.gymnast === g && s.apparatus === a)
                return [a, match?.score ?? null]
              })
            ) as Record<Apparatus, number | null>
            return (
              <tr key={g} className="border-b border-[rgba(255,255,255,0.03)]">
                <td className="py-1.5 pr-3 truncate max-w-[120px]"><GymnastName name={g} noc={country} /></td>
                {APPARATUS.map((a) => (
                  <td key={a} className="py-1.5 px-2 text-right tabular-nums text-[#a0a0a0]">
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
        <span className="font-body text-xs text-[#f5f5f5] font-medium">{row.country}</span>
      ),
      sortValue: (row: TeamStanding) => row.country,
    },
    {
      key: 'VT',
      header: 'VT',
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.VT)}</span>
      ),
      sortValue: (row: TeamStanding) => row.VT,
    },
    {
      key: 'UB',
      header: 'UB',
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.UB)}</span>
      ),
      sortValue: (row: TeamStanding) => row.UB,
    },
    {
      key: 'BB',
      header: 'BB',
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.BB)}</span>
      ),
      sortValue: (row: TeamStanding) => row.BB,
    },
    {
      key: 'FX',
      header: 'FX',
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.FX)}</span>
      ),
      sortValue: (row: TeamStanding) => row.FX,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (row: TeamStanding) => (
        <span className="font-body text-xs tabular-nums font-semibold text-[#f5f5f5]">
          {fmt(row.total)}
        </span>
      ),
      sortValue: (row: TeamStanding) => row.total,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-[#f5f5f5]">
        Team Final Standings
        <span className="ml-2 font-body text-xs text-[#555] font-normal">Click a row to see per-gymnast scores</span>
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
          <TeamExpandedRow country={row.country} allScores={all_scores} />
        )}
      />
    </div>
  )
}

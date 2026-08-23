'use client'

import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { ApparatusTabs } from '@/components/shared/ApparatusTabs'
import { useWorlds } from '../WorldsProvider'
import { GymnastName } from './GymnastName'
import type { Apparatus, TeamStanding, EFResult, AAStanding } from '@/types/simulation'

const fmt = (v: number | null | undefined) =>
  v != null ? v.toFixed(3) : '—'

// ---------------------------------------------------------------------------
// Expanded row: per-gymnast scores for a country on each apparatus
// ---------------------------------------------------------------------------

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
  // Group by gymnast
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
                <td className="py-1.5 pr-3 text-[var(--c-txt-3)] truncate max-w-[120px]">{g}</td>
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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function QualsPanel() {
  const [state] = useWorlds()
  const { apparatus } = state
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const [activeApp, setActiveApp] = useState<Apparatus>(() => apparatus[0])

  const quals = state.simResult?.quals
  if (!quals) return null

  const { team_standings, all_scores, apparatus_rankings, aa_standings, ef_qualifiers, aa_qualifiers } = quals

  const efSet = new Set(
    (ef_qualifiers[activeApp] ?? []).map((q) => `${q.gymnast}||${q.noc}`)
  )
  const aaSet = new Set(aa_qualifiers.map((q) => `${q.gymnast}||${q.noc}`))

  // ---- Team standings table ----
  const teamColumns = [
    {
      key: 'rank',
      header: '#',
      align: 'center' as const,
      render: (_row: TeamStanding, idx: number) => (
        <span className="font-body text-xs tabular-nums text-[var(--c-txt-4)]">{idx + 1}</span>
      ),
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

  // ---- Apparatus rankings table ----
  const appColumns = [
    {
      key: 'rank',
      header: '#',
      align: 'center' as const,
      render: (_row: EFResult, idx: number) => (
        <span className="font-body text-xs tabular-nums text-[var(--c-txt-4)]">{idx + 1}</span>
      ),
    },
    {
      key: 'gymnast',
      header: 'Gymnast',
      render: (row: EFResult) => <GymnastName name={row.gymnast} noc={row.country} />,
      sortValue: (row: EFResult) => row.gymnast,
    },
    {
      key: 'country',
      header: 'NOC',
      render: (row: EFResult) => (
        <span className="font-body text-xs text-[var(--c-txt-1)]">{row.country}</span>
      ),
      sortValue: (row: EFResult) => row.country,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right' as const,
      render: (row: EFResult) => (
        <span className="font-body text-xs tabular-nums text-[var(--c-txt-0)]">{fmt(row.score)}</span>
      ),
      sortValue: (row: EFResult) => row.score,
    },
    {
      key: 'ef',
      header: 'EF',
      align: 'center' as const,
      render: (row: EFResult) => {
        const key = `${row.gymnast}||${row.country}`
        return efSet.has(key) ? (
          <span className="inline-block bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.3)] text-[#ef4444] rounded-full px-1.5 py-0.5 font-body text-xs leading-none">
            EF ✓
          </span>
        ) : null
      },
    },
  ]

  // ---- AA standings table ----
  const aaColumns = [
    {
      key: 'rank',
      header: '#',
      align: 'center' as const,
      render: (_row: AAStanding, idx: number) => (
        <span className="font-body text-xs tabular-nums text-[var(--c-txt-4)]">{idx + 1}</span>
      ),
    },
    {
      key: 'gymnast',
      header: 'Gymnast',
      render: (row: AAStanding) => <GymnastName name={row.gymnast} noc={row.country} />,
      sortValue: (row: AAStanding) => row.gymnast,
    },
    {
      key: 'country',
      header: 'NOC',
      render: (row: AAStanding) => (
        <span className="font-body text-xs text-[var(--c-txt-1)]">{row.country}</span>
      ),
      sortValue: (row: AAStanding) => row.country,
    },
    {
      key: 'score',
      header: 'Total',
      align: 'right' as const,
      render: (row: AAStanding) => (
        <span className="font-body text-xs tabular-nums font-semibold text-[var(--c-txt-0)]">
          {fmt(row.score)}
        </span>
      ),
      sortValue: (row: AAStanding) => row.score,
    },
    {
      key: 'aa',
      header: 'AA',
      align: 'center' as const,
      render: (row: AAStanding) => {
        const key = `${row.gymnast}||${row.country}`
        return aaSet.has(key) ? (
          <span className="inline-block bg-[rgba(220,38,38,0.15)] border border-[rgba(220,38,38,0.3)] text-[#ef4444] rounded-full px-1.5 py-0.5 font-body text-xs leading-none">
            AA ✓
          </span>
        ) : null
      },
    },
  ]

  const appRankings = apparatus_rankings[activeApp] ?? []

  return (
    <div className="space-y-8">
      {/* Team Standings */}
      <section>
        <h3 className="font-display text-sm font-semibold text-[var(--c-txt-0)] mb-3">
          Team Standings
          <span className="ml-2 font-body text-xs text-[var(--c-txt-5)] font-normal">Top 8 advance to Team Final</span>
        </h3>
        <DataTable
          columns={teamColumns}
          rows={team_standings}
          rowKey={(r) => r.country}
          defaultSortKey="total"
          defaultSortDir="desc"
          dimAfterRank={8}
          onRowClick={(row) =>
            setExpandedCountry((prev) => (prev === row.country ? null : row.country))
          }
          expandedKey={expandedCountry}
          renderExpanded={(row) => (
            <TeamExpandedRow country={row.country} allScores={all_scores} apparatus={apparatus} />
          )}
        />
      </section>

      {/* Apparatus Rankings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-semibold text-[var(--c-txt-0)]">
            Apparatus Rankings
            <span className="ml-2 font-body text-xs text-[var(--c-txt-5)] font-normal">Top 8 → EF (2 per country max)</span>
          </h3>
          <ApparatusTabs active={activeApp} onChange={setActiveApp} apparatuses={apparatus} />
        </div>
        <DataTable
          columns={appColumns}
          rows={appRankings}
          rowKey={(r) => `${r.gymnast}-${r.country}`}
          defaultSortKey="score"
          defaultSortDir="desc"
          dimAfterRank={8}
        />
      </section>

      {/* AA Standings */}
      <section>
        <h3 className="font-display text-sm font-semibold text-[var(--c-txt-0)] mb-3">
          All-Around Standings
          <span className="ml-2 font-body text-xs text-[var(--c-txt-5)] font-normal">Top 24 → AA Final (2 per country max)</span>
        </h3>
        <DataTable
          columns={aaColumns}
          rows={aa_standings}
          rowKey={(r) => `${r.gymnast}-${r.country}`}
          defaultSortKey="score"
          defaultSortDir="desc"
          dimAfterRank={24}
        />
      </section>
    </div>
  )
}

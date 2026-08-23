'use client'

import { DataTable } from '@/components/shared/DataTable'
import { MedalBadge } from '@/components/shared/MedalBadge'
import { useWorlds } from '../WorldsProvider'
import { GymnastName } from './GymnastName'
import type { AAResult } from '@/types/simulation'

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

export function AAFinalPanel() {
  const [state] = useWorlds()
  const { apparatus } = state

  const rows = state.simResult?.aa_final ?? []

  const columns = [
    {
      key: 'rank',
      header: '#',
      align: 'center' as const,
      render: (_row: AAResult, idx: number) => <MedalBadge rank={idx + 1} />,
    },
    {
      key: 'gymnast',
      header: 'Gymnast',
      render: (row: AAResult) => <GymnastName name={row.gymnast} noc={row.country} />,
      sortValue: (row: AAResult) => row.gymnast,
    },
    {
      key: 'country',
      header: 'NOC',
      render: (row: AAResult) => (
        <span className="font-body text-xs text-[var(--c-txt-1)]">{row.country}</span>
      ),
      sortValue: (row: AAResult) => row.country,
    },
    ...apparatus.map((app) => ({
      key: app,
      header: app,
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums text-[var(--c-txt-1)]">{fmt(row[app] as number)}</span>
      ),
      sortValue: (row: AAResult) => row[app] as number,
    })),
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums font-semibold text-[var(--c-txt-0)]">
          {fmt(row.total)}
        </span>
      ),
      sortValue: (row: AAResult) => row.total,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-[var(--c-txt-0)]">All-Around Final</h3>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => `${r.gymnast}-${r.country}`}
        defaultSortKey="total"
        defaultSortDir="desc"
      />
    </div>
  )
}

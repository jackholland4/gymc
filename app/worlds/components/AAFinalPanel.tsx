'use client'

import { DataTable } from '@/components/shared/DataTable'
import { MedalBadge } from '@/components/shared/MedalBadge'
import { useWorlds } from '../WorldsProvider'
import { GymnastName } from './GymnastName'
import type { AAResult } from '@/types/simulation'

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

export function AAFinalPanel() {
  const [state] = useWorlds()

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
        <span className="font-body text-xs text-[#a0a0a0]">{row.country}</span>
      ),
      sortValue: (row: AAResult) => row.country,
    },
    {
      key: 'VT',
      header: 'VT',
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.VT)}</span>
      ),
      sortValue: (row: AAResult) => row.VT,
    },
    {
      key: 'UB',
      header: 'UB',
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.UB)}</span>
      ),
      sortValue: (row: AAResult) => row.UB,
    },
    {
      key: 'BB',
      header: 'BB',
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.BB)}</span>
      ),
      sortValue: (row: AAResult) => row.BB,
    },
    {
      key: 'FX',
      header: 'FX',
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums text-[#a0a0a0]">{fmt(row.FX)}</span>
      ),
      sortValue: (row: AAResult) => row.FX,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right' as const,
      render: (row: AAResult) => (
        <span className="font-body text-xs tabular-nums font-semibold text-[#f5f5f5]">
          {fmt(row.total)}
        </span>
      ),
      sortValue: (row: AAResult) => row.total,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-[#f5f5f5]">All-Around Final</h3>
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

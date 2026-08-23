'use client'

import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { MedalBadge } from '@/components/shared/MedalBadge'
import { ApparatusTabs } from '@/components/shared/ApparatusTabs'
import { useWorlds } from '../WorldsProvider'
import { GymnastName } from './GymnastName'
import type { Apparatus, EFResult } from '@/types/simulation'

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

export function ApparatusFinalsPanel() {
  const [state] = useWorlds()
  const { apparatus } = state
  const [activeApp, setActiveApp] = useState<Apparatus>(() => apparatus[0] as Apparatus)

  const finals = state.simResult?.apparatus_finals
  if (!finals) return null

  const rows = finals[activeApp] ?? []

  const columns = [
    {
      key: 'rank',
      header: '#',
      align: 'center' as const,
      render: (_row: EFResult, idx: number) => <MedalBadge rank={idx + 1} />,
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
        <span className="font-body text-xs tabular-nums font-semibold text-[var(--c-txt-0)]">
          {fmt(row.score)}
        </span>
      ),
      sortValue: (row: EFResult) => row.score,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-[var(--c-txt-0)]">Apparatus Finals</h3>
        <ApparatusTabs active={activeApp} onChange={setActiveApp} apparatuses={apparatus} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => `${r.gymnast}-${r.country}`}
        defaultSortKey="score"
        defaultSortDir="desc"
      />
    </div>
  )
}

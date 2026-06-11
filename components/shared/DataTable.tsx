'use client'

import { useState, useMemo } from 'react'

type SortDir = 'asc' | 'desc'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T, idx: number) => React.ReactNode
  sortValue?: (row: T) => number | string
  align?: 'left' | 'right' | 'center'
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  defaultSortKey?: string
  defaultSortDir?: SortDir
  stickyHeader?: boolean
  /** Rows after this 1-based rank index get dimmed (opacity 50%) */
  dimAfterRank?: number
  onRowClick?: (row: T) => void
  expandedKey?: string | null
  renderExpanded?: (row: T) => React.ReactNode
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-[#444]">↕</span>
  return <span className="ml-1 text-[#ef4444]">{dir === 'desc' ? '↓' : '↑'}</span>
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  defaultSortKey,
  defaultSortDir = 'desc',
  stickyHeader = false,
  dimAfterRank,
  onRowClick,
  expandedKey,
  renderExpanded,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir)

  function handleHeaderClick(key: string, hasSortValue: boolean) {
    if (!hasSortValue) return
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return rows
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv
      }
      const as = String(av)
      const bs = String(bv)
      return sortDir === 'desc' ? bs.localeCompare(as) : as.localeCompare(bs)
    })
  }, [rows, sortKey, sortDir, columns])

  const alignClass = (align: Column<T>['align']) => {
    if (align === 'right') return 'text-right'
    if (align === 'center') return 'text-center'
    return 'text-left'
  }

  if (rows.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
        <div className="py-12 text-center font-body text-sm text-[#555]">No data available.</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
      <table className="w-full border-collapse">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#0f0f0f]">
            {columns.map((col) => {
              const canSort = !!col.sortValue
              const isActive = sortKey === col.key
              return (
                <th
                  key={col.key}
                  onClick={() => handleHeaderClick(col.key, canSort)}
                  className={[
                    'px-3 py-2.5 font-body text-xs font-semibold tracking-wide whitespace-nowrap',
                    'text-[#666] transition-colors select-none',
                    alignClass(col.align),
                    canSort ? 'cursor-pointer hover:text-[#a0a0a0]' : 'cursor-default',
                    col.className ?? '',
                  ].join(' ')}
                >
                  {col.header}
                  {canSort && <SortIcon active={isActive} dir={sortDir} />}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const key = rowKey(row)
            const isExpanded = expandedKey === key
            const dim = dimAfterRank !== undefined && idx >= dimAfterRank

            return (
              <>
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    'border-b border-[rgba(255,255,255,0.04)] transition-colors',
                    onRowClick || renderExpanded ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.02)]' : '',
                    dim ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        'px-3 py-3 font-body text-xs text-[#c0c0c0] tabular-nums',
                        alignClass(col.align),
                        col.className ?? '',
                      ].join(' ')}
                    >
                      {col.render ? col.render(row, idx) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
                {isExpanded && renderExpanded && (
                  <tr
                    key={`${key}--expanded`}
                    className="border-b border-[rgba(255,255,255,0.04)] bg-[rgba(220,38,38,0.03)]"
                  >
                    <td colSpan={columns.length} className="px-3 py-3">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

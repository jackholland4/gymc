'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchCalendar, fetchMeetDetail } from '@/lib/api'
import type { CalendarMeet, MeetDetail, MeetResultRow, Discipline } from '@/types/simulation'

const APPARATUS_WAG = ['VT', 'UB', 'BB', 'FX'] as const
const APPARATUS_MAG = ['FX', 'PH', 'SR', 'VT', 'PB', 'HB'] as const

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

function formatDate(dateStr: string | null) {
  return dateStr ?? null
}

// ---------------------------------------------------------------------------
// Meet detail view
// ---------------------------------------------------------------------------

function MeetDetailView({
  meetName,
  discipline,
  onBack,
}: {
  meetName: string
  discipline: Discipline
  onBack: () => void
}) {
  const [detail, setDetail] = useState<MeetDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apparatus = discipline === 'MAG' ? APPARATUS_MAG : APPARATUS_WAG

  useEffect(() => {
    setDetail(null)
    setError(null)
    fetchMeetDetail(meetName, discipline)
      .then(setDetail)
      .catch(() => setError('Failed to load meet results.'))
  }, [meetName, discipline])

  return (
    <div>
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="font-body text-sm text-[var(--c-txt-4)] hover:text-[#ef4444] transition-colors"
        >
          ← Calendar
        </button>
        <span className="text-[var(--c-txt-5)]">/</span>
        <span className="font-display text-sm font-semibold text-[var(--c-txt-0)]">{meetName}</span>
      </div>

      {error && <p className="font-body text-sm text-[#ef4444]">{error}</p>}

      {!detail && !error && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
          <span className="font-body text-sm text-[var(--c-txt-4)]">Loading results…</span>
        </div>
      )}

      {detail && (
        <div className="space-y-10">
          {Object.entries(detail.sections).map(([section, rows]) => (
            <SectionTable
              key={section}
              section={section}
              rows={rows}
              apparatus={apparatus as unknown as string[]}
            />
          ))}
          {Object.keys(detail.sections).length === 0 && (
            <p className="font-body text-sm text-[var(--c-txt-4)]">No results found.</p>
          )}
        </div>
      )}
    </div>
  )
}

function SectionTable({
  section,
  rows,
  apparatus,
}: {
  section: string
  rows: MeetResultRow[]
  apparatus: string[]
}) {
  // Determine which columns actually have data
  const hasClub = rows.some((r) => r.club)
  const hasAA = rows.some((r) => r.AA != null)
  const appCols = apparatus.filter((a) => rows.some((r) => r[a as keyof MeetResultRow] != null))

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-display text-xs font-semibold uppercase tracking-widest text-[#ef4444]">
          {section}
        </span>
        <span className="h-px flex-1 bg-[var(--c-border-sm)]" />
        <span className="font-body text-xs text-[var(--c-txt-5)]">{rows.length} results</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--c-border-md)]">
              <th className="text-left font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 pr-3 w-8">#</th>
              <th className="text-left font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 pr-3">Gymnast</th>
              {hasClub && (
                <th className="text-left font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 pr-3">Club</th>
              )}
              {appCols.map((a) => (
                <th key={a} className="text-right font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 px-2">
                  {a}
                </th>
              ))}
              {hasAA && (
                <th className="text-right font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 pl-2">AA</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="border-b border-[var(--c-border-sm)] hover:bg-[var(--c-bg-1)] transition-colors"
              >
                <td className="font-body text-xs text-[var(--c-txt-5)] py-2 pr-3 tabular-nums">
                  {r.rank ?? i + 1}
                </td>
                <td className="font-body text-sm text-[var(--c-txt-0)] py-2 pr-3 min-w-[140px]">
                  {r.gymnast ?? '—'}
                </td>
                {hasClub && (
                  <td className="font-body text-xs text-[var(--c-txt-3)] py-2 pr-3">
                    {r.club ?? ''}
                  </td>
                )}
                {appCols.map((a) => {
                  const val = r[a as keyof MeetResultRow] as number | null
                  const isVT = a === 'VT'
                  return (
                    <td key={a} className="font-body text-xs text-[var(--c-txt-1)] py-2 px-2 text-right tabular-nums">
                      <span className={isVT && r.vt_sanctioned ? 'text-[var(--c-txt-0)] font-medium' : ''}>
                        {fmt(val)}
                      </span>
                    </td>
                  )
                })}
                {hasAA && (
                  <td className="font-body text-xs font-semibold text-[var(--c-txt-0)] py-2 pl-2 text-right tabular-nums">
                    {fmt(r.AA)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Meet list
// ---------------------------------------------------------------------------

function MeetList({
  meets,
  onSelect,
}: {
  meets: CalendarMeet[]
  onSelect: (meetName: string) => void
}) {
  if (meets.length === 0) {
    return (
      <p className="font-body text-sm text-[var(--c-txt-4)] py-8 text-center">No meets found.</p>
    )
  }

  return (
    <div className="divide-y divide-[var(--c-border-sm)]">
      {meets.map((meet) => (
        <button
          key={meet.results_url ?? meet.meet_name}
          onClick={() => onSelect(meet.meet_name)}
          className="w-full text-left py-4 px-1 group flex items-start justify-between gap-4 hover:bg-[var(--c-bg-1)] transition-colors rounded"
        >
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-semibold text-[var(--c-txt-0)] group-hover:text-[#ef4444] transition-colors truncate">
              {meet.meet_name}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              {meet.date_str && (
                <span className="font-body text-xs text-[var(--c-txt-4)]">
                  {formatDate(meet.date_str)}
                </span>
              )}
              {meet.location && (
                <span className="font-body text-xs text-[var(--c-txt-5)]">{meet.location}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-body text-xs text-[var(--c-txt-5)] tabular-nums">
              {meet.row_count} results
            </span>
            <span className="font-body text-xs text-[var(--c-txt-5)] group-hover:text-[#ef4444] transition-colors">
              →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page (inner, uses useSearchParams)
// ---------------------------------------------------------------------------

function CalendarPageInner() {
  const searchParams = useSearchParams()
  const [discipline, setDiscipline] = useState<Discipline>('WAG')
  const [meets, setMeets] = useState<CalendarMeet[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedMeet, setSelectedMeet] = useState<string | null>(
    searchParams.get('meet')
  )

  const load = useCallback((disc: Discipline) => {
    setMeets(null)
    setError(null)
    fetchCalendar(disc)
      .then(setMeets)
      .catch(() => setError('Failed to load calendar.'))
  }, [])

  useEffect(() => {
    load(discipline)
  }, [discipline, load])

  const handleDiscipline = (disc: Discipline) => {
    setDiscipline(disc)
    setSelectedMeet(null)
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[var(--c-txt-0)] mb-1">Meet Calendar</h1>
        <p className="font-body text-sm text-[var(--c-txt-4)]">2026 season results by discipline</p>
      </div>

      {/* Discipline tabs */}
      <div className="flex gap-2 mb-8">
        {(['WAG', 'MAG'] as Discipline[]).map((d) => (
          <button
            key={d}
            onClick={() => handleDiscipline(d)}
            className="px-4 py-1.5 rounded-full font-body text-xs font-medium transition-colors"
            style={
              discipline === d
                ? { backgroundColor: '#dc2626', color: '#fff' }
                : {
                    backgroundColor: 'var(--c-bg-2)',
                    color: 'var(--c-txt-3)',
                    border: '1px solid var(--c-border-sm)',
                  }
            }
          >
            {d === 'WAG' ? 'Women' : 'Men'}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && <p className="font-body text-sm text-[#ef4444]">{error}</p>}

      {!meets && !error && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
          <span className="font-body text-sm text-[var(--c-txt-4)]">Loading calendar…</span>
        </div>
      )}

      {meets && !selectedMeet && (
        <MeetList meets={meets} onSelect={setSelectedMeet} />
      )}

      {meets && selectedMeet && (
        <MeetDetailView
          meetName={selectedMeet}
          discipline={discipline}
          onBack={() => setSelectedMeet(null)}
        />
      )}
    </main>
  )
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarPageInner />
    </Suspense>
  )
}

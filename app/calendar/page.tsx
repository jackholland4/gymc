'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchCalendar, fetchMeetDetail, fetchMeetResultsForGymnast, fetchCountries } from '@/lib/api'
import type { CalendarMeet, MeetDetail, MeetResultRow, Discipline, ScrapedMeetRow } from '@/types/simulation'

const ALL_APPARATUS = ['VT', 'UB', 'BB', 'FX', 'PH', 'SR', 'PB', 'HB'] as const
type AppKey = typeof ALL_APPARATUS[number]

const fmt = (v: number | null | undefined) => (v != null ? v.toFixed(3) : '—')

type Mode = 'calendar' | 'gymnast'
type SortKey = 'date-desc' | 'date-asc' | 'name' | 'results'

function sortMeets(meets: CalendarMeet[], sort: SortKey): CalendarMeet[] {
  switch (sort) {
    case 'date-asc': return [...meets].reverse()
    case 'name': return [...meets].sort((a, b) => a.meet_name.localeCompare(b.meet_name))
    case 'results': return [...meets].sort((a, b) => b.row_count - a.row_count)
    default: return meets
  }
}

function Spinner() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
      <span className="font-body text-sm text-[var(--c-txt-4)]">Loading…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pill button (shared)
// ---------------------------------------------------------------------------

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full font-body text-xs font-medium transition-colors"
      style={
        active
          ? { backgroundColor: '#dc2626', color: '#fff' }
          : { backgroundColor: 'var(--c-bg-2)', color: 'var(--c-txt-3)', border: '1px solid var(--c-border-sm)' }
      }
    >
      {children}
    </button>
  )
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

  const apparatus = discipline === 'MAG'
    ? ['FX', 'PH', 'SR', 'VT', 'PB', 'HB']
    : ['VT', 'UB', 'BB', 'FX']

  useEffect(() => {
    setDetail(null)
    setError(null)
    fetchMeetDetail(meetName, discipline)
      .then(setDetail)
      .catch(() => setError('Failed to load meet results.'))
  }, [meetName, discipline])

  return (
    <div>
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
      {!detail && !error && <Spinner />}

      {detail && (
        <div className="space-y-10">
          {Object.entries(detail.sections).map(([section, rows]) => (
            <SectionTable key={section} section={section} rows={rows} apparatus={apparatus} />
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
                <th key={a} className="text-right font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 px-2">{a}</th>
              ))}
              {hasAA && (
                <th className="text-right font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-2 pl-2">AA</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[var(--c-border-sm)] hover:bg-[var(--c-bg-1)] transition-colors">
                <td className="font-body text-xs text-[var(--c-txt-5)] py-2 pr-3 tabular-nums">{r.rank ?? i + 1}</td>
                <td className="font-body text-sm text-[var(--c-txt-0)] py-2 pr-3 min-w-[140px]">{r.gymnast ?? '—'}</td>
                {hasClub && (
                  <td className="font-body text-xs text-[var(--c-txt-3)] py-2 pr-3">{r.club ?? ''}</td>
                )}
                {appCols.map((a) => {
                  const val = r[a as keyof MeetResultRow] as number | null
                  return (
                    <td key={a} className="font-body text-xs text-[var(--c-txt-1)] py-2 px-2 text-right tabular-nums">
                      <span className={a === 'VT' && r.vt_sanctioned ? 'text-[var(--c-txt-0)] font-medium' : ''}>
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
// Gymnast lookup with autocomplete
// ---------------------------------------------------------------------------

type GymnastEntry = { name: string; noc: string; country: string }

function GymnastLookup({ onSelectMeet }: { onSelectMeet: (name: string) => void }) {
  const [index, setIndex] = useState<GymnastEntry[]>([])
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [rows, setRows] = useState<ScrapedMeetRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Build name index from both disciplines
  useEffect(() => {
    Promise.all([fetchCountries('WAG'), fetchCountries('MAG')])
      .then(([wag, mag]) => {
        const seen = new Set<string>()
        const all: GymnastEntry[] = []
        for (const c of [...wag, ...mag]) {
          for (const g of c.gymnasts) {
            const key = `${g.name}|${c.noc}`
            if (!seen.has(key)) {
              seen.add(key)
              all.push({ name: g.name, noc: c.noc, country: c.name })
            }
          }
        }
        all.sort((a, b) => a.name.localeCompare(b.name))
        setIndex(all)
      })
      .catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !dropdownRef.current?.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const suggestions: GymnastEntry[] = query.length >= 2
    ? index
        .filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
    : []

  const search = useCallback((name: string) => {
    const q = name.trim()
    if (!q) return
    setQuery(q)
    setSubmitted(q)
    setShowDropdown(false)
    setActiveIdx(-1)
    setLoading(true)
    setError(null)
    setRows(null)
    fetchMeetResultsForGymnast(q)
      .then((r) => { setRows(r); setLoading(false) })
      .catch(() => { setError('Search failed.'); setLoading(false) })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      search(suggestions[activeIdx].name)
    }
  }

  // Group results by meet_name, preserving order
  const meetOrder: string[] = []
  const byMeet: Record<string, ScrapedMeetRow[]> = {}
  for (const r of rows ?? []) {
    if (!byMeet[r.meet_name]) { byMeet[r.meet_name] = []; meetOrder.push(r.meet_name) }
    byMeet[r.meet_name].push(r)
  }

  return (
    <div>
      {/* Search input with autocomplete */}
      <div className="relative mb-6">
        <form onSubmit={(e) => {
          e.preventDefault()
          const target = activeIdx >= 0 ? suggestions[activeIdx]?.name : query
          search(target)
        }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowDropdown(true)
                  setActiveIdx(-1)
                }}
                onFocus={() => { if (query.length >= 2) setShowDropdown(true) }}
                onKeyDown={handleKeyDown}
                placeholder="Gymnast name…"
                className="w-full bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-2 font-body text-sm text-[var(--c-txt-0)] placeholder-[var(--c-txt-5)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors"
                autoComplete="off"
              />

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-[var(--c-border-lg)] shadow-xl overflow-hidden"
                  style={{ backgroundColor: 'var(--c-bg-1)' }}
                >
                  {suggestions.map((g, i) => (
                    <button
                      key={`${g.name}|${g.noc}`}
                      type="button"
                      onMouseDown={() => search(g.name)}
                      className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-4 transition-colors border-b border-[var(--c-border-sm)] last:border-0"
                      style={{
                        backgroundColor: i === activeIdx ? 'rgba(220,38,38,0.08)' : undefined,
                      }}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      <span className="font-body text-sm text-[var(--c-txt-0)]">{g.name}</span>
                      <span className="font-body text-xs text-[var(--c-txt-4)] shrink-0">{g.noc} · {g.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white font-body text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {loading && <Spinner />}
      {error && <p className="font-body text-sm text-[#ef4444]">{error}</p>}

      {rows && rows.length === 0 && (
        <p className="font-body text-sm text-[var(--c-txt-4)]">No results found for "{submitted}".</p>
      )}

      {/* Results grouped by meet */}
      {meetOrder.length > 0 && (
        <div className="space-y-8">
          {meetOrder.map((meetName) => {
            const meetRows = byMeet[meetName]
            const appCols = (ALL_APPARATUS as readonly string[]).filter((a) =>
              meetRows.some((r) => r[a as keyof ScrapedMeetRow] != null)
            )
            const hasAA = meetRows.some((r) => r.AA != null)

            return (
              <div key={meetName}>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => onSelectMeet(meetName)}
                    className="font-display text-sm font-semibold text-[var(--c-txt-0)] hover:text-[#ef4444] transition-colors text-left"
                  >
                    {meetName}
                  </button>
                  <span className="h-px flex-1 bg-[var(--c-border-sm)]" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--c-border-md)]">
                        <th className="text-left font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-1.5 pr-3">Section</th>
                        <th className="text-left font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-1.5 pr-3">Round</th>
                        {appCols.map((a) => (
                          <th key={a} className="text-right font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-1.5 px-2">{a}</th>
                        ))}
                        {hasAA && (
                          <th className="text-right font-body text-[11px] font-medium text-[var(--c-txt-5)] pb-1.5 pl-2">AA</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {meetRows.map((r, i) => (
                        <tr key={i} className="border-b border-[var(--c-border-sm)]">
                          <td className="font-body text-xs text-[var(--c-txt-3)] py-1.5 pr-3 max-w-[180px] truncate">{r.section ?? '—'}</td>
                          <td className="font-body text-xs text-[var(--c-txt-5)] py-1.5 pr-3">{r.round ?? '—'}</td>
                          {appCols.map((a) => (
                            <td key={a} className="font-body text-xs text-[var(--c-txt-1)] py-1.5 px-2 text-right tabular-nums">
                              {fmt(r[a as keyof ScrapedMeetRow] as number | null)}
                            </td>
                          ))}
                          {hasAA && (
                            <td className="font-body text-xs font-semibold text-[var(--c-txt-0)] py-1.5 pl-2 text-right tabular-nums">
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
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Meet list
// ---------------------------------------------------------------------------

function MeetList({
  meets,
  sort,
  onSelect,
  onSortChange,
}: {
  meets: CalendarMeet[]
  sort: SortKey
  onSelect: (meetName: string) => void
  onSortChange: (s: SortKey) => void
}) {
  const sorted = sortMeets(meets, sort)

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'date-desc', label: 'Newest' },
    { key: 'date-asc', label: 'Oldest' },
    { key: 'name', label: 'A–Z' },
    { key: 'results', label: 'Most results' },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="font-body text-xs text-[var(--c-txt-5)] mr-1">Sort</span>
        {sortOptions.map(({ key, label }) => (
          <Pill key={key} active={sort === key} onClick={() => onSortChange(key)}>
            {label}
          </Pill>
        ))}
      </div>
      {sorted.length === 0 ? (
        <p className="font-body text-sm text-[var(--c-txt-4)] py-8 text-center">No meets found.</p>
      ) : (
        <div className="divide-y divide-[var(--c-border-sm)]">
          {sorted.map((meet) => (
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
                    <span className="font-body text-xs text-[var(--c-txt-4)]">{meet.date_str}</span>
                  )}
                  {meet.location && (
                    <span className="font-body text-xs text-[var(--c-txt-5)]">{meet.location}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-body text-xs text-[var(--c-txt-5)] tabular-nums">{meet.row_count} results</span>
                <span className="font-body text-xs text-[var(--c-txt-5)] group-hover:text-[#ef4444] transition-colors">→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function CalendarPageInner() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('calendar')
  const [discipline, setDiscipline] = useState<Discipline>('WAG')
  const [meets, setMeets] = useState<CalendarMeet[] | null>(null)
  const [meetsError, setMeetsError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('date-desc')
  const [selectedMeet, setSelectedMeet] = useState<string | null>(searchParams.get('meet'))

  const load = useCallback((disc: Discipline) => {
    setMeets(null)
    setMeetsError(null)
    fetchCalendar(disc)
      .then(setMeets)
      .catch(() => setMeetsError('Failed to load calendar.'))
  }, [])

  useEffect(() => { load(discipline) }, [discipline, load])

  const handleDiscipline = (disc: Discipline) => {
    setDiscipline(disc)
    setSelectedMeet(null)
  }

  const handleSelectMeet = (name: string) => {
    setSelectedMeet(name)
    setMode('calendar')
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[var(--c-txt-0)] mb-1">Meet Calendar</h1>
        <p className="font-body text-sm text-[var(--c-txt-4)]">2026 season results by discipline</p>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        {/* Discipline */}
        {(['WAG', 'MAG'] as Discipline[]).map((d) => (
          <Pill key={d} active={discipline === d} onClick={() => handleDiscipline(d)}>
            {d === 'WAG' ? 'Women' : 'Men'}
          </Pill>
        ))}

        <span className="w-px h-4 bg-[var(--c-border-md)] mx-1" />

        {/* Mode */}
        <Pill active={mode === 'calendar'} onClick={() => { setMode('calendar'); setSelectedMeet(null) }}>
          Calendar
        </Pill>
        <Pill active={mode === 'gymnast'} onClick={() => setMode('gymnast')}>
          Gymnast Lookup
        </Pill>
      </div>

      {/* Calendar mode */}
      {mode === 'calendar' && (
        <>
          {meetsError && <p className="font-body text-sm text-[#ef4444]">{meetsError}</p>}
          {!meets && !meetsError && <Spinner />}

          {meets && !selectedMeet && (
            <MeetList meets={meets} sort={sort} onSelect={setSelectedMeet} onSortChange={setSort} />
          )}

          {meets && selectedMeet && (
            <MeetDetailView
              meetName={selectedMeet}
              discipline={discipline}
              onBack={() => setSelectedMeet(null)}
            />
          )}
        </>
      )}

      {/* Gymnast lookup mode */}
      {mode === 'gymnast' && (
        <GymnastLookup onSelectMeet={handleSelectMeet} />
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

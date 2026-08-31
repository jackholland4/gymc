'use client'

import { useEffect, useState } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import { useWorlds } from '../WorldsProvider'
import {
  fetchGymnastHistory,
  fetchGymnastPhoto,
  fetchMeetResultsForGymnast,
  fetchMeetResults,
} from '@/lib/api'
import type { GymnastHistory, ScrapedMeetRow } from '@/types/simulation'
import { APPARATUS_WAG, APPARATUS_MAG } from '@/types/simulation'

// ── Meet results drill-down ──────────────────────────────────────────────────

function MeetResultsView({
  meetName,
  onBack,
  apparatus,
}: {
  meetName: string
  onBack: () => void
  apparatus: readonly string[]
}) {
  const [rows, setRows] = useState<ScrapedMeetRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMeetResults(meetName)
      .then(setRows)
      .catch(() => setError('Failed to load meet results.'))
  }, [meetName])

  // Group by section
  const sections: Record<string, ScrapedMeetRow[]> = {}
  for (const r of rows ?? []) {
    const sec = r.section ?? 'Results'
    if (!sections[sec]) sections[sec] = []
    sections[sec].push(r)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--c-border-sm)] shrink-0">
        <button
          onClick={onBack}
          className="font-body text-xs text-[var(--c-txt-4)] hover:text-[#ef4444] transition-colors"
        >
          ← Back
        </button>
        <p className="font-display text-sm font-semibold text-[var(--c-txt-0)] truncate flex-1">{meetName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {error && <p className="font-body text-xs text-[#ef4444]">{error}</p>}

        {!rows && !error && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
            <span className="font-body text-xs text-[var(--c-txt-4)]">Loading…</span>
          </div>
        )}

        {Object.entries(sections).map(([section, srows]) => (
          <div key={section}>
            <p className="font-display text-xs font-semibold text-[#ef4444] uppercase tracking-widest mb-2">
              {section}
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--c-border-sm)]">
                  <th className="text-left font-body text-[10px] text-[var(--c-txt-5)] py-1 pr-2 font-medium">#</th>
                  <th className="text-left font-body text-[10px] text-[var(--c-txt-5)] py-1 pr-2 font-medium">Gymnast</th>
                  {apparatus.map((a) => (
                    <th key={a} className="text-right font-body text-[10px] text-[var(--c-txt-5)] py-1 px-1 font-medium">
                      {a}
                    </th>
                  ))}
                  <th className="text-right font-body text-[10px] text-[var(--c-txt-5)] py-1 pl-1 font-medium">AA</th>
                </tr>
              </thead>
              <tbody>
                {srows.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--c-border-sm)] hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    <td className="font-body text-[10px] text-[var(--c-txt-5)] py-1 pr-2 tabular-nums">{r.rank ?? i + 1}</td>
                    <td className="font-body text-xs text-[var(--c-txt-2)] py-1 pr-2 truncate max-w-[110px]">{r.gymnast ?? '—'}</td>
                    {apparatus.map((a) => {
                      const val = (r as unknown as Record<string, unknown>)[a] as number | null
                      return (
                        <td key={a} className="font-body text-[10px] text-[var(--c-txt-3)] py-1 px-1 text-right tabular-nums">
                          {val != null ? val.toFixed(3) : '—'}
                        </td>
                      )
                    })}
                    <td className="font-body text-[10px] text-[var(--c-txt-3)] py-1 pl-1 text-right tabular-nums">
                      {r.AA != null ? r.AA.toFixed(3) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Gymnast history view ─────────────────────────────────────────────────────

function HistoryView({
  noc,
  name,
  discipline,
  apparatus,
  onViewMeet,
}: {
  noc: string
  name: string
  discipline: string
  apparatus: readonly string[]
  onViewMeet: (meetName: string) => void
}) {
  const [history, setHistory] = useState<GymnastHistory | null>(null)
  const [scraped, setScraped] = useState<ScrapedMeetRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHistory(null)
    setScraped(null)
    setError(null)

    Promise.all([
      fetchGymnastHistory(noc, name, discipline as 'WAG' | 'MAG'),
      fetchMeetResultsForGymnast(name),
    ])
      .then(([h, s]) => {
        setHistory(h)
        setScraped(s)
      })
      .catch(() => setError('Failed to load scoring history.'))
  }, [noc, name, discipline])

  // Group scraped rows by meet
  const scrapedMeets: Record<string, ScrapedMeetRow[]> = {}
  for (const r of scraped ?? []) {
    if (!scrapedMeets[r.meet_name]) scrapedMeets[r.meet_name] = []
    scrapedMeets[r.meet_name].push(r)
  }

  if (error) return <p className="px-5 py-4 font-body text-xs text-[#ef4444]">{error}</p>

  if (!history) {
    return (
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="w-4 h-4 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
        <span className="font-body text-xs text-[var(--c-txt-4)]">Loading history…</span>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 space-y-6">
      {/* Per-apparatus summary */}
      <div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#ef4444] mb-3">
          Summary
        </p>
        <div className="grid grid-cols-2 gap-2">
          {apparatus.map((app) => {
            const appComps = history.competitions.flatMap((c) =>
              c.scores.filter((s) => s.apparatus === app && s.score != null)
            )
            if (appComps.length === 0) return null
            const scores = appComps.map((s) => s.score as number)
            const mean = scores.reduce((a, b) => a + b, 0) / scores.length
            const high = Math.max(...scores)
            const low = Math.min(...scores)
            return (
              <div
                key={app}
                className="bg-[var(--c-bg-1)] border border-[var(--c-border-sm)] rounded-lg p-2.5"
              >
                <p className="font-display text-[10px] font-semibold text-[#ef4444] mb-1">{app}</p>
                <p className="font-body text-sm font-semibold text-[var(--c-txt-0)] tabular-nums">
                  {mean.toFixed(3)}
                </p>
                <p className="font-body text-[10px] text-[var(--c-txt-5)] tabular-nums mt-0.5">
                  {low.toFixed(3)} – {high.toFixed(3)} · n={scores.length}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Competition history from scoring data */}
      <div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#ef4444] mb-3">
          Competition History
        </p>
        {history.competitions.length === 0 ? (
          <p className="font-body text-xs text-[var(--c-txt-5)]">No competition data.</p>
        ) : (
          <div className="space-y-2">
            {history.competitions.map((comp, i) => (
              <div
                key={i}
                className="bg-[var(--c-bg-1)] border border-[var(--c-border-sm)] rounded-lg p-3"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-body text-xs text-[var(--c-txt-2)] font-medium truncate flex-1 pr-2">
                    {comp.competition ?? 'Unknown Meet'}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {comp.aa != null && (
                      <span className="font-body text-xs font-semibold text-[var(--c-txt-0)] tabular-nums">
                        {comp.aa.toFixed(3)}
                      </span>
                    )}
                    {comp.date && (
                      <span className="font-body text-[10px] text-[var(--c-txt-5)]">{comp.date}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {comp.scores.map((s, j) => (
                    <div key={j} className="text-center">
                      <p className="font-body text-[10px] text-[var(--c-txt-4)]">
                        {s.apparatus}
                        {s.round ? ` · ${s.round}` : ''}
                      </p>
                      <p className="font-body text-xs text-[var(--c-txt-2)] tabular-nums">
                        {s.score?.toFixed(3) ?? '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scraped meet appearances */}
      {Object.keys(scrapedMeets).length > 0 && (
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#ef4444] mb-3">
            Live Results
          </p>
          <div className="space-y-2">
            {Object.entries(scrapedMeets).map(([meetName, rows]) => {
              const r = rows[0]
              return (
                <button
                  key={meetName}
                  onClick={() => onViewMeet(meetName)}
                  className="w-full text-left bg-[var(--c-bg-1)] border border-[var(--c-border-sm)] hover:border-[rgba(220,38,38,0.3)] hover:bg-[rgba(220,38,38,0.04)] rounded-lg p-3 transition-all"
                >
                  <p className="font-body text-xs text-[var(--c-txt-2)] font-medium mb-1 truncate">{meetName}</p>
                  <div className="flex gap-3 flex-wrap">
                    {apparatus.map((a) => {
                      const val = (r as unknown as Record<string, unknown>)[a] as number | null
                      return val != null ? (
                        <span key={a} className="font-body text-[10px] text-[var(--c-txt-3)] tabular-nums">
                          {a} {val.toFixed(3)}
                        </span>
                      ) : null
                    })}
                    {r.rank != null && (
                      <span className="font-body text-[10px] text-[var(--c-txt-5)]">Rank {r.rank}</span>
                    )}
                  </div>
                  <p className="font-body text-[10px] text-[#ef4444] mt-1.5">
                    View full results →
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Panel shell ──────────────────────────────────────────────────────────────

const NOC_TO_ISO: Record<string, string> = {
  ALG: 'DZ', ARG: 'AR', AUS: 'AU', AUT: 'AT', AZE: 'AZ',
  BEL: 'BE', BLR: 'BY', BRA: 'BR', BUL: 'BG',
  CAN: 'CA', CHN: 'CN', COL: 'CO', CRO: 'HR', CZE: 'CZ',
  DEN: 'DK', EGY: 'EG', ESP: 'ES', FIN: 'FI', FRA: 'FR',
  GBR: 'GB', GER: 'DE', GRE: 'GR', HKG: 'HK', HUN: 'HU',
  INA: 'ID', IND: 'IN', IRL: 'IE', ISL: 'IS', ISR: 'IL', ITA: 'IT',
  JPN: 'JP', KAZ: 'KZ', KOR: 'KR', MAS: 'MY', MEX: 'MX',
  NED: 'NL', NGR: 'NG', NOR: 'NO', NZL: 'NZ',
  PAN: 'PA', PHI: 'PH', POL: 'PL', POR: 'PT', PRK: 'KP',
  ROM: 'RO', RSA: 'ZA', RUS: 'RU',
  SGP: 'SG', SLO: 'SI', SRI: 'LK', SUI: 'CH', SVK: 'SK', SWE: 'SE',
  TPE: 'TW', TUR: 'TR', UKR: 'UA', USA: 'US', UZB: 'UZ',
  VEN: 'VE',
}

function NocFlag({ noc }: { noc: string }) {
  const iso = NOC_TO_ISO[noc.toUpperCase()]
  if (!iso) return null
  const Flag = Flags[iso as keyof typeof Flags]
  if (!Flag) return null
  return <Flag title={noc} style={{ width: 22, borderRadius: 2 }} className="shrink-0" />
}

function OlympicRings() {
  return (
    <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Olympian" className="shrink-0">
      {/* Top row: blue, grey (was black — visible on both themes), red */}
      <circle cx="6"   cy="7"  r="5" stroke="#0081C8" strokeWidth="2" fill="none" />
      <circle cx="18"  cy="7"  r="5" stroke="currentColor" strokeWidth="2" fill="none" strokeOpacity="0.5" />
      <circle cx="30"  cy="7"  r="5" stroke="#EE334E" strokeWidth="2" fill="none" />
      {/* Bottom row: yellow, green */}
      <circle cx="12"  cy="15" r="5" stroke="#FCB131" strokeWidth="2" fill="none" />
      <circle cx="24"  cy="15" r="5" stroke="#00A651" strokeWidth="2" fill="none" />
    </svg>
  )
}

function SeedBadge({ seed, total, apparatus_percentiles, apparatus }: {
  seed: number
  total: number
  apparatus_percentiles: Partial<Record<string, number>>
  apparatus: readonly string[]
}) {
  const gridCols = apparatus.length <= 4 ? 'grid-cols-4' : 'grid-cols-6'
  return (
    <div className="mx-5 mb-4 bg-[var(--c-bg-1)] border border-[var(--c-border-sm)] rounded-lg px-3 py-2.5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#ef4444]">
          World Seed
        </span>
        <span className="font-display text-lg font-bold text-[var(--c-txt-0)] tabular-nums">
          #{seed}
          <span className="font-body text-[10px] text-[var(--c-txt-5)] ml-1">/ {total}</span>
        </span>
      </div>
      <div className={`grid ${gridCols} gap-1`}>
        {apparatus.map((app) => {
          const pct = apparatus_percentiles[app]
          if (pct == null) return (
            <div key={app} className="text-center">
              <p className="font-body text-[9px] text-[var(--c-txt-6)]">{app}</p>
              <p className="font-body text-[10px] text-[var(--c-txt-6)]">—</p>
            </div>
          )
          const fill = Math.round(pct * 100)
          return (
            <div key={app} className="text-center">
              <p className="font-body text-[9px] text-[var(--c-txt-4)] mb-0.5">{app}</p>
              <div className="h-1 rounded-full bg-[var(--c-bg-7)] overflow-hidden mb-0.5">
                <div className="h-full rounded-full" style={{ width: `${fill}%`, backgroundColor: '#dc2626' }} />
              </div>
              <p className="font-body text-[9px] text-[var(--c-txt-3)] tabular-nums">{fill}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GymnastPanel() {
  const [state, dispatch] = useWorlds()
  const [viewMeet, setViewMeet] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isOlympian, setIsOlympian] = useState(false)
  const [birthYear, setBirthYear] = useState<number | null>(null)

  const { openGymnast, discipline, seeds } = state
  const seedTotal = seeds?.length ?? 0
  const apparatus = discipline === 'MAG' ? APPARATUS_MAG : APPARATUS_WAG

  // Reset on gymnast change
  useEffect(() => {
    setViewMeet(null)
    setPhotoUrl(null)
    setIsOlympian(false)
    setBirthYear(null)
    if (!openGymnast) return
    fetchGymnastPhoto(openGymnast.noc, openGymnast.name)
      .then((r) => {
        setPhotoUrl(r.photo_url)
        setIsOlympian(r.is_olympian)
        setBirthYear(r.birth_year ?? null)
      })
      .catch(() => {})
  }, [openGymnast?.noc, openGymnast?.name])

  if (!openGymnast) return null

  const { noc, name } = openGymnast
  const seedEntry = seeds?.find((s) => s.gymnast === name && s.noc === noc) ?? null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => dispatch({ type: 'CLOSE_GYMNAST' })}
      />

      {/* Panel — single scroll container; photo is sticky-behind, content slides over it */}
      <div className="fixed top-16 right-0 bottom-0 z-50 w-[420px] bg-[var(--c-bg-6)] border-l border-[var(--c-border-md)] overflow-y-auto shadow-2xl">

        {/* Photo — sticky at top with low z-index; content scrolls over it */}
        {photoUrl && (
          <div className="sticky top-0 w-full aspect-square relative overflow-hidden" style={{ zIndex: 0 }}>
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover object-center grayscale"
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--c-bg-6)] via-[var(--c-bg-6)]/30 to-transparent" />
          </div>
        )}

        {/* Content — opaque background so it covers the photo as it scrolls up */}
        <div className="relative bg-[var(--c-bg-6)]" style={{ zIndex: 1 }}>
          {/* Name row — sticky within content */}
          <div className="sticky top-0 bg-[var(--c-bg-6)] flex items-center gap-3 px-5 py-3 border-b border-[var(--c-border-sm)]" style={{ zIndex: 2 }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <p className="font-display text-base font-bold text-[var(--c-txt-0)] truncate">{name}</p>
                <NocFlag noc={noc} />
                {isOlympian && <OlympicRings />}
              </div>
              <p className="font-body text-xs text-[var(--c-txt-4)]">{noc}{birthYear ? ` | ${birthYear}` : ''}</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'CLOSE_GYMNAST' })}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--c-txt-5)] hover:text-[var(--c-txt-0)] hover:bg-[var(--c-border-sm)] transition-colors shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body content */}
          {viewMeet ? (
            <MeetResultsView meetName={viewMeet} onBack={() => setViewMeet(null)} apparatus={apparatus} />
          ) : (
            <>
              {seedEntry && (
                <div className="pt-4">
                  <SeedBadge
                    seed={seedEntry.seed}
                    total={seedTotal}
                    apparatus_percentiles={seedEntry.apparatus_percentiles}
                    apparatus={apparatus}
                  />
                </div>
              )}
              <HistoryView noc={noc} name={name} discipline={discipline} apparatus={apparatus} onViewMeet={setViewMeet} />
            </>
          )}
        </div>
      </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useWorlds } from '../WorldsProvider'
import {
  fetchGymnastHistory,
  fetchMeetResultsForGymnast,
  fetchMeetResults,
} from '@/lib/api'
import type { GymnastHistory, ScrapedMeetRow } from '@/types/simulation'

const APPARATUS = ['VT', 'UB', 'BB', 'FX'] as const

// ── Meet results drill-down ──────────────────────────────────────────────────

function MeetResultsView({
  meetName,
  onBack,
}: {
  meetName: string
  onBack: () => void
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
                  {APPARATUS.map((a) => (
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
                    {APPARATUS.map((a) => (
                      <td key={a} className="font-body text-[10px] text-[var(--c-txt-3)] py-1 px-1 text-right tabular-nums">
                        {r[a] != null ? (r[a] as number).toFixed(3) : '—'}
                      </td>
                    ))}
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
  onViewMeet,
}: {
  noc: string
  name: string
  discipline: string
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
          {APPARATUS.map((app) => {
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
                    {APPARATUS.map((a) =>
                      r[a] != null ? (
                        <span key={a} className="font-body text-[10px] text-[var(--c-txt-3)] tabular-nums">
                          {a} {(r[a] as number).toFixed(3)}
                        </span>
                      ) : null
                    )}
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

export function GymnastPanel() {
  const [state, dispatch] = useWorlds()
  const [viewMeet, setViewMeet] = useState<string | null>(null)

  // Reset drill-down when gymnast changes
  useEffect(() => {
    setViewMeet(null)
  }, [state.openGymnast?.name])

  if (!state.openGymnast) return null

  const { noc, name } = state.openGymnast
  const { discipline } = state

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => dispatch({ type: 'CLOSE_GYMNAST' })}
      />

      {/* Panel */}
      <div className="fixed top-16 right-0 bottom-0 z-50 w-[420px] bg-[var(--c-bg-6)] border-l border-[var(--c-border-md)] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--c-border-sm)] shrink-0">
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-bold text-[var(--c-txt-0)] truncate">{name}</p>
            <p className="font-body text-xs text-[var(--c-txt-4)]">{noc}</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_GYMNAST' })}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--c-txt-5)] hover:text-[var(--c-txt-0)] hover:bg-[var(--c-border-sm)] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMeet ? (
            <MeetResultsView meetName={viewMeet} onBack={() => setViewMeet(null)} />
          ) : (
            <HistoryView noc={noc} name={name} discipline={discipline} onViewMeet={setViewMeet} />
          )}
        </div>
      </div>
    </>
  )
}

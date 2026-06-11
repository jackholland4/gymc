'use client'

import { useEffect, useState, useMemo } from 'react'
import { useWorlds } from '../WorldsProvider'
import { fetchTopCandidates } from '@/lib/api'
import type { CandidateResult, TopCandidatesResponse, Apparatus, LineupConfig } from '@/types/simulation'

const APPARATUS: Apparatus[] = ['VT', 'UB', 'BB', 'FX']

function buildLineups(
  selected: string[],
  candidates: CandidateResult[]
): LineupConfig {
  const quals: Record<string, string[]> = {}
  const teamFinal: Record<string, string[]> = {}
  for (const app of APPARATUS) {
    const ranked = selected
      .filter((name) => {
        const c = candidates.find((c) => c.gymnast === name)
        return c && c.apparatus_means[app] != null
      })
      .sort((a, b) => {
        const ca = candidates.find((c) => c.gymnast === a)!
        const cb = candidates.find((c) => c.gymnast === b)!
        return (cb.apparatus_means[app] ?? 0) - (ca.apparatus_means[app] ?? 0)
      })
    quals[app] = ranked.slice(0, 4)
    teamFinal[app] = ranked.slice(0, 3)
  }
  return {
    team: selected,
    quals: quals as Record<Apparatus, string[]>,
    teamFinal: teamFinal as Record<Apparatus, string[]>,
  }
}

function MiniBar({ pct, max = 100 }: { pct: number; max?: number }) {
  const fill = Math.round((pct / max) * 100)
  return (
    <div className="w-12 h-1.5 rounded-full bg-[#222] overflow-hidden shrink-0">
      <div
        className="h-full rounded-full"
        style={{ width: `${fill}%`, backgroundColor: '#dc2626' }}
      />
    </div>
  )
}

function ExpandedDetail({ c, allMeanTotal }: { c: CandidateResult; allMeanTotal: number }) {
  return (
    <div className="mt-1 mb-2 mx-1 rounded-lg bg-[#111] border border-[rgba(255,255,255,0.06)] px-3 py-2.5 space-y-2">
      <div className="grid grid-cols-4 gap-1">
        {APPARATUS.map((app) => {
          const mean = c.apparatus_means[app]
          const max = c.apparatus_maxes[app]
          const n = c.apparatus_counts[app]
          return (
            <div key={app} className="text-center">
              <p className={`font-body text-[10px] font-semibold mb-0.5 ${mean != null ? 'text-[#ef4444]' : 'text-[#444]'}`}>
                {app}
              </p>
              {mean != null ? (
                <>
                  <p className="font-body text-xs text-[#c0c0c0] tabular-nums">{mean.toFixed(3)}</p>
                  <p className="font-body text-[9px] text-[#555] tabular-nums">↑{max!.toFixed(3)}</p>
                  <p className="font-body text-[9px] text-[#444]">n={n}</p>
                </>
              ) : (
                <p className="font-body text-[10px] text-[#333]">—</p>
              )}
            </div>
          )
        })}
      </div>
      <div className="border-t border-[rgba(255,255,255,0.05)] pt-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="font-body text-[10px] text-[#555]">On team avg</span>
          <span className="font-body text-[10px] text-[#888] tabular-nums">{c.mean_team_total_included.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-body text-[10px] text-[#555]">Off team avg</span>
          <span className="font-body text-[10px] text-[#888] tabular-nums">{c.mean_team_total_excluded.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-body text-[10px] text-[#ef4444]">Marginal value</span>
          <span className={`font-body text-[10px] tabular-nums font-semibold ${c.marginal_value >= 0 ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
            {c.marginal_value >= 0 ? '+' : ''}{c.marginal_value.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TopCandidatesPanel({ noc }: { noc: string }) {
  const [, dispatch] = useWorlds()
  const [data, setData] = useState<TopCandidatesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setData(null)
    setSelected(new Set())
    setExpanded(null)
    setError(null)
    setLoading(true)
    fetchTopCandidates(noc, 1000)
      .then((d) => {
        setData(d)
        setSelected(new Set(d.default_team))
      })
      .catch(() => setError('Failed to compute team rankings.'))
      .finally(() => setLoading(false))
  }, [noc])

  // Dispatch lineup whenever selection changes and data is ready
  useEffect(() => {
    if (!data) return
    const sel = Array.from(selected)
    const lineup = buildLineups(sel, data.candidates)
    dispatch({ type: 'SET_LINEUP', noc, lineup })
  }, [selected, data, noc, dispatch])

  const meanTeamTotal = useMemo(() => {
    if (!data || selected.size !== 5) return null
    let total = 0
    for (const app of APPARATUS) {
      const scores = Array.from(selected)
        .map((name) => data.candidates.find((c) => c.gymnast === name)?.apparatus_means[app])
        .filter((s): s is number => s != null)
        .sort((a, b) => b - a)
        .slice(0, 3)
      if (scores.length < 3) return null
      total += scores.reduce((a, b) => a + b, 0)
    }
    return total
  }, [data, selected])

  const cannotField = useMemo(() => {
    if (!data || selected.size !== 5) return null
    for (const app of APPARATUS) {
      const count = Array.from(selected).filter(
        (name) => (data.candidates.find((c) => c.gymnast === name)?.apparatus_means[app] ?? null) != null
      ).length
      if (count < 3) return app
    }
    return null
  }, [data, selected])

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else if (next.size < 5) {
        next.add(name)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="font-body text-xs text-[#666]">Running {(1000).toLocaleString()} simulations…</span>
        </div>
        {/* skeleton rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-[#141414] animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="px-4 py-3 font-body text-xs text-[#ef4444]">{error}</p>
  }

  if (!data) return null

  const maxPct = data.candidates[0]?.team_value_pct ?? 100

  return (
    <div className="px-3 pb-3 space-y-0.5">
      {/* meta */}
      <p className="font-body text-[10px] text-[#444] px-1 pb-1">
        {data.n_sims.toLocaleString()} Monte Carlo trials · {data.roster_size} gymnasts
      </p>

      {data.candidates.map((c, i) => {
        const isSelected = selected.has(c.gymnast)
        const isExpanded = expanded === c.gymnast
        const atLimit = selected.size >= 5 && !isSelected
        const showDivider = i === 5

        return (
          <div key={c.gymnast}>
            {showDivider && (
              <div className="border-t border-[rgba(255,255,255,0.06)] my-1.5" />
            )}
            <div
              className={[
                'rounded-lg transition-all',
                isSelected
                  ? 'bg-[rgba(220,38,38,0.07)] border border-[rgba(220,38,38,0.2)]'
                  : 'border border-transparent hover:bg-[rgba(255,255,255,0.02)]',
                i >= 5 ? 'opacity-70' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                {/* checkbox */}
                <button
                  onClick={() => toggle(c.gymnast)}
                  disabled={atLimit}
                  className={`shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${atLimit ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    border: isSelected ? 'none' : '1px solid #444',
                    backgroundColor: isSelected ? '#dc2626' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg width="7" height="5" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* rank */}
                <span className="font-body text-[10px] text-[#444] tabular-nums w-3 shrink-0">{i + 1}</span>

                {/* name */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : c.gymnast)}
                  className="flex-1 min-w-0 text-left"
                >
                  <span className={`font-body text-xs truncate block ${isSelected ? 'text-[#e0e0e0]' : 'text-[#888]'}`}>
                    {c.gymnast}
                  </span>
                </button>

                {/* bar + pct */}
                <div className="flex items-center gap-1 shrink-0">
                  <MiniBar pct={c.team_value_pct} max={maxPct} />
                  <span className="font-body text-[10px] text-[#666] tabular-nums w-8 text-right">
                    {c.team_value_pct.toFixed(0)}%
                  </span>
                </div>

                {/* type badge */}
                <span className={`font-body text-[9px] px-1 py-0.5 rounded shrink-0 ${c.is_specialist ? 'bg-[rgba(251,191,36,0.1)] text-[#fbbf24]' : 'bg-[#1a1a1a] text-[#555]'}`}>
                  {c.apparatus_label}
                </span>
              </div>

              {isExpanded && (
                <ExpandedDetail c={c} allMeanTotal={data.candidates[0]?.mean_team_total_included ?? 0} />
              )}
            </div>
          </div>
        )
      })}

      {/* footer */}
      <div className="pt-2 px-1 space-y-1">
        {cannotField && (
          <p className="font-body text-[10px] text-[#ef4444]">
            Can&apos;t field 3 on {cannotField} — swap a specialist
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className={`font-body text-[10px] ${selected.size === 5 ? 'text-[#666]' : 'text-[#ef4444]'}`}>
            {selected.size}/5 selected
          </span>
          {meanTeamTotal != null && !cannotField && (
            <span className="font-body text-[10px] text-[#555] tabular-nums">
              est. {meanTeamTotal.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={() => setSelected(new Set(data.default_team))}
          className="font-body text-[10px] text-[#555] hover:text-[#888] transition-colors"
        >
          Reset to default
        </button>
      </div>
    </div>
  )
}

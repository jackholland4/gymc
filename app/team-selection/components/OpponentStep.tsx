'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTeamSelection } from '../TeamSelectionProvider'
import { GymnastPicker } from './GymnastPicker'
import { optimizeTeam } from '@/lib/api'

const NOC_FLAGS: Record<string, string> = {
  USA: '🇺🇸', CHN: '🇨🇳', GBR: '🇬🇧', RUS: '🇷🇺', JPN: '🇯🇵',
  FRA: '🇫🇷', AUS: '🇦🇺', ITA: '🇮🇹', GER: '🇩🇪', ROU: '🇷🇴',
  NED: '🇳🇱', BRA: '🇧🇷', CAN: '🇨🇦', KOR: '🇰🇷', BEL: '🇧🇪',
  ALG: '🇩🇿', ISR: '🇮🇱', UKR: '🇺🇦', IRL: '🇮🇪', NZL: '🇳🇿',
}

function flag(noc: string) { return NOC_FLAGS[noc] ?? '' }

// ---------------------------------------------------------------------------
// National team picker sub-step
// ---------------------------------------------------------------------------

function NationalPicker() {
  const [state, dispatch] = useTeamSelection()
  const [query, setQuery] = useState('')

  const teamCountries = useMemo(
    () => state.countries.filter(c => c.is_team_country),
    [state.countries]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return teamCountries.filter(c =>
      c.name.toLowerCase().includes(q) || c.noc.toLowerCase().includes(q)
    )
  }, [teamCountries, query])

  async function selectNoc(noc: string) {
    dispatch({ type: 'SET_NOC_B', noc })
    try {
      const result = await optimizeTeam(noc, 5, state.discipline)
      dispatch({ type: 'SET_NOC_B_OPTIMIZED', result })
    } catch {}
    dispatch({ type: 'SET_STEP', step: 'lineup' })
  }

  return (
    <div className="max-w-md mx-auto py-12 px-6 space-y-6">
      <div>
        <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626] mb-1">
          Opponent
        </p>
        <h2 className="font-display text-2xl font-bold text-[var(--c-txt-0)]">
          Select National Team
        </h2>
      </div>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search country…"
        className="w-full bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-2.5 text-sm font-body text-[var(--c-txt-0)] placeholder:text-[var(--c-txt-5)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors"
      />

      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {filtered.map(c => (
          <button
            key={c.noc}
            onClick={() => selectNoc(c.noc)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
            style={{
              backgroundColor: state.nocB === c.noc ? 'rgba(220,38,38,0.08)' : 'var(--c-bg-2)',
              borderColor: state.nocB === c.noc ? '#dc2626' : 'var(--c-border-md)',
            }}
          >
            <span className="text-xl">{flag(c.noc)}</span>
            <div>
              <p className="font-body text-sm font-semibold text-[var(--c-txt-1)]">{c.name}</p>
              <p className="font-body text-xs text-[var(--c-txt-4)]">{c.noc} · {c.gymnasts.length} gymnasts</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_STEP', step: 'team-a' })}
        className="font-body text-xs text-[var(--c-txt-4)] hover:text-[var(--c-txt-1)] transition-colors"
      >
        ← Back
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// World-at-large info sub-step
// ---------------------------------------------------------------------------

function WorldInfo() {
  const [state, dispatch] = useTeamSelection()
  const teamCount = state.countries.filter(c => c.is_team_country).length

  return (
    <div className="max-w-md mx-auto py-12 px-6 space-y-6">
      <div>
        <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626] mb-1">
          Benchmark
        </p>
        <h2 className="font-display text-2xl font-bold text-[var(--c-txt-0)]">World Field</h2>
      </div>

      <div
        className="rounded-xl p-5 space-y-3"
        style={{ backgroundColor: 'var(--c-bg-2)', border: '1px solid var(--c-border-md)' }}
      >
        <p className="font-body text-sm text-[var(--c-txt-1)] leading-relaxed">
          Your custom team will be inserted into the full Worlds simulation field alongside{' '}
          <span className="font-semibold text-[var(--c-txt-0)]">{teamCount} national teams</span>.
          Results show how often your team qualifies for team final, average rank, and placement
          distribution — the same analytics as the Simulate tab.
        </p>
        <div
          className="rounded-lg px-3 py-2"
          style={{ backgroundColor: 'var(--c-bg-4)', border: '1px solid var(--c-border-sm)' }}
        >
          <p className="font-body text-xs text-[var(--c-txt-3)]">
            Discipline: <span className="font-semibold text-[var(--c-txt-1)]">{state.discipline}</span>
            {' · '}Score filter:{' '}
            <span className="font-semibold text-[var(--c-txt-1)]">
              {state.scoreFilter.excludeDomestic || state.scoreFilter.excludeNonFig
                ? [state.scoreFilter.excludeDomestic && 'No domestic', state.scoreFilter.excludeNonFig && 'FIG only'].filter(Boolean).join(', ')
                : 'All meets'}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'team-a' })}
          className="flex-1 py-2.5 rounded-xl font-body text-sm border transition-colors"
          style={{ borderColor: 'var(--c-border-lg)', color: 'var(--c-txt-3)' }}
        >
          ← Back
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'lineup' })}
          className="flex-1 py-2.5 rounded-xl font-body text-sm font-semibold transition-all"
          style={{ backgroundColor: '#dc2626', color: '#fff' }}
        >
          Set Lineup →
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main OpponentStep — routes to sub-step based on benchmarkType
// ---------------------------------------------------------------------------

export function OpponentStep() {
  const [state] = useTeamSelection()

  if (state.benchmarkType === 'world') return <WorldInfo />
  if (state.benchmarkType === 'national') return <NationalPicker />
  return (
    <GymnastPicker
      team="b"
      roster={state.rosterB}
      nextStep="lineup"
      nextLabel="Set Lineups"
      backStep="team-a"
    />
  )
}

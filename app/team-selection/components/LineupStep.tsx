'use client'

import { useState, useEffect } from 'react'
import { useTeamSelection } from '../TeamSelectionProvider'
import type { Apparatus } from '@/types/simulation'
import { optimizeCustomTeam, optimizeTeam, runMatchupBatch, runWorldSimBatch } from '@/lib/api'
import type { TeamLineup } from '../TeamSelectionProvider'

// ---------------------------------------------------------------------------
// LineupRow — per-apparatus gymnast assignment
// ---------------------------------------------------------------------------

function LineupRow({
  apparatus,
  gymnasts,
  roster,
  max,
  onAdd,
  onRemove,
}: {
  apparatus: Apparatus
  gymnasts: string[]
  roster: string[]
  max: number
  onAdd: (g: string) => void
  onRemove: (g: string) => void
}) {
  const [open, setOpen] = useState(false)
  const available = roster.filter(g => !gymnasts.includes(g))

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-semibold text-[var(--c-txt-4)] uppercase tracking-wider">
          {apparatus}
        </span>
        <span className="font-body text-xs text-[var(--c-txt-6)]">{gymnasts.length}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {gymnasts.map(g => (
          <span
            key={g}
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-body text-xs"
            style={{ backgroundColor: 'var(--c-bg-3)', border: '1px solid var(--c-border-md)', color: 'var(--c-txt-2)' }}
          >
            {g}
            <button
              onClick={() => onRemove(g)}
              className="text-[var(--c-txt-5)] hover:text-[#ef4444] leading-none transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        {gymnasts.length < max && available.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setOpen(v => !v)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-md font-body text-sm leading-none transition-colors"
              style={{ backgroundColor: 'var(--c-bg-3)', border: '1px solid var(--c-border-md)', color: 'var(--c-txt-4)' }}
            >
              +
            </button>
            {open && (
              <div className="absolute left-0 top-6 z-50 min-w-[160px] rounded-lg shadow-xl overflow-hidden"
                style={{ backgroundColor: 'var(--c-bg-2)', border: '1px solid var(--c-border-lg)' }}>
                {available.map(g => (
                  <button
                    key={g}
                    onClick={() => { onAdd(g); setOpen(false) }}
                    className="w-full text-left px-3 py-1.5 font-body text-xs transition-colors"
                    style={{ color: 'var(--c-txt-2)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TeamLineupEditor — one team's lineup section
// ---------------------------------------------------------------------------

function TeamLineupEditor({
  label,
  roster,
  lineup,
  apparatus,
  onUpdate,
  onOptimize,
  isOptimizing,
  readOnly = false,
}: {
  label: string
  roster: string[]
  lineup: TeamLineup | null
  apparatus: Apparatus[]
  onUpdate: (lineup: TeamLineup) => void
  onOptimize: () => void
  isOptimizing: boolean
  readOnly?: boolean
}) {
  const tf = lineup?.teamFinal ?? {}

  function addToApp(app: Apparatus, gymnast: string) {
    const current = (tf[app] ?? []).slice()
    if (!current.includes(gymnast)) {
      onUpdate({ teamFinal: { ...tf, [app]: [...current, gymnast] }, quals: lineup?.quals ?? {} })
    }
  }

  function removeFromApp(app: Apparatus, gymnast: string) {
    const current = (tf[app] ?? []).filter(g => g !== gymnast)
    onUpdate({ teamFinal: { ...tf, [app]: current }, quals: lineup?.quals ?? {} })
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--c-border-md)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--c-border-sm)]"
        style={{ backgroundColor: 'var(--c-bg-5)' }}>
        <p className="font-display text-sm font-semibold text-[var(--c-txt-0)]">{label}</p>
        {!readOnly && (
          <button
            onClick={onOptimize}
            disabled={isOptimizing || roster.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold border transition-all disabled:opacity-40"
            style={{ borderColor: '#dc2626', color: '#ef4444' }}
          >
            {isOptimizing ? (
              <><div className="w-3 h-3 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />Optimizing…</>
            ) : 'Find Optimal'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4" style={{ backgroundColor: 'var(--c-bg-1)' }}>
        {lineup === null ? (
          <p className="font-body text-xs text-[var(--c-txt-5)] text-center py-4">
            {readOnly ? 'Loading…' : 'Click "Find Optimal" or assign gymnasts manually below.'}
          </p>
        ) : (
          apparatus.map(app => (
            <LineupRow
              key={app}
              apparatus={app}
              gymnasts={tf[app] ?? []}
              roster={roster}
              max={3}
              onAdd={g => addToApp(app, g)}
              onRemove={g => removeFromApp(app, g)}
            />
          ))
        )}
        {!lineup && !readOnly && (
          apparatus.map(app => (
            <LineupRow
              key={app}
              apparatus={app}
              gymnasts={[]}
              roster={roster}
              max={3}
              onAdd={g => addToApp(app, g)}
              onRemove={g => removeFromApp(app, g)}
            />
          ))
        )}
      </div>

      {/* Roster pills */}
      <div className="px-4 pb-3 pt-1 border-t border-[var(--c-border-sm)]" style={{ backgroundColor: 'var(--c-bg-1)' }}>
        <p className="font-body text-[10px] text-[var(--c-txt-5)] mb-1.5">Roster</p>
        <div className="flex flex-wrap gap-1">
          {roster.map(g => (
            <span key={g} className="px-2 py-0.5 rounded-md font-body text-[10px]"
              style={{ backgroundColor: 'var(--c-bg-3)', color: 'var(--c-txt-3)' }}>
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main LineupStep
// ---------------------------------------------------------------------------

export function LineupStep() {
  const [state, dispatch] = useTeamSelection()
  const { discipline, apparatus, scoreFilter, benchmarkType, rosterA, rosterB, nocB, nocBOptimized } = state

  // Build national team B's lineup from optimized result
  const rosterBNames = benchmarkType === 'national' && nocBOptimized
    ? nocBOptimized.team
    : rosterB.map(e => e.gymnast)

  const lineupBFromNational: TeamLineup | null =
    benchmarkType === 'national' && nocBOptimized
      ? { teamFinal: nocBOptimized.lineups.team_final as Partial<Record<Apparatus, string[]>>, quals: nocBOptimized.lineups.quals as Partial<Record<Apparatus, string[]>> }
      : null

  const effectiveLineupB = benchmarkType === 'national' ? lineupBFromNational : state.lineupB

  async function optimizeA() {
    dispatch({ type: 'OPTIMIZE_A_START' })
    try {
      const result = await optimizeCustomTeam(rosterA, discipline, scoreFilter)
      dispatch({
        type: 'OPTIMIZE_A_DONE',
        lineup: { teamFinal: result.team_final as Partial<Record<Apparatus, string[]>>, quals: result.quals as Partial<Record<Apparatus, string[]>> },
      })
    } catch {
      dispatch({ type: 'OPTIMIZE_A_DONE', lineup: state.lineupA ?? { teamFinal: {}, quals: {} } })
    }
  }

  async function optimizeB() {
    if (benchmarkType === 'custom') {
      dispatch({ type: 'OPTIMIZE_B_START' })
      try {
        const result = await optimizeCustomTeam(rosterB, discipline, scoreFilter)
        dispatch({
          type: 'OPTIMIZE_B_DONE',
          lineup: { teamFinal: result.team_final as Partial<Record<Apparatus, string[]>>, quals: result.quals as Partial<Record<Apparatus, string[]>> },
        })
      } catch {
        dispatch({ type: 'OPTIMIZE_B_DONE', lineup: state.lineupB ?? { teamFinal: {}, quals: {} } })
      }
    }
  }

  const lineupAValid = apparatus.every(app => (state.lineupA?.teamFinal?.[app]?.length ?? 0) > 0)
  const lineupBValid = benchmarkType === 'world'
    ? true
    : benchmarkType === 'national'
      ? !!nocBOptimized
      : apparatus.every(app => (state.lineupB?.teamFinal?.[app]?.length ?? 0) > 0)

  async function handleRun() {
    if (!lineupAValid) return
    dispatch({ type: 'RUN_START' })

    const lineupAFinal = state.lineupA!.teamFinal as Record<string, string[]>
    const qualsAFinal = state.lineupA!.quals as Record<string, string[]>

    try {
      if (benchmarkType === 'world') {
        const result = await runWorldSimBatch(
          rosterA,
          rosterA.map(e => e.gymnast),
          lineupAFinal,
          qualsAFinal,
          { nSims: state.nSims, discipline, scoreFilter }
        )
        dispatch({ type: 'RUN_WORLD_SIM_SUCCESS', result })
      } else {
        // Pairwise — build team B spec
        let rosterBEntries = rosterB
        let lineupBFinal: Record<string, string[]> = {}

        if (benchmarkType === 'national' && nocB && nocBOptimized) {
          rosterBEntries = nocBOptimized.team.map(g => ({ gymnast: g, noc: nocB }))
          lineupBFinal = nocBOptimized.lineups.team_final as Record<string, string[]>
        } else if (benchmarkType === 'custom' && state.lineupB) {
          lineupBFinal = state.lineupB.teamFinal as Record<string, string[]>
        }

        const result = await runMatchupBatch(
          { roster: rosterA, lineup: lineupAFinal },
          { roster: rosterBEntries, lineup: lineupBFinal },
          { nSims: state.nSims, discipline, scoreFilter }
        )
        dispatch({ type: 'RUN_MATCHUP_SUCCESS', result })
      }
    } catch (err) {
      dispatch({ type: 'RUN_ERROR', msg: err instanceof Error ? err.message : 'Simulation failed' })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626] mb-1">
            Step 3 of 3
          </p>
          <h2 className="font-display text-2xl font-bold text-[var(--c-txt-0)]">Set Lineups</h2>
          <p className="font-body text-sm text-[var(--c-txt-3)] mt-1">
            Assign 3 gymnasts per apparatus for team final. "Find Optimal" auto-assigns by mean score.
          </p>
        </div>

        {/* Team A */}
        <TeamLineupEditor
          label="Your Team"
          roster={rosterA.map(e => e.gymnast)}
          lineup={state.lineupA}
          apparatus={apparatus}
          onUpdate={lineup => dispatch({ type: 'SET_LINEUP_A', lineup })}
          onOptimize={optimizeA}
          isOptimizing={state.isOptimizingA}
        />

        {/* Team B (pairwise only) */}
        {benchmarkType !== 'world' && (
          <TeamLineupEditor
            label={benchmarkType === 'national' ? `Opponent — ${nocB}` : 'Opponent Team'}
            roster={rosterBNames}
            lineup={effectiveLineupB}
            apparatus={apparatus}
            onUpdate={lineup => dispatch({ type: 'SET_LINEUP_B', lineup })}
            onOptimize={optimizeB}
            isOptimizing={state.isOptimizingB}
            readOnly={benchmarkType === 'national'}
          />
        )}

        {/* Sims + Run */}
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ backgroundColor: 'var(--c-bg-2)', border: '1px solid var(--c-border-md)' }}
        >
          <label className="font-body text-xs text-[var(--c-txt-4)]">Simulations:</label>
          <input
            type="number"
            value={state.nSims}
            min={50}
            max={2000}
            step={50}
            onChange={e => dispatch({ type: 'SET_N_SIMS', nSims: parseInt(e.target.value) || 500 })}
            className="w-24 bg-[var(--c-bg-3)] border border-[var(--c-border-lg)] rounded-lg px-2 py-1.5 text-sm font-body text-[var(--c-txt-0)] outline-none focus:border-[rgba(220,38,38,0.4)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', step: benchmarkType === 'world' ? 'team-a' : 'team-b' })}
              className="font-body text-xs text-[var(--c-txt-4)] hover:text-[var(--c-txt-1)] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleRun}
              disabled={state.isRunning || !lineupAValid || !lineupBValid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#dc2626', color: '#fff' }}
            >
              {state.isRunning ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Running…</>
              ) : 'Run Simulation →'}
            </button>
          </div>
        </div>

        {state.runError && (
          <div className="rounded-lg border border-[rgba(220,38,38,0.4)] bg-[rgba(220,38,38,0.08)] px-3 py-2">
            <p className="font-body text-xs text-[#ef4444]">{state.runError}</p>
          </div>
        )}
      </div>
    </div>
  )
}

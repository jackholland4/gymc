'use client'

import { useWorlds } from '../WorldsProvider'
import { simulateMeet } from '@/lib/api'

export function SimulateButton() {
  const [state, dispatch] = useWorlds()

  async function handleSimulate() {
    if (state.isSimulating) return
    if (Object.keys(state.lineups).length === 0) return

    const seedNum = state.seed.trim() !== '' ? parseInt(state.seed, 10) : undefined
    if (seedNum !== undefined && isNaN(seedNum)) return

    dispatch({ type: 'SIM_START' })
    try {
      const result = await simulateMeet(state.lineups, seedNum, state.discipline, state.scoreFilter)
      dispatch({
        type: 'SIM_SUCCESS',
        result,
        usedSeed: result.seed ?? null,
      })
      dispatch({ type: 'SET_TAB', tab: 'quals' })
    } catch (err) {
      dispatch({
        type: 'SIM_ERROR',
        msg: err instanceof Error ? err.message : 'Simulation failed',
      })
    }
  }

  const oversizedNoc = Object.entries(state.lineups).find(([, lu]) => lu.team.length > 5)?.[0] ?? null
  const canSim = !state.isSimulating && Object.keys(state.lineups).length > 0 && !oversizedNoc

  return (
    <div className="space-y-2">
      {/* Seed input */}
      <div>
        <label className="block font-body text-xs text-[var(--c-txt-4)] mb-1">Seed (optional)</label>
        <input
          type="number"
          placeholder="Random"
          value={state.seed}
          onChange={(e) => dispatch({ type: 'SET_SEED', seed: e.target.value })}
          className="w-full bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-1.5 text-xs text-[var(--c-txt-0)] placeholder-[var(--c-txt-6)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Simulate button */}
      <button
        onClick={handleSimulate}
        disabled={!canSim}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: canSim ? '#dc2626' : 'var(--c-bg-2)',
          color: canSim ? '#fff' : 'var(--c-txt-4)',
          border: canSim ? 'none' : '1px solid var(--c-border-md)',
        }}
      >
        {state.isSimulating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Simulating…</span>
          </>
        ) : (
          'Run Simulation'
        )}
      </button>

      {/* Error */}
      {state.simError && (
        <div className="rounded-lg border border-[rgba(220,38,38,0.4)] bg-[rgba(220,38,38,0.08)] px-3 py-2">
          <p className="font-body text-xs text-[#ef4444]">{state.simError}</p>
        </div>
      )}

      {/* Seed used */}
      {state.usedSeed !== null && !state.isSimulating && (
        <p className="font-body text-xs text-[var(--c-txt-5)]">
          Seed used: <span className="text-[var(--c-txt-3)] tabular-nums">{state.usedSeed}</span>
        </p>
      )}
    </div>
  )
}

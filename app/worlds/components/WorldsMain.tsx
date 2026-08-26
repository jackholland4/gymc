'use client'

import { useEffect } from 'react'
import { useWorlds } from '../WorldsProvider'
import { fetchCountries, optimizeAll, fetchSeeds } from '@/lib/api'
import type { Apparatus, Country, LineupConfig } from '@/types/simulation'

function buildDefaultLineup(country: Country, apparatus: Apparatus[]): LineupConfig {
  const gymnasts = country.gymnasts

  // Rank gymnasts by sum of their known means (proxy for overall value)
  const scored = gymnasts
    .map((g) => ({
      name: g.name,
      total: Object.values(g.means as Record<string, number>).reduce(
        (s, v) => s + (v ?? 0),
        0
      ),
    }))
    .sort((a, b) => b.total - a.total)

  const team = scored.slice(0, Math.min(5, scored.length)).map((g) => g.name)

  const quals: Record<string, string[]> = {}
  const teamFinal: Record<string, string[]> = {}

  for (const app of apparatus) {
    const ranked = team
      .filter((name) => {
        const g = gymnasts.find((g) => g.name === name)
        return g?.apparatus.includes(app)
      })
      .sort((a, b) => {
        const ga = gymnasts.find((g) => g.name === a)
        const gb = gymnasts.find((g) => g.name === b)
        return (
          ((gb?.means as Record<string, number>)?.[app] ?? 0) -
          ((ga?.means as Record<string, number>)?.[app] ?? 0)
        )
      })
    quals[app] = ranked.slice(0, 4)
    teamFinal[app] = ranked.slice(0, 3)
  }

  return {
    team,
    quals: quals as Record<Apparatus, string[]>,
    teamFinal: teamFinal as Record<Apparatus, string[]>,
  }
}
import { QualsPanel } from './QualsPanel'
import { TeamFinalPanel } from './TeamFinalPanel'
import { ApparatusFinalsPanel } from './ApparatusFinalsPanel'
import { AAFinalPanel } from './AAFinalPanel'
import { AnalyticsPanel } from './AnalyticsPanel'

// ---------------------------------------------------------------------------
// Tab bar
// ---------------------------------------------------------------------------

const TABS: { key: 'quals' | 'tf' | 'ef' | 'aa' | 'analytics'; label: string }[] = [
  { key: 'quals', label: 'Quals' },
  { key: 'tf', label: 'Team Final' },
  { key: 'ef', label: 'App. Finals' },
  { key: 'aa', label: 'All-Around' },
  { key: 'analytics', label: 'Analytics' },
]

function TabBar() {
  const [state, dispatch] = useWorlds()

  return (
    <div className="flex items-center gap-1 border-b border-[var(--c-border-sm)] px-6 pt-3 pb-0 shrink-0">
      {TABS.map((tab) => {
        const isActive = state.activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.key })}
            className="relative px-3 pb-3 pt-1 font-body text-sm font-medium transition-colors duration-150"
            style={{ color: isActive ? '#ef4444' : 'var(--c-txt-4)' }}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ backgroundColor: '#dc2626' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty / loading states
// ---------------------------------------------------------------------------

function EmptyState() {
  const [state] = useWorlds()

  if (state.isSimulating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-sm text-[var(--c-txt-1)]">Running simulation…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
      >
        <span className="font-display text-xl text-[#ef4444]">→</span>
      </div>
      <div>
        <p className="font-display text-base font-semibold text-[var(--c-txt-0)] mb-1">
          Run a simulation
        </p>
        <p className="font-body text-sm text-[var(--c-txt-5)]">
          Select a country, configure your lineup, then hit{' '}
          <span className="text-[var(--c-txt-1)]">Run Simulation</span> in the sidebar.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function WorldsMain() {
  const [state, dispatch] = useWorlds()

  // Load seeds once per discipline change
  useEffect(() => {
    fetchSeeds(state.discipline)
      .then((seeds) => dispatch({ type: 'SET_SEEDS', seeds }))
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.discipline])

  // Load countries, set default lineups immediately for interactivity, then replace
  // with properly optimized lineups from the backend for all countries.
  useEffect(() => {
    fetchCountries(state.discipline, state.scoreFilter)
      .then((countries) => {
        dispatch({ type: 'SET_COUNTRIES', countries })

        // Immediate defaults so the UI is interactive right away
        const defaults: Record<string, LineupConfig> = {}
        for (const c of countries) defaults[c.noc] = buildDefaultLineup(c, state.apparatus)
        dispatch({ type: 'SET_ALL_LINEUPS', lineups: defaults })

        // Replace all default lineups with backend-optimized ones in a single request.
        // TopCandidatesPanel still overrides with a 1000-sim result when a user
        // explicitly opens a country, so user-selected lineups always win.
        optimizeAll(state.discipline, state.scoreFilter)
          .then((all) => {
            for (const [noc, result] of Object.entries(all)) {
              const lineup: LineupConfig = {
                team: result.team,
                quals: result.lineups.quals,
                teamFinal: result.lineups.team_final,
              }
              dispatch({ type: 'SET_LINEUP', noc, lineup })
            }
          })
          .catch(() => {}) // keep defaults on failure
      })
      .catch(() =>
        dispatch({
          type: 'SET_COUNTRIES_ERROR',
          msg: 'Could not reach the simulation API. Start it with:\ncd ~/api && uvicorn main:app --port 8000',
        })
      )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.discipline, state.scoreFilter])

  const hasResult = !!state.simResult

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <TabBar />
      <div className="flex-1 overflow-y-auto">
        {!hasResult && state.activeTab !== 'analytics' ? (
          <EmptyState />
        ) : (
          <div className="px-6 py-6">
            {state.activeTab === 'quals' && hasResult && <QualsPanel />}
            {state.activeTab === 'tf' && hasResult && <TeamFinalPanel />}
            {state.activeTab === 'ef' && hasResult && <ApparatusFinalsPanel />}
            {state.activeTab === 'aa' && hasResult && <AAFinalPanel />}
            {state.activeTab === 'analytics' && <AnalyticsPanel />}
            {state.activeTab !== 'analytics' && !hasResult && <EmptyState />}
          </div>
        )}
      </div>
    </div>
  )
}

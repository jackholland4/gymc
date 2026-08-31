'use client'

import { createContext, useContext, useReducer, type Dispatch } from 'react'
import type {
  Country,
  Discipline,
  Apparatus,
  GymnastEntry,
  MatchupBatchResult,
  BatchTeamStats,
  OptimizeResult,
} from '@/types/simulation'
import { APPARATUS_WAG, APPARATUS_MAG } from '@/types/simulation'

export type BenchmarkType = 'world' | 'national' | 'custom'
export type Step = 'setup' | 'team-a' | 'team-b' | 'lineup' | 'results'

export interface ScoreFilter {
  excludeDomestic: boolean
  excludeNonFig: boolean
}

export interface TeamLineup {
  teamFinal: Partial<Record<Apparatus, string[]>>
  quals: Partial<Record<Apparatus, string[]>>
}

export interface TeamSelectionState {
  step: Step
  discipline: Discipline
  apparatus: Apparatus[]
  scoreFilter: ScoreFilter
  benchmarkType: BenchmarkType

  // Team A — always custom
  rosterA: GymnastEntry[]
  lineupA: TeamLineup | null
  isOptimizingA: boolean

  // Team B — depends on benchmarkType
  nocB: string | null          // 'national'
  nocBOptimized: OptimizeResult | null
  rosterB: GymnastEntry[]      // 'custom'
  lineupB: TeamLineup | null
  isOptimizingB: boolean

  // Countries data for gymnast picker
  countries: Country[]
  countriesLoaded: boolean

  // Simulation
  nSims: number
  isRunning: boolean
  runError: string | null

  // Results
  matchupResult: MatchupBatchResult | null
  worldSimResult: BatchTeamStats | null
}

const initialState: TeamSelectionState = {
  step: 'setup',
  discipline: 'WAG',
  apparatus: APPARATUS_WAG,
  scoreFilter: { excludeDomestic: false, excludeNonFig: false },
  benchmarkType: 'world',

  rosterA: [],
  lineupA: null,
  isOptimizingA: false,

  nocB: null,
  nocBOptimized: null,
  rosterB: [],
  lineupB: null,
  isOptimizingB: false,

  countries: [],
  countriesLoaded: false,

  nSims: 500,
  isRunning: false,
  runError: null,

  matchupResult: null,
  worldSimResult: null,
}

export type TeamSelectionAction =
  | { type: 'SET_DISCIPLINE'; discipline: Discipline }
  | { type: 'SET_SCORE_FILTER'; filter: Partial<ScoreFilter> }
  | { type: 'SET_BENCHMARK'; benchmarkType: BenchmarkType }
  | { type: 'SET_STEP'; step: Step }
  | { type: 'ADD_GYMNAST_A'; entry: GymnastEntry }
  | { type: 'REMOVE_GYMNAST_A'; gymnast: string }
  | { type: 'SET_LINEUP_A'; lineup: TeamLineup }
  | { type: 'OPTIMIZE_A_START' }
  | { type: 'OPTIMIZE_A_DONE'; lineup: TeamLineup }
  | { type: 'SET_NOC_B'; noc: string }
  | { type: 'SET_NOC_B_OPTIMIZED'; result: OptimizeResult }
  | { type: 'ADD_GYMNAST_B'; entry: GymnastEntry }
  | { type: 'REMOVE_GYMNAST_B'; gymnast: string }
  | { type: 'SET_LINEUP_B'; lineup: TeamLineup }
  | { type: 'OPTIMIZE_B_START' }
  | { type: 'OPTIMIZE_B_DONE'; lineup: TeamLineup }
  | { type: 'SET_COUNTRIES'; countries: Country[] }
  | { type: 'SET_N_SIMS'; nSims: number }
  | { type: 'RUN_START' }
  | { type: 'RUN_MATCHUP_SUCCESS'; result: MatchupBatchResult }
  | { type: 'RUN_WORLD_SIM_SUCCESS'; result: BatchTeamStats }
  | { type: 'RUN_ERROR'; msg: string }
  | { type: 'RESET' }

function reducer(state: TeamSelectionState, action: TeamSelectionAction): TeamSelectionState {
  switch (action.type) {
    case 'SET_DISCIPLINE':
      return {
        ...state,
        discipline: action.discipline,
        apparatus: action.discipline === 'MAG' ? APPARATUS_MAG : APPARATUS_WAG,
        rosterA: [], lineupA: null,
        rosterB: [], lineupB: null, nocB: null, nocBOptimized: null,
      }

    case 'SET_SCORE_FILTER':
      return { ...state, scoreFilter: { ...state.scoreFilter, ...action.filter } }

    case 'SET_BENCHMARK':
      return { ...state, benchmarkType: action.benchmarkType, nocB: null, nocBOptimized: null, rosterB: [], lineupB: null }

    case 'SET_STEP':
      return { ...state, step: action.step }

    case 'ADD_GYMNAST_A':
      if (state.rosterA.length >= 5) return state
      if (state.rosterA.some(e => e.gymnast === action.entry.gymnast)) return state
      return { ...state, rosterA: [...state.rosterA, action.entry], lineupA: null }

    case 'REMOVE_GYMNAST_A':
      return { ...state, rosterA: state.rosterA.filter(e => e.gymnast !== action.gymnast), lineupA: null }

    case 'SET_LINEUP_A':
      return { ...state, lineupA: action.lineup }

    case 'OPTIMIZE_A_START':
      return { ...state, isOptimizingA: true }

    case 'OPTIMIZE_A_DONE':
      return { ...state, isOptimizingA: false, lineupA: action.lineup }

    case 'SET_NOC_B':
      return { ...state, nocB: action.noc, nocBOptimized: null }

    case 'SET_NOC_B_OPTIMIZED':
      return { ...state, nocBOptimized: action.result }

    case 'ADD_GYMNAST_B':
      if (state.rosterB.length >= 5) return state
      if (state.rosterB.some(e => e.gymnast === action.entry.gymnast)) return state
      return { ...state, rosterB: [...state.rosterB, action.entry], lineupB: null }

    case 'REMOVE_GYMNAST_B':
      return { ...state, rosterB: state.rosterB.filter(e => e.gymnast !== action.gymnast), lineupB: null }

    case 'SET_LINEUP_B':
      return { ...state, lineupB: action.lineup }

    case 'OPTIMIZE_B_START':
      return { ...state, isOptimizingB: true }

    case 'OPTIMIZE_B_DONE':
      return { ...state, isOptimizingB: false, lineupB: action.lineup }

    case 'SET_COUNTRIES':
      return { ...state, countries: action.countries, countriesLoaded: true }

    case 'SET_N_SIMS':
      return { ...state, nSims: action.nSims }

    case 'RUN_START':
      return { ...state, isRunning: true, runError: null, matchupResult: null, worldSimResult: null }

    case 'RUN_MATCHUP_SUCCESS':
      return { ...state, isRunning: false, matchupResult: action.result, step: 'results' }

    case 'RUN_WORLD_SIM_SUCCESS':
      return { ...state, isRunning: false, worldSimResult: action.result, step: 'results' }

    case 'RUN_ERROR':
      return { ...state, isRunning: false, runError: action.msg }

    case 'RESET':
      return { ...initialState, countries: state.countries, countriesLoaded: state.countriesLoaded }

    default:
      return state
  }
}

const Ctx = createContext<[TeamSelectionState, Dispatch<TeamSelectionAction>] | null>(null)

export function TeamSelectionProvider({ children }: { children: React.ReactNode }) {
  const value = useReducer(reducer, initialState)
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTeamSelection(): [TeamSelectionState, Dispatch<TeamSelectionAction>] {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTeamSelection must be used within TeamSelectionProvider')
  return ctx
}

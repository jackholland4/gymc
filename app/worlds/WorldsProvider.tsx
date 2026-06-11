'use client'

import { createContext, useContext, useReducer, type Dispatch } from 'react'
import type {
  Country,
  LineupConfig,
  SimulationResult,
  BatchTeamStats,
  BatchGymnastStats,
} from '@/types/simulation'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface WorldsState {
  countries: Country[]
  countriesError: string | null
  selectedNoc: string | null
  lineups: Record<string, LineupConfig>
  seed: string // "" = random
  usedSeed: number | null
  simResult: SimulationResult | null
  isSimulating: boolean
  simError: string | null
  activeTab: 'quals' | 'tf' | 'ef' | 'aa' | 'analytics'
  batchStats: BatchTeamStats | null
  gymnstStats: BatchGymnastStats | null
  isBatchRunning: boolean
  batchError: string | null
  openGymnast: { noc: string; name: string } | null
}

const initialState: WorldsState = {
  countries: [],
  countriesError: null,
  selectedNoc: null,
  lineups: {},
  seed: '',
  usedSeed: null,
  simResult: null,
  isSimulating: false,
  simError: null,
  activeTab: 'quals',
  batchStats: null,
  gymnstStats: null,
  isBatchRunning: false,
  batchError: null,
  openGymnast: null,
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type WorldsAction =
  | { type: 'SET_COUNTRIES'; countries: Country[] }
  | { type: 'SET_COUNTRIES_ERROR'; msg: string }
  | { type: 'SELECT_NOC'; noc: string | null }
  | { type: 'SET_LINEUP'; noc: string; lineup: LineupConfig }
  | { type: 'SET_ALL_LINEUPS'; lineups: Record<string, LineupConfig> }
  | { type: 'OPEN_GYMNAST'; noc: string; name: string }
  | { type: 'CLOSE_GYMNAST' }
  | { type: 'SET_SEED'; seed: string }
  | { type: 'SIM_START' }
  | { type: 'SIM_SUCCESS'; result: SimulationResult; usedSeed: number | null }
  | { type: 'SIM_ERROR'; msg: string }
  | { type: 'SET_TAB'; tab: WorldsState['activeTab'] }
  | { type: 'BATCH_START' }
  | { type: 'BATCH_TEAM_SUCCESS'; stats: BatchTeamStats }
  | { type: 'BATCH_GYMNAST_SUCCESS'; stats: BatchGymnastStats }
  | { type: 'BATCH_ERROR'; msg: string }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: WorldsState, action: WorldsAction): WorldsState {
  switch (action.type) {
    case 'SET_COUNTRIES':
      return { ...state, countries: action.countries, countriesError: null }

    case 'SET_COUNTRIES_ERROR':
      return { ...state, countriesError: action.msg }

    case 'SELECT_NOC':
      return { ...state, selectedNoc: action.noc }

    case 'SET_LINEUP':
      return { ...state, lineups: { ...state.lineups, [action.noc]: action.lineup } }

    case 'SET_ALL_LINEUPS':
      return { ...state, lineups: { ...state.lineups, ...action.lineups } }

    case 'OPEN_GYMNAST':
      return { ...state, openGymnast: { noc: action.noc, name: action.name } }

    case 'CLOSE_GYMNAST':
      return { ...state, openGymnast: null }

    case 'SET_SEED':
      return { ...state, seed: action.seed }

    case 'SIM_START':
      return { ...state, isSimulating: true, simError: null }

    case 'SIM_SUCCESS':
      return {
        ...state,
        isSimulating: false,
        simResult: action.result,
        usedSeed: action.usedSeed,
        simError: null,
      }

    case 'SIM_ERROR':
      return { ...state, isSimulating: false, simError: action.msg }

    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'BATCH_START':
      return { ...state, isBatchRunning: true, batchError: null }

    case 'BATCH_TEAM_SUCCESS':
      return { ...state, isBatchRunning: false, batchStats: action.stats, batchError: null }

    case 'BATCH_GYMNAST_SUCCESS':
      return { ...state, isBatchRunning: false, gymnstStats: action.stats, batchError: null }

    case 'BATCH_ERROR':
      return { ...state, isBatchRunning: false, batchError: action.msg }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WorldsContext = createContext<[WorldsState, Dispatch<WorldsAction>] | null>(null)

export function WorldsProvider({ children }: { children: React.ReactNode }) {
  const value = useReducer(reducer, initialState)
  return <WorldsContext.Provider value={value}>{children}</WorldsContext.Provider>
}

export function useWorlds(): [WorldsState, Dispatch<WorldsAction>] {
  const ctx = useContext(WorldsContext)
  if (!ctx) throw new Error('useWorlds must be used within WorldsProvider')
  return ctx
}

import type {
  Country,
  LineupConfig,
  OptimizeResult,
  ValidationResult,
  SimulationResult,
  BatchTeamStats,
  BatchGymnastStats,
  GymnastHistory,
  ScrapedMeetRow,
  ScrapedMeet,
  TopCandidatesResponse,
} from '@/types/simulation'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

/**
 * Convert a LineupConfig (camelCase frontend shape) to the snake_case body the API expects.
 */
export function toApiLineup(lineup: LineupConfig) {
  return {
    team: lineup.team,
    quals: lineup.quals,
    team_final: lineup.teamFinal,
  }
}

/** GET /api/countries */
export function fetchCountries(): Promise<Country[]> {
  return request<Country[]>('/api/countries')
}

/** POST /api/optimize */
export function optimizeTeam(noc: string, teamSize?: number): Promise<OptimizeResult> {
  return request<OptimizeResult>('/api/optimize', {
    method: 'POST',
    body: JSON.stringify({ noc, ...(teamSize !== undefined ? { team_size: teamSize } : {}) }),
  })
}

/** POST /api/validate-lineup */
export function validateLineup(noc: string, lineup: LineupConfig): Promise<ValidationResult> {
  return request<ValidationResult>('/api/validate-lineup', {
    method: 'POST',
    body: JSON.stringify({ noc, lineup: toApiLineup(lineup) }),
  })
}

/** POST /api/simulate */
export function simulateMeet(
  lineups: Record<string, LineupConfig>,
  seed?: number
): Promise<SimulationResult> {
  const apiLineups: Record<string, ReturnType<typeof toApiLineup>> = {}
  for (const [noc, lineup] of Object.entries(lineups)) {
    apiLineups[noc] = toApiLineup(lineup)
  }
  return request<SimulationResult>('/api/simulate', {
    method: 'POST',
    body: JSON.stringify({ lineups: apiLineups, ...(seed !== undefined ? { seed } : {}) }),
  })
}

/** POST /api/batch */
export function runBatch(
  lineups: Record<string, LineupConfig>,
  opts: {
    nSims?: number
    seed?: number
    aggregateCountry?: string
    aggregateGymnast?: string
  } = {}
): Promise<BatchTeamStats | BatchGymnastStats> {
  const apiLineups: Record<string, ReturnType<typeof toApiLineup>> = {}
  for (const [noc, lineup] of Object.entries(lineups)) {
    apiLineups[noc] = toApiLineup(lineup)
  }
  return request<BatchTeamStats | BatchGymnastStats>('/api/batch', {
    method: 'POST',
    body: JSON.stringify({
      lineups: apiLineups,
      ...(opts.nSims !== undefined ? { n_sims: opts.nSims } : {}),
      ...(opts.seed !== undefined ? { seed: opts.seed } : {}),
      ...(opts.aggregateCountry !== undefined ? { aggregate_country: opts.aggregateCountry } : {}),
      ...(opts.aggregateGymnast !== undefined ? { aggregate_gymnast: opts.aggregateGymnast } : {}),
    }),
  })
}

/** GET /api/gymnast/{noc}/{name}/history */
export function fetchGymnastHistory(noc: string, name: string): Promise<GymnastHistory> {
  return request<GymnastHistory>(`/api/gymnast/${encodeURIComponent(noc)}/${encodeURIComponent(name)}/history`)
}

/** GET /api/meet-results?gymnast=... */
export function fetchMeetResultsForGymnast(gymnast: string): Promise<ScrapedMeetRow[]> {
  return request<ScrapedMeetRow[]>(`/api/meet-results?gymnast=${encodeURIComponent(gymnast)}`)
}

/** GET /api/meet-results?meet_name=... */
export function fetchMeetResults(meetName: string): Promise<ScrapedMeetRow[]> {
  return request<ScrapedMeetRow[]>(`/api/meet-results?meet_name=${encodeURIComponent(meetName)}`)
}

/** GET /api/scraped-meets */
export function fetchScrapedMeets(): Promise<ScrapedMeet[]> {
  return request<ScrapedMeet[]>('/api/scraped-meets')
}

/** POST /api/batch/teams */
export function analyzeTeams(
  noc: string,
  candidateTeams: string[][],
  nSims?: number
): Promise<{ teams: BatchTeamStats[] }> {
  return request<{ teams: BatchTeamStats[] }>('/api/batch/teams', {
    method: 'POST',
    body: JSON.stringify({
      noc,
      candidate_teams: candidateTeams,
      ...(nSims !== undefined ? { n_sims: nSims } : {}),
    }),
  })
}

/** POST /api/top-team-candidates */
export function fetchTopCandidates(
  noc: string,
  nSims = 1000,
  seed?: number
): Promise<TopCandidatesResponse> {
  return request<TopCandidatesResponse>('/api/top-team-candidates', {
    method: 'POST',
    body: JSON.stringify({ noc, n_sims: nSims, top_k: 10, ...(seed !== undefined ? { seed } : {}) }),
  })
}

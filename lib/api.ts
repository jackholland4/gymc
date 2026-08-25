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
  Discipline,
  CalendarMeet,
  MeetDetail,
  GymnastSeed,
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
export function fetchCountries(
  discipline: Discipline = 'WAG',
  scoreFilter?: { excludeDomestic?: boolean; excludeNonFig?: boolean }
): Promise<Country[]> {
  const params = new URLSearchParams({ discipline })
  if (scoreFilter?.excludeDomestic) params.set('include_domestic', 'false')
  if (scoreFilter?.excludeNonFig) params.set('include_non_fig', 'false')
  return request<Country[]>(`/api/countries?${params}`)
}

/** POST /api/optimize */
export function optimizeTeam(noc: string, teamSize?: number, discipline: Discipline = 'WAG'): Promise<OptimizeResult> {
  return request<OptimizeResult>('/api/optimize', {
    method: 'POST',
    body: JSON.stringify({ noc, discipline, ...(teamSize !== undefined ? { team_size: teamSize } : {}) }),
  })
}

/** GET /api/optimize-all — returns optimized lineup for every country in one request */
export function optimizeAll(discipline: Discipline = 'WAG'): Promise<Record<string, { team: string[]; lineups: { quals: Record<string, string[]>; team_final: Record<string, string[]> } }>> {
  return request(`/api/optimize-all?discipline=${discipline}`)
}

/** POST /api/validate-lineup */
export function validateLineup(noc: string, lineup: LineupConfig, discipline: Discipline = 'WAG'): Promise<ValidationResult> {
  return request<ValidationResult>('/api/validate-lineup', {
    method: 'POST',
    body: JSON.stringify({ noc, discipline, lineup: toApiLineup(lineup) }),
  })
}

/** POST /api/simulate */
export function simulateMeet(
  lineups: Record<string, LineupConfig>,
  seed?: number,
  discipline: Discipline = 'WAG',
  scoreFilter?: { excludeDomestic?: boolean; excludeNonFig?: boolean }
): Promise<SimulationResult> {
  const apiLineups: Record<string, ReturnType<typeof toApiLineup>> = {}
  for (const [noc, lineup] of Object.entries(lineups)) {
    apiLineups[noc] = toApiLineup(lineup)
  }
  return request<SimulationResult>('/api/simulate', {
    method: 'POST',
    body: JSON.stringify({
      lineups: apiLineups,
      discipline,
      ...(seed !== undefined ? { seed } : {}),
      ...(scoreFilter
        ? {
            score_filter: {
              include_domestic: !scoreFilter.excludeDomestic,
              include_non_fig: !scoreFilter.excludeNonFig,
            },
          }
        : {}),
    }),
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
    discipline?: Discipline
    scoreFilter?: { excludeDomestic?: boolean; excludeNonFig?: boolean }
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
      ...(opts.discipline !== undefined ? { discipline: opts.discipline } : {}),
      ...(opts.scoreFilter
        ? {
            score_filter: {
              include_domestic: !opts.scoreFilter.excludeDomestic,
              include_non_fig: !opts.scoreFilter.excludeNonFig,
            },
          }
        : {}),
    }),
  })
}

/** GET /api/seeds?discipline=... */
export function fetchSeeds(discipline: Discipline = 'WAG'): Promise<GymnastSeed[]> {
  return request<GymnastSeed[]>(`/api/seeds?discipline=${discipline}`)
}

/** GET /api/gymnast/{noc}/{name}/photo */
export function fetchGymnastPhoto(noc: string, name: string): Promise<{ photo_url: string | null; is_olympian: boolean; birth_year: number | null }> {
  return request<{ photo_url: string | null; is_olympian: boolean; birth_year: number | null }>(
    `/api/gymnast/${encodeURIComponent(noc)}/${encodeURIComponent(name)}/photo`
  )
}

/** GET /api/gymnast/{noc}/{name}/history */
export function fetchGymnastHistory(noc: string, name: string, discipline: Discipline = 'WAG'): Promise<GymnastHistory> {
  return request<GymnastHistory>(`/api/gymnast/${encodeURIComponent(noc)}/${encodeURIComponent(name)}/history?discipline=${discipline}`)
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
  nSims?: number,
  discipline: Discipline = 'WAG'
): Promise<{ teams: BatchTeamStats[] }> {
  return request<{ teams: BatchTeamStats[] }>('/api/batch/teams', {
    method: 'POST',
    body: JSON.stringify({
      noc,
      candidate_teams: candidateTeams,
      discipline,
      ...(nSims !== undefined ? { n_sims: nSims } : {}),
    }),
  })
}

/** GET /api/calendar?discipline=WAG */
export function fetchCalendar(discipline: Discipline = 'WAG'): Promise<CalendarMeet[]> {
  return request<CalendarMeet[]>(`/api/calendar?discipline=${discipline}`)
}

/** GET /api/meet/{meet_name}/results?discipline=WAG */
export function fetchMeetDetail(meetName: string, discipline: Discipline = 'WAG'): Promise<MeetDetail> {
  return request<MeetDetail>(`/api/meet/${encodeURIComponent(meetName)}/results?discipline=${discipline}`)
}

/** POST /api/top-team-candidates */
export function fetchTopCandidates(
  noc: string,
  nSims = 1000,
  discipline: Discipline = 'WAG',
  seed?: number,
  scoreFilter?: { excludeDomestic?: boolean; excludeNonFig?: boolean }
): Promise<TopCandidatesResponse> {
  return request<TopCandidatesResponse>('/api/top-team-candidates', {
    method: 'POST',
    body: JSON.stringify({
      noc,
      n_sims: nSims,
      top_k: 10,
      discipline,
      ...(seed !== undefined ? { seed } : {}),
      ...(scoreFilter
        ? {
            score_filter: {
              include_domestic: !scoreFilter.excludeDomestic,
              include_non_fig: !scoreFilter.excludeNonFig,
            },
          }
        : {}),
    }),
  })
}

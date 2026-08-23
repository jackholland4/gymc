export type Apparatus = 'VT' | 'UB' | 'BB' | 'FX' | 'PH' | 'SR' | 'PB' | 'HB'
export const APPARATUS: Apparatus[] = ['VT', 'UB', 'BB', 'FX']
export const APPARATUS_WAG: Apparatus[] = ['VT', 'UB', 'BB', 'FX']
export const APPARATUS_MAG: Apparatus[] = ['FX', 'PH', 'SR', 'VT', 'PB', 'HB']
export type Discipline = 'WAG' | 'MAG'

export interface GymnastSummary {
  name: string
  apparatus: Apparatus[]
  score_counts: Record<Apparatus, number>
  means: Partial<Record<Apparatus, number>>
}

export interface Country {
  noc: string
  name: string
  gymnasts: GymnastSummary[]
  is_team_country?: boolean
}

export interface LineupConfig {
  team: string[]
  quals: Record<Apparatus, string[]>
  teamFinal: Record<Apparatus, string[]> // camelCase on frontend, converted to team_final for API
}

export interface Score {
  country: string
  gymnast: string
  apparatus: Apparatus
  score: number
}

export interface TeamStanding {
  country: string
  total: number
  [apparatus: string]: number | string
}

export interface EFQualifier {
  gymnast: string
  noc: string
}

export interface AAStanding {
  gymnast: string
  country: string
  score: number
}

export interface EFResult {
  gymnast: string
  country: string
  score: number
}

export interface AAResult {
  gymnast: string
  country: string
  total: number
  [apparatus: string]: number | string
}

export interface SimulationResult {
  seed: number | null
  quals: {
    team_standings: TeamStanding[]
    all_scores: Score[]
    apparatus_rankings: Record<Apparatus, EFResult[]>
    aa_standings: AAStanding[]
    ef_qualifiers: Record<Apparatus, EFQualifier[]>
    aa_qualifiers: EFQualifier[]
  }
  team_final: {
    standings: TeamStanding[]
    all_scores: Score[]
  }
  apparatus_finals: Record<Apparatus, EFResult[]>
  aa_final: AAResult[]
}

export interface OptimizeResult {
  team: string[]
  mean_team: string[] | null
  high_team: string[] | null
  lineups: {
    quals: Record<Apparatus, string[]>
    team_final: Record<Apparatus, string[]>
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ApparatusStats {
  competed: boolean
  mean_quals_score: number | null
  mean_quals_rank: number | null
  ef_qual_rate: number | null
  mean_ef_rank: number | null
  ef_medal_rate: number | null
  ef_rank_distribution: number[]
}

export interface BatchGymnastStats {
  apparatus: Record<Apparatus, ApparatusStats>
  all_around: {
    mean_quals_total: number | null
    mean_quals_rank: number | null
    aa_qual_rate: number | null
    mean_aa_rank: number | null
    aa_medal_rate: number | null
    aa_rank_distribution: number[]
  }
}

export interface BatchTeamStats {
  mean_quals_total: number | null
  mean_quals_rank: number | null
  tf_qual_rate: number | null
  mean_tf_total: number | null
  mean_tf_rank: number | null
  mean_ef_qualifiers: number
  ef_breakdown: Record<Apparatus, number>
  mean_aa_qualifiers: number
  gymnast_ef_rates: Record<string, Record<Apparatus, number>>
  gymnast_aa_rates: Record<string, number>
  tf_rank_distribution: number[]
  team?: string[]
}

// ── Gymnast profile ──────────────────────────────────────────────────────────

export interface CompetitionScore {
  apparatus: Apparatus
  round: string | null
  score: number | null
  sanctioned?: boolean
}

export interface CompetitionEntry {
  competition: string | null
  date: string | null
  scores: CompetitionScore[]
  aa: number | null
}

export interface GymnastHistory {
  name: string
  noc: string
  competitions: CompetitionEntry[]
}

// ── Scraped meet data ────────────────────────────────────────────────────────

export interface ScrapedMeetRow {
  id: number
  meet_name: string
  results_url: string
  section: string | null
  round: string | null
  rank: number | null
  gymnast: string | null
  club: string | null
  VT: number | null
  UB: number | null
  BB: number | null
  FX: number | null
  AA: number | null
  vt_sanctioned: boolean | null
}

export interface ScrapedMeet {
  id: number
  meet_name: string
  landing_url: string
  results_url: string | null
  date_str: string | null
  location: string | null
  status: string
  row_count: number
  scraped_at: string
}

export interface CandidateResult {
  gymnast: string
  team_value_pct: number
  appearances: number
  mean_team_total_included: number
  mean_team_total_excluded: number
  marginal_value: number
  apparatus_means: Record<Apparatus, number | null>
  apparatus_maxes: Record<Apparatus, number | null>
  apparatus_counts: Record<Apparatus, number>
  is_specialist: boolean
  apparatus_label: string
  best_apparatus: Apparatus | ''
  best_apparatus_mean: number
}

export interface TopCandidatesResponse {
  noc: string
  roster_size: number
  n_sims: number
  candidates: CandidateResult[]
  default_team: string[]
  default_lineups: {
    quals: Record<Apparatus, string[]>
    team_final: Record<Apparatus, string[]>
  }
}

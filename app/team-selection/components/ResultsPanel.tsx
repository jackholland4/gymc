'use client'

import { useState } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { DistributionChart } from '@/components/shared/DistributionChart'
import { useTeamSelection } from '../TeamSelectionProvider'
import type { Apparatus } from '@/types/simulation'

const pct = (v: number | null | undefined) => v != null ? `${(v * 100).toFixed(1)}%` : '—'
const num = (v: number | null | undefined, dp = 3) => v != null ? v.toFixed(dp) : '—'

// ---------------------------------------------------------------------------
// Pairwise matchup results
// ---------------------------------------------------------------------------

function MatchupResults() {
  const [state, dispatch] = useTeamSelection()
  const r = state.matchupResult!
  const apparatus = state.apparatus
  const [showDist, setShowDist] = useState(true)
  const [showConsistency, setShowConsistency] = useState(true)
  const [showSpread, setShowSpread] = useState(true)
  const [showUpset, setShowUpset] = useState(true)

  const nameA = 'Your Team'
  const nameB = state.benchmarkType === 'national'
    ? `${state.nocB}`
    : 'Opponent'

  const winPctA = (r.win_rate_a * 100).toFixed(1)
  const winPctB = (r.win_rate_b * 100).toFixed(1)
  const aWins = r.win_rate_a >= r.win_rate_b

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626] mb-1">
            Results · {r.n_sims.toLocaleString()} simulations
          </p>
          <h2 className="font-display text-2xl font-bold text-[var(--c-txt-0)]">
            {nameA} vs {nameB}
          </h2>
        </div>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="font-body text-xs px-4 py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--c-border-lg)', color: 'var(--c-txt-3)' }}
        >
          New Simulation
        </button>
      </div>

      {/* Win-rate bar */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--c-bg-2)', border: '1px solid var(--c-border-md)' }}
      >
        <div className="flex justify-between mb-2">
          <span className="font-display text-sm font-bold" style={{ color: aWins ? '#ef4444' : 'var(--c-txt-3)' }}>
            {nameA}
          </span>
          <span className="font-display text-sm font-bold" style={{ color: !aWins ? '#ef4444' : 'var(--c-txt-3)' }}>
            {nameB}
          </span>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-center font-display text-sm font-bold text-white transition-all"
            style={{ width: `${r.win_rate_a * 100}%`, backgroundColor: '#dc2626' }}
          >
            {winPctA}%
          </div>
          {r.tie_rate > 0.005 && (
            <div
              className="flex items-center justify-center font-body text-xs text-[var(--c-txt-3)]"
              style={{ width: `${r.tie_rate * 100}%`, backgroundColor: 'var(--c-bg-4)' }}
            >
              Tie
            </div>
          )}
          <div
            className="flex items-center justify-center font-display text-sm font-bold text-white transition-all"
            style={{ width: `${r.win_rate_b * 100}%`, backgroundColor: 'var(--c-bg-5)' }}
          >
            {winPctB}%
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-body text-xs text-[var(--c-txt-4)]">Win rate</span>
          <span className="font-body text-xs text-[var(--c-txt-4)]">Win rate</span>
        </div>
      </div>

      {/* Score metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label={`${nameA} Mean`} value={num(r.mean_total_a, 2)} />
        <MetricCard label={`${nameB} Mean`} value={num(r.mean_total_b, 2)} />
        <MetricCard label="Mean Margin" value={`${r.mean_margin >= 0 ? '+' : ''}${num(r.mean_margin, 2)}`} />
        <MetricCard label="Upset Index" value={pct(r.upset_index)} />
      </div>

      {/* Section 1: Margin distribution */}
      <section>
        <button
          onClick={() => setShowDist(v => !v)}
          className="flex items-center gap-1.5 font-body text-xs font-semibold text-[var(--c-txt-3)] hover:text-[var(--c-txt-1)] transition-colors mb-3"
        >
          Margin Distribution <span className="text-[var(--c-txt-5)]">{showDist ? '▲' : '▼'}</span>
        </button>
        {showDist && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}
          >
            <p className="font-body text-xs text-[var(--c-txt-4)] mb-3">
              Distribution of team-total margin ({nameA} − {nameB}) across {r.n_sims.toLocaleString()} trials.
              Positive = {nameA} wins.
            </p>
            <DistributionChart
              data={r.margin_values}
              bins={20}
              label={`Margin (${nameA} − ${nameB})`}
              height={96}
              color={r.mean_margin >= 0 ? '#dc2626' : '#6b7280'}
            />
          </div>
        )}
      </section>

      {/* Section 2: Per-apparatus */}
      <section>
        <p className="font-body text-xs font-semibold text-[var(--c-txt-3)] uppercase tracking-wider mb-3">
          Per-Apparatus Breakdown
        </p>
        <div className="overflow-x-auto rounded-xl border border-[var(--c-border-sm)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--c-border-md)]" style={{ backgroundColor: 'var(--c-bg-5)' }}>
                <th className="text-left px-4 py-2.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">Event</th>
                <th className="text-right px-4 py-2.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">{nameA} Mean</th>
                <th className="text-right px-4 py-2.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">{nameB} Mean</th>
                <th className="text-right px-4 py-2.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">{nameA} Win%</th>
              </tr>
            </thead>
            <tbody>
              {apparatus.map(app => {
                const row = r.per_apparatus[app]
                if (!row) return null
                const aWinsApp = row.win_rate_a >= 0.5
                return (
                  <tr key={app} className="border-b border-[var(--c-border-sm)]">
                    <td className="px-4 py-2.5 font-body text-xs font-semibold text-[var(--c-txt-0)]">{app}</td>
                    <td className="px-4 py-2.5 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]">
                      {num(row.mean_a, 3)}
                    </td>
                    <td className="px-4 py-2.5 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]">
                      {num(row.mean_b, 3)}
                    </td>
                    <td className="px-4 py-2.5 font-body text-xs tabular-nums text-right"
                      style={{ color: aWinsApp ? '#ef4444' : 'var(--c-txt-3)' }}>
                      {pct(row.win_rate_a)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Consistency */}
      <section>
        <button
          onClick={() => setShowConsistency(v => !v)}
          className="flex items-center gap-1.5 font-body text-xs font-semibold text-[var(--c-txt-3)] hover:text-[var(--c-txt-1)] transition-colors mb-3"
        >
          Consistency <span className="text-[var(--c-txt-5)]">{showConsistency ? '▲' : '▼'}</span>
        </button>
        {showConsistency && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label={`${nameA} CV`}
                value={r.cv_a != null ? `${(r.cv_a * 100).toFixed(2)}%` : '—'}
              />
              <MetricCard
                label={`${nameB} CV`}
                value={r.cv_b != null ? `${(r.cv_b * 100).toFixed(2)}%` : '—'}
              />
            </div>
            <p className="font-body text-xs text-[var(--c-txt-5)]">
              CV = std ÷ mean of team total across trials. Lower = more consistent run-to-run.
            </p>
            {/* Score distribution comparison */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: `${nameA} Total Distribution`, data: r.totals_a, color: '#dc2626' },
                { label: `${nameB} Total Distribution`, data: r.totals_b, color: '#6b7280' },
              ].map(({ label, data, color }) => (
                <div key={label} className="rounded-xl p-3"
                  style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}>
                  <DistributionChart data={data} bins={16} label={label} height={72} color={color} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Gymnast spread */}
      <section>
        <button
          onClick={() => setShowSpread(v => !v)}
          className="flex items-center gap-1.5 font-body text-xs font-semibold text-[var(--c-txt-3)] hover:text-[var(--c-txt-1)] transition-colors mb-3"
        >
          Gymnast Contributions & Swap Sensitivity{' '}
          <span className="text-[var(--c-txt-5)]">{showSpread ? '▲' : '▼'}</span>
        </button>
        {showSpread && (
          <div className="space-y-4">
            {[
              { label: nameA, spreads: r.gymnast_spread_a },
              { label: nameB, spreads: r.gymnast_spread_b },
            ].map(({ label, spreads }) => (
              <div key={label}>
                <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">{label}</p>
                <div className="overflow-x-auto rounded-xl border border-[var(--c-border-sm)]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--c-border-md)]" style={{ backgroundColor: 'var(--c-bg-5)' }}>
                        <th className="text-left px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Gymnast</th>
                        <th className="text-left px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">NOC</th>
                        <th className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Mean Contrib.</th>
                        <th className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Std</th>
                        <th className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Marginal Win%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spreads.map(g => (
                        <tr key={g.gymnast} className="border-b border-[var(--c-border-sm)]">
                          <td className="px-3 py-2 font-body text-xs text-[var(--c-txt-1)]">{g.gymnast}</td>
                          <td className="px-3 py-2 font-body text-xs text-[var(--c-txt-4)]">{g.noc}</td>
                          <td className="px-3 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]">
                            {num(g.mean_contribution, 2)}
                          </td>
                          <td className="px-3 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-3)]">
                            ±{num(g.std_contribution, 2)}
                          </td>
                          <td className="px-3 py-2 font-body text-xs tabular-nums text-right"
                            style={{ color: g.marginal_win_rate_delta > 0.01 ? '#ef4444' : 'var(--c-txt-3)' }}>
                            {g.marginal_win_rate_delta > 0 ? '+' : ''}{pct(g.marginal_win_rate_delta)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <p className="font-body text-xs text-[var(--c-txt-5)]">
              Marginal Win% = change in team win rate if this gymnast&apos;s scores are removed (leave-one-out).
              Higher = more critical to team success.
            </p>
          </div>
        )}
      </section>

      {/* Section 5: Upset index */}
      <section>
        <button
          onClick={() => setShowUpset(v => !v)}
          className="flex items-center gap-1.5 font-body text-xs font-semibold text-[var(--c-txt-3)] hover:text-[var(--c-txt-1)] transition-colors mb-3"
        >
          Upset Index <span className="text-[var(--c-txt-5)]">{showUpset ? '▲' : '▼'}</span>
        </button>
        {showUpset && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-display text-3xl font-bold text-[var(--c-txt-0)]">
                {pct(r.upset_index)}
              </span>
              <span className="font-body text-sm text-[var(--c-txt-3)]">upset probability</span>
            </div>
            <p className="font-body text-xs text-[var(--c-txt-4)] leading-relaxed">
              The team with the lower mean total ({r.mean_total_a < r.mean_total_b ? nameA : nameB}) wins{' '}
              <strong>{pct(r.upset_index)}</strong> of simulations — a measure of how often the underdog can
              flip the result through score variance.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// World-field results
// ---------------------------------------------------------------------------

function WorldSimResultsPanel() {
  const [state, dispatch] = useTeamSelection()
  const s = state.worldSimResult!
  const apparatus = state.apparatus

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626] mb-1">
            Results · World Field
          </p>
          <h2 className="font-display text-2xl font-bold text-[var(--c-txt-0)]">
            Custom Team vs World
          </h2>
        </div>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="font-body text-xs px-4 py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--c-border-lg)', color: 'var(--c-txt-3)' }}
        >
          New Simulation
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="TF Qual Rate" value={pct(s.tf_qual_rate)} highlight={(s.tf_qual_rate ?? 0) >= 0.5} />
        <MetricCard label="Mean TF Rank" value={s.mean_tf_rank != null ? num(s.mean_tf_rank, 1) : null} />
        <MetricCard label="Mean TF Total" value={num(s.mean_tf_total, 2)} />
        <MetricCard label="Mean Quals Rank" value={s.mean_quals_rank != null ? num(s.mean_quals_rank, 1) : null} />
        <MetricCard label="Mean Quals Total" value={num(s.mean_quals_total, 2)} />
        <MetricCard label="Mean EF Qualifiers" value={num(s.mean_ef_qualifiers, 2)} />
        <MetricCard label="Mean AA Qualifiers" value={num(s.mean_aa_qualifiers, 2)} />
      </div>

      {/* EF breakdown */}
      {s.ef_breakdown && (
        <div>
          <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">Mean EF Qualifiers by Event</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${apparatus.length}, 1fr)` }}>
            {apparatus.map(a => (
              <div key={a} className="rounded-lg p-3 text-center"
                style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}>
                <p className="font-body text-xs text-[var(--c-txt-4)] mb-1">{a}</p>
                <p className="font-body text-sm font-semibold tabular-nums text-[var(--c-txt-0)]">
                  {num(s.ef_breakdown[a], 2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TF rank distribution */}
      {s.tf_rank_distribution && s.tf_rank_distribution.length > 0 && (
        <div>
          <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">TF Rank Distribution</p>
          <div className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}>
            <DistributionChart
              data={s.tf_rank_distribution}
              label="Team Final rank"
              height={96}
            />
          </div>
        </div>
      )}

      {/* Gymnast qualification rates */}
      {s.gymnast_ef_rates && Object.keys(s.gymnast_ef_rates).length > 0 && (
        <div>
          <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">Gymnast Qualification Rates</p>
          <div className="overflow-x-auto rounded-xl border border-[var(--c-border-sm)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--c-border-md)]" style={{ backgroundColor: 'var(--c-bg-5)' }}>
                  <th className="text-left px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Gymnast</th>
                  {apparatus.map(a => (
                    <th key={a} className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">{a} EF%</th>
                  ))}
                  <th className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">AA%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(s.gymnast_ef_rates).map(([gymnast, rates]) => (
                  <tr key={gymnast} className="border-b border-[var(--c-border-sm)]">
                    <td className="px-3 py-2 font-body text-xs text-[var(--c-txt-2)]">{gymnast}</td>
                    {apparatus.map(a => (
                      <td key={a} className="px-3 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]">
                        {rates[a] != null ? pct(rates[a]) : '—'}
                      </td>
                    ))}
                    <td className="px-3 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]">
                      {s.gymnast_aa_rates?.[gymnast] != null ? pct(s.gymnast_aa_rates[gymnast]) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export function ResultsPanel() {
  const [state] = useTeamSelection()
  if (state.worldSimResult) return <WorldSimResultsPanel />
  if (state.matchupResult) return <MatchupResults />
  return null
}

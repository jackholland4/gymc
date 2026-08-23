'use client'

import { useState } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { DistributionChart } from '@/components/shared/DistributionChart'
import { useWorlds } from '../WorldsProvider'
import { runBatch } from '@/lib/api'
import type { Apparatus, BatchTeamStats, BatchGymnastStats } from '@/types/simulation'

const pct = (v: number | null | undefined) =>
  v != null ? `${(v * 100).toFixed(1)}%` : '—'

const num = (v: number | null | undefined, dp = 3) =>
  v != null ? v.toFixed(dp) : '—'

// ---------------------------------------------------------------------------
// Team Analysis sub-panel
// ---------------------------------------------------------------------------

function TeamAnalysis() {
  const [state, dispatch] = useWorlds()
  const APPARATUS = state.apparatus
  const [nSims, setNSims] = useState(200)
  const [expandedDist, setExpandedDist] = useState(false)

  async function handleRunTeam() {
    if (!state.selectedNoc || Object.keys(state.lineups).length === 0) return
    dispatch({ type: 'BATCH_START' })
    try {
      const result = await runBatch(state.lineups, {
        nSims,
        aggregateCountry: state.selectedNoc,
        discipline: state.discipline,
        scoreFilter: state.scoreFilter,
      })
      dispatch({ type: 'BATCH_TEAM_SUCCESS', stats: result as BatchTeamStats })
    } catch (err) {
      dispatch({
        type: 'BATCH_ERROR',
        msg: err instanceof Error ? err.message : 'Batch failed',
      })
    }
  }

  const s = state.batchStats
  const noc = state.selectedNoc ?? '—'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h4 className="font-display text-sm font-semibold text-[var(--c-txt-0)]">
          Team Analysis — {noc}
        </h4>
        <div className="flex items-center gap-2 ml-auto">
          <label className="font-body text-xs text-[var(--c-txt-4)]">Sims:</label>
          <input
            type="number"
            value={nSims}
            min={50}
            max={2000}
            step={50}
            onChange={(e) => setNSims(parseInt(e.target.value) || 200)}
            className="w-20 bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-2 py-1 text-xs text-[var(--c-txt-0)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleRunTeam}
            disabled={state.isBatchRunning || !state.selectedNoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#dc2626', color: '#fff' }}
          >
            {state.isBatchRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running…
              </>
            ) : (
              `Run for ${noc}`
            )}
          </button>
        </div>
      </div>

      {state.batchError && (
        <div className="rounded-lg border border-[rgba(220,38,38,0.4)] bg-[rgba(220,38,38,0.08)] px-3 py-2">
          <p className="font-body text-xs text-[#ef4444]">{state.batchError}</p>
        </div>
      )}

      {s && (
        <>
          {/* Metric cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Mean Quals Total" value={num(s.mean_quals_total)} />
            <MetricCard
              label="Mean Quals Rank"
              value={s.mean_quals_rank != null ? num(s.mean_quals_rank, 1) : null}
            />
            <MetricCard
              label="TF Qual Rate"
              value={pct(s.tf_qual_rate)}
              highlight={s.tf_qual_rate != null && s.tf_qual_rate >= 0.5}
            />
            <MetricCard label="Mean TF Total" value={num(s.mean_tf_total)} />
            <MetricCard
              label="Mean TF Rank"
              value={s.mean_tf_rank != null ? num(s.mean_tf_rank, 1) : null}
            />
            <MetricCard label="Mean EF Qualifiers" value={num(s.mean_ef_qualifiers, 2)} />
            <MetricCard label="Mean AA Qualifiers" value={num(s.mean_aa_qualifiers, 2)} />
          </div>

          {/* EF breakdown */}
          {s.ef_breakdown && (
            <div>
              <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">Mean EF Qualifiers by Event</p>
              <div className="grid grid-cols-4 gap-2">
                {APPARATUS.map((a) => (
                  <div
                    key={a}
                    className="rounded-lg p-3 text-center"
                    style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}
                  >
                    <p className="font-body text-xs text-[var(--c-txt-4)] mb-1">{a}</p>
                    <p className="font-body text-sm font-semibold text-[var(--c-txt-0)] tabular-nums">
                      {num(s.ef_breakdown[a], 2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rank distribution */}
          {s.tf_rank_distribution && s.tf_rank_distribution.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedDist((v) => !v)}
                className="flex items-center gap-1.5 font-body text-xs text-[var(--c-txt-4)] hover:text-[var(--c-txt-1)] transition-colors mb-2"
              >
                TF Rank Distribution{' '}
                <span className="text-[var(--c-txt-6)]">{expandedDist ? '▲' : '▼'}</span>
              </button>
              {expandedDist && (
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}
                >
                  <DistributionChart
                    data={s.tf_rank_distribution}
                    label="TF Rank distribution"
                    height={80}
                  />
                </div>
              )}
            </div>
          )}

          {/* Gymnast EF rates table */}
          {s.gymnast_ef_rates && Object.keys(s.gymnast_ef_rates).length > 0 && (
            <div>
              <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">Gymnast Qualification Rates</p>
              <div className="overflow-x-auto rounded-xl border border-[var(--c-border-sm)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--c-border-md)] bg-[var(--c-bg-5)]">
                      <th className="text-left px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">
                        Gymnast
                      </th>
                      {APPARATUS.map((a) => (
                        <th
                          key={a}
                          className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold"
                        >
                          {a} EF%
                        </th>
                      ))}
                      <th className="text-right px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">
                        AA%
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(s.gymnast_ef_rates).map(([gymnast, rates]) => (
                      <tr
                        key={gymnast}
                        className="border-b border-[var(--c-border-sm)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        <td className="px-3 py-2 font-body text-xs text-[var(--c-txt-2)]">{gymnast}</td>
                        {APPARATUS.map((a) => (
                          <td
                            key={a}
                            className="px-3 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]"
                          >
                            {rates[a] != null ? pct(rates[a]) : '—'}
                          </td>
                        ))}
                        <td className="px-3 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-1)]">
                          {s.gymnast_aa_rates?.[gymnast] != null
                            ? pct(s.gymnast_aa_rates[gymnast])
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gymnast Search sub-panel
// ---------------------------------------------------------------------------

function GymnastSearch() {
  const [state, dispatch] = useWorlds()
  const APPARATUS = state.apparatus
  const [selectedGymnast, setSelectedGymnast] = useState('')
  const [nSims, setNSims] = useState(200)
  const [expandedApp, setExpandedApp] = useState<Apparatus | null>(null)

  const country = state.countries.find((c) => c.noc === state.selectedNoc)
  const lineup = state.selectedNoc ? state.lineups[state.selectedNoc] : null
  const teamMembers = lineup?.team ?? country?.gymnasts.map((g) => g.name) ?? []

  async function handleRunGymnast() {
    if (!state.selectedNoc || !selectedGymnast) return
    if (Object.keys(state.lineups).length === 0) return

    dispatch({ type: 'BATCH_START' })
    try {
      const result = await runBatch(state.lineups, {
        nSims,
        aggregateCountry: state.selectedNoc,
        aggregateGymnast: selectedGymnast,
        discipline: state.discipline,
        scoreFilter: state.scoreFilter,
      })
      dispatch({ type: 'BATCH_GYMNAST_SUCCESS', stats: result as BatchGymnastStats })
    } catch (err) {
      dispatch({
        type: 'BATCH_ERROR',
        msg: err instanceof Error ? err.message : 'Batch failed',
      })
    }
  }

  const gs = state.gymnstStats

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h4 className="font-display text-sm font-semibold text-[var(--c-txt-0)]">Gymnast Search</h4>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <select
            value={selectedGymnast}
            onChange={(e) => setSelectedGymnast(e.target.value)}
            className="bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-1.5 text-xs text-[var(--c-txt-0)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors"
          >
            <option value="">Select gymnast…</option>
            {teamMembers.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <label className="font-body text-xs text-[var(--c-txt-4)]">Sims:</label>
          <input
            type="number"
            value={nSims}
            min={50}
            max={2000}
            step={50}
            onChange={(e) => setNSims(parseInt(e.target.value) || 200)}
            className="w-20 bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-2 py-1 text-xs text-[var(--c-txt-0)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={handleRunGymnast}
            disabled={state.isBatchRunning || !selectedGymnast || !state.selectedNoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#dc2626', color: '#fff' }}
          >
            {state.isBatchRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running…
              </>
            ) : (
              'Run'
            )}
          </button>
        </div>
      </div>

      {state.batchError && (
        <div className="rounded-lg border border-[rgba(220,38,38,0.4)] bg-[rgba(220,38,38,0.08)] px-3 py-2">
          <p className="font-body text-xs text-[#ef4444]">{state.batchError}</p>
        </div>
      )}

      {gs && (
        <>
          {/* Apparatus grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {APPARATUS.map((a) => {
              const appStats = gs.apparatus[a]
              const isExpanded = expandedApp === a
              if (!appStats?.competed) return null
              return (
                <div
                  key={a}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}
                >
                  <div className="px-3 pt-3 pb-2 border-b border-[var(--c-border-sm)]">
                    <p className="font-display text-xs font-semibold text-[#ef4444]">{a}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-[var(--c-txt-4)]">Quals Score</span>
                      <span className="font-body text-xs tabular-nums text-[var(--c-txt-0)]">
                        {num(appStats.mean_quals_score)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-[var(--c-txt-4)]">EF Qual Rate</span>
                      <span className="font-body text-xs tabular-nums text-[var(--c-txt-0)]">
                        {pct(appStats.ef_qual_rate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-[var(--c-txt-4)]">Mean EF Rank</span>
                      <span className="font-body text-xs tabular-nums text-[var(--c-txt-0)]">
                        {appStats.mean_ef_rank != null ? num(appStats.mean_ef_rank, 1) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-[var(--c-txt-4)]">Medal Rate</span>
                      <span className="font-body text-xs tabular-nums text-[var(--c-txt-0)]">
                        {pct(appStats.ef_medal_rate)}
                      </span>
                    </div>
                    {appStats.ef_rank_distribution && appStats.ef_rank_distribution.length > 0 && (
                      <>
                        <button
                          onClick={() => setExpandedApp(isExpanded ? null : a)}
                          className="w-full text-left font-body text-xs text-[var(--c-txt-5)] hover:text-[var(--c-txt-3)] transition-colors mt-1"
                        >
                          {isExpanded ? 'Hide dist ▲' : 'Show dist ▼'}
                        </button>
                        {isExpanded && (
                          <DistributionChart
                            data={appStats.ef_rank_distribution}
                            label={`${a} EF rank`}
                            height={60}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* AA stats */}
          {gs.all_around && (
            <div>
              <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">All-Around</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <MetricCard
                  label="Mean Quals Total"
                  value={num(gs.all_around.mean_quals_total)}
                />
                <MetricCard
                  label="AA Qual Rate"
                  value={pct(gs.all_around.aa_qual_rate)}
                  highlight={
                    gs.all_around.aa_qual_rate != null && gs.all_around.aa_qual_rate >= 0.5
                  }
                />
                <MetricCard
                  label="Mean AA Rank"
                  value={
                    gs.all_around.mean_aa_rank != null
                      ? num(gs.all_around.mean_aa_rank, 1)
                      : null
                  }
                />
                <MetricCard label="Medal Rate" value={pct(gs.all_around.aa_medal_rate)} />
              </div>
              {gs.all_around.aa_rank_distribution && gs.all_around.aa_rank_distribution.length > 0 && (
                <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border-md)' }}>
                  <p className="font-body text-xs text-[var(--c-txt-4)] mb-2">AA Rank Distribution</p>
                  <DistributionChart
                    data={gs.all_around.aa_rank_distribution}
                    label="AA rank"
                    height={80}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function AnalyticsPanel() {
  const [state] = useWorlds()

  if (!state.selectedNoc) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="font-body text-sm text-[var(--c-txt-5)]">Select a country to run analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Divider */}
      <div className="h-px bg-[var(--c-border-sm)]" />
      <TeamAnalysis />
      <div className="h-px bg-[var(--c-border-sm)]" />
      <GymnastSearch />
    </div>
  )
}

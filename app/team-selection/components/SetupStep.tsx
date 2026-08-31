'use client'

import { useTeamSelection } from '../TeamSelectionProvider'
import type { BenchmarkType } from '../TeamSelectionProvider'
import type { Discipline } from '@/types/simulation'
import { fetchCountries } from '@/lib/api'

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: 'WAG', label: "Women's Artistic" },
  { value: 'MAG', label: "Men's Artistic" },
]

const BENCHMARKS: { value: BenchmarkType; label: string; description: string }[] = [
  {
    value: 'world',
    label: 'World Field',
    description: 'Compare against the ~10 countries currently competing at Worlds',
  },
  {
    value: 'national',
    label: 'National Team',
    description: 'Head-to-head against one existing national team',
  },
  {
    value: 'custom',
    label: 'Custom Opponent',
    description: 'Build a second all-star team to face off against',
  },
]

export function SetupStep() {
  const [state, dispatch] = useTeamSelection()

  async function handleNext() {
    // Pre-load countries
    if (!state.countriesLoaded) {
      try {
        const countries = await fetchCountries(state.discipline, {
          excludeDomestic: state.scoreFilter.excludeDomestic,
          excludeNonFig: state.scoreFilter.excludeNonFig,
        })
        dispatch({ type: 'SET_COUNTRIES', countries })
      } catch {}
    }
    dispatch({ type: 'SET_STEP', step: 'team-a' })
  }

  return (
    <div className="max-w-lg mx-auto py-16 px-6 space-y-10">
      {/* Discipline */}
      <div className="space-y-3">
        <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626]">
          Discipline
        </p>
        <div className="flex gap-3">
          {DISCIPLINES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => dispatch({ type: 'SET_DISCIPLINE', discipline: value })}
              className="flex-1 py-3 px-4 rounded-xl border font-body text-sm transition-all duration-150"
              style={{
                backgroundColor: state.discipline === value ? 'rgba(220,38,38,0.12)' : 'var(--c-bg-2)',
                borderColor: state.discipline === value ? '#dc2626' : 'var(--c-border-lg)',
                color: state.discipline === value ? '#ef4444' : 'var(--c-txt-2)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Score Filter */}
      <div className="space-y-3">
        <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626]">
          Score Filter
        </p>
        <div className="space-y-2">
          {[
            { key: 'excludeDomestic' as const, label: 'Exclude domestic meets' },
            { key: 'excludeNonFig' as const, label: 'Exclude non-FIG meets' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div
                className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  borderColor: state.scoreFilter[key] ? '#dc2626' : 'var(--c-border-lg)',
                  backgroundColor: state.scoreFilter[key] ? '#dc2626' : 'transparent',
                }}
                onClick={() => dispatch({ type: 'SET_SCORE_FILTER', filter: { [key]: !state.scoreFilter[key] } })}
              >
                {state.scoreFilter[key] && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className="font-body text-sm transition-colors"
                style={{ color: state.scoreFilter[key] ? 'var(--c-txt-0)' : 'var(--c-txt-3)' }}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Benchmark */}
      <div className="space-y-3">
        <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626]">
          Benchmark
        </p>
        <div className="space-y-2">
          {BENCHMARKS.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => dispatch({ type: 'SET_BENCHMARK', benchmarkType: value })}
              className="w-full text-left p-4 rounded-xl border transition-all duration-150"
              style={{
                backgroundColor: state.benchmarkType === value ? 'rgba(220,38,38,0.08)' : 'var(--c-bg-2)',
                borderColor: state.benchmarkType === value ? '#dc2626' : 'var(--c-border-lg)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors"
                  style={{
                    borderColor: state.benchmarkType === value ? '#dc2626' : 'var(--c-border-xl)',
                    backgroundColor: state.benchmarkType === value ? '#dc2626' : 'transparent',
                  }}
                />
                <div>
                  <p className="font-body text-sm font-semibold" style={{ color: state.benchmarkType === value ? '#ef4444' : 'var(--c-txt-1)' }}>
                    {label}
                  </p>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--c-txt-4)' }}>
                    {description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 rounded-xl font-body text-sm font-semibold transition-all"
        style={{ backgroundColor: '#dc2626', color: '#fff' }}
      >
        Build Your Team →
      </button>
    </div>
  )
}

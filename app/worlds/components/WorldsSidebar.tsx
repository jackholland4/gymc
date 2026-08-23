'use client'

import { useState } from 'react'
import { useWorlds } from '../WorldsProvider'
import { SimulateButton } from './SimulateButton'
import { TopCandidatesPanel } from './TopCandidatesPanel'
import type { Apparatus, LineupConfig } from '@/types/simulation'

// ---------------------------------------------------------------------------
// Lineup Pill + Add Dropdown
// ---------------------------------------------------------------------------

function LineupRow({
  apparatus,
  gymnasts,
  max,
  team,
  onRemove,
  onAdd,
}: {
  apparatus: Apparatus
  gymnasts: string[]
  max: number
  team: string[]
  onRemove: (g: string) => void
  onAdd: (g: string) => void
}) {
  const [addOpen, setAddOpen] = useState(false)
  const available = team.filter((g) => !gymnasts.includes(g))

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-[var(--c-txt-4)] uppercase tracking-wider">{apparatus}</span>
        <span className="font-body text-xs text-[var(--c-txt-6)]">
          {gymnasts.length}/{max}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {gymnasts.map((g) => (
          <span
            key={g}
            className="inline-flex items-center gap-1 bg-[var(--c-bg-3)] border border-[var(--c-border-md)] rounded-md px-2 py-0.5 font-body text-xs text-[var(--c-txt-2)]"
          >
            {g}
            <button
              onClick={() => onRemove(g)}
              className="text-[var(--c-txt-5)] hover:text-[#ef4444] transition-colors leading-none"
              aria-label={`Remove ${g}`}
            >
              ×
            </button>
          </span>
        ))}

        {gymnasts.length < max && available.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setAddOpen((v) => !v)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[var(--c-bg-3)] border border-[var(--c-border-md)] text-[var(--c-txt-4)] hover:text-[#ef4444] hover:border-[rgba(220,38,38,0.3)] transition-colors font-body text-sm leading-none"
              aria-label="Add gymnast"
            >
              +
            </button>
            {addOpen && (
              <div className="absolute left-0 top-6 z-50 min-w-[140px] bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg shadow-xl overflow-hidden">
                {available.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      onAdd(g)
                      setAddOpen(false)
                    }}
                    className="w-full text-left px-3 py-1.5 font-body text-xs text-[var(--c-txt-2)] hover:bg-[rgba(220,38,38,0.1)] hover:text-[#ef4444] transition-colors"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-[var(--c-border-sm)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 font-body text-xs font-semibold text-[var(--c-txt-3)] hover:text-[var(--c-txt-2)] transition-colors select-none"
      >
        {title}
        <span className="text-[var(--c-txt-5)]">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Sidebar
// ---------------------------------------------------------------------------

export function WorldsSidebar() {
  const [state, dispatch] = useWorlds()
  const APPARATUS = state.apparatus

  const lineup = state.selectedNoc ? state.lineups[state.selectedNoc] : null

  // ---- Country selection ----
  function handleSelectCountry(noc: string) {
    dispatch({ type: 'SELECT_NOC', noc: noc || null })
  }

  // ---- Quals lineup ----
  function removeFromQuals(apparatus: Apparatus, gymnast: string) {
    if (!state.selectedNoc || !lineup) return
    const updated: LineupConfig = {
      ...lineup,
      quals: {
        ...lineup.quals,
        [apparatus]: lineup.quals[apparatus].filter((g) => g !== gymnast),
      },
    }
    dispatch({ type: 'SET_LINEUP', noc: state.selectedNoc, lineup: updated })
  }

  function addToQuals(apparatus: Apparatus, gymnast: string) {
    if (!state.selectedNoc || !lineup) return
    if (lineup.quals[apparatus].length >= 4) return
    const updated: LineupConfig = {
      ...lineup,
      quals: {
        ...lineup.quals,
        [apparatus]: [...lineup.quals[apparatus], gymnast],
      },
    }
    dispatch({ type: 'SET_LINEUP', noc: state.selectedNoc, lineup: updated })
  }

  // ---- Team Final lineup ----
  function removeFromTF(apparatus: Apparatus, gymnast: string) {
    if (!state.selectedNoc || !lineup) return
    const updated: LineupConfig = {
      ...lineup,
      teamFinal: {
        ...lineup.teamFinal,
        [apparatus]: lineup.teamFinal[apparatus].filter((g) => g !== gymnast),
      },
    }
    dispatch({ type: 'SET_LINEUP', noc: state.selectedNoc, lineup: updated })
  }

  function addToTF(apparatus: Apparatus, gymnast: string) {
    if (!state.selectedNoc || !lineup) return
    if (lineup.teamFinal[apparatus].length >= 3) return
    const updated: LineupConfig = {
      ...lineup,
      teamFinal: {
        ...lineup.teamFinal,
        [apparatus]: [...lineup.teamFinal[apparatus], gymnast],
      },
    }
    dispatch({ type: 'SET_LINEUP', noc: state.selectedNoc, lineup: updated })
  }

  return (
    <aside className="w-96 shrink-0 h-full overflow-y-auto bg-[var(--c-bg-6)] border-r border-[var(--c-border-sm)] flex flex-col">
      {/* Country Selector */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--c-border-sm)]">
        <label className="block font-body text-xs font-semibold text-[var(--c-txt-4)] mb-2 uppercase tracking-wider">
          Country
        </label>
        {state.countriesError && (
          <div className="mb-2 rounded-lg border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.08)] px-3 py-2">
            <p className="font-body text-xs text-[#ef4444] whitespace-pre-wrap">{state.countriesError}</p>
          </div>
        )}
        <select
          value={state.selectedNoc ?? ''}
          onChange={(e) => handleSelectCountry(e.target.value)}
          className="w-full bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-2 text-sm text-[var(--c-txt-0)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors"
        >
          <option value="">Select country…</option>
          {state.countries.map((c) => (
            <option key={c.noc} value={c.noc}>
              {c.name} ({c.noc}){c.is_team_country ? ' ★' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Team Selector */}
      {state.selectedNoc && (
        <Section title={`Team (${lineup?.team.length ?? 0}/5 selected)`} defaultOpen>
          <TopCandidatesPanel noc={state.selectedNoc} />
        </Section>
      )}

      {/* Lineup Editor */}
      {lineup && (
        <>
          <Section title="Quals Lineup (4 per event)" defaultOpen={false}>
            <div className="space-y-3">
              {APPARATUS.map((a) => (
                <LineupRow
                  key={a}
                  apparatus={a}
                  gymnasts={lineup.quals[a]}
                  max={4}
                  team={lineup.team}
                  onRemove={(g) => removeFromQuals(a, g)}
                  onAdd={(g) => addToQuals(a, g)}
                />
              ))}
            </div>
          </Section>

          <Section title="Team Final (3 per event)" defaultOpen={false}>
            <div className="space-y-3">
              {APPARATUS.map((a) => (
                <LineupRow
                  key={a}
                  apparatus={a}
                  gymnasts={lineup.teamFinal[a]}
                  max={3}
                  team={lineup.team}
                  onRemove={(g) => removeFromTF(a, g)}
                  onAdd={(g) => addToTF(a, g)}
                />
              ))}
            </div>
          </Section>
        </>
      )}

      {/* Score filters */}
      <div className="px-4 py-3 border-t border-[var(--c-border-sm)]">
        <p className="font-body text-xs font-semibold text-[var(--c-txt-4)] uppercase tracking-wider mb-2">Score data</p>
        <label className="flex items-center gap-2 cursor-pointer mb-1.5">
          <input
            type="checkbox"
            checked={state.scoreFilter.includeDomestic}
            onChange={(e) => dispatch({ type: 'SET_SCORE_FILTER', filter: { includeDomestic: e.target.checked } })}
            className="accent-[#dc2626]"
          />
          <span className="font-body text-xs text-[var(--c-txt-2)]">Include domestic meets</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.scoreFilter.includeNonFig}
            onChange={(e) => dispatch({ type: 'SET_SCORE_FILTER', filter: { includeNonFig: e.target.checked } })}
            className="accent-[#dc2626]"
          />
          <span className="font-body text-xs text-[var(--c-txt-2)]">Include non-FIG meets</span>
        </label>
      </div>

      {/* Simulate */}
      <div className="px-4 py-4 border-t border-[var(--c-border-sm)]">
        <SimulateButton />
      </div>
    </aside>
  )
}

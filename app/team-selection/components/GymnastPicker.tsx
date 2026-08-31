'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTeamSelection } from '../TeamSelectionProvider'
import type { GymnastEntry } from '@/types/simulation'
import type { Step } from '../TeamSelectionProvider'
import { fetchGymnastPhoto } from '@/lib/api'

const NOC_FLAGS: Record<string, string> = {
  USA: '🇺🇸', CHN: '🇨🇳', GBR: '🇬🇧', RUS: '🇷🇺', JPN: '🇯🇵',
  FRA: '🇫🇷', AUS: '🇦🇺', ITA: '🇮🇹', GER: '🇩🇪', ROU: '🇷🇴',
  NED: '🇳🇱', BRA: '🇧🇷', CAN: '🇨🇦', KOR: '🇰🇷', BEL: '🇧🇪',
  ALG: '🇩🇿', ISR: '🇮🇱', UKR: '🇺🇦', IRL: '🇮🇪', NZL: '🇳🇿',
  SUI: '🇨🇭', SVK: '🇸🇰', HUN: '🇭🇺', POL: '🇵🇱', CZE: '🇨🇿',
  POR: '🇵🇹', ESP: '🇪🇸', FIN: '🇫🇮', NOR: '🇳🇴', SWE: '🇸🇪',
}

function flag(noc: string) { return NOC_FLAGS[noc] ?? '' }

// ---------------------------------------------------------------------------
// Gymnast photo card
// ---------------------------------------------------------------------------

type PhotoState = 'loading' | string | null   // null = confirmed no photo

function GymnastCard({
  entry,
  apparatus,
  photo,
  onRemove,
}: {
  entry: GymnastEntry
  apparatus: string[]
  photo: PhotoState
  onRemove: () => void
}) {
  return (
    <div
      className="flex items-stretch gap-0 rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--c-border-md)', backgroundColor: 'var(--c-bg-2)' }}
    >
      {/* Photo */}
      <div className="w-16 flex-shrink-0 relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        {photo === 'loading' && (
          <div className="absolute inset-0 bg-[var(--c-bg-4)] animate-pulse" />
        )}
        {photo && photo !== 'loading' && (
          <img
            src={photo}
            alt={entry.gymnast}
            className="absolute inset-0 w-full h-full object-cover object-top grayscale"
          />
        )}
        {photo === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--c-bg-4)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.2" className="text-[var(--c-txt-6)]">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between px-3 py-2.5">
        <div className="flex items-start justify-between gap-1">
          <p className="font-body text-sm font-semibold text-[var(--c-txt-0)] leading-tight truncate">
            {entry.gymnast}
          </p>
          <button
            onClick={onRemove}
            className="flex-shrink-0 text-[var(--c-txt-5)] hover:text-[#ef4444] transition-colors text-lg leading-none -mt-0.5"
            aria-label={`Remove ${entry.gymnast}`}
          >
            ×
          </button>
        </div>
        <div className="mt-1 space-y-1">
          <p className="font-body text-xs text-[var(--c-txt-4)]">
            {flag(entry.noc)} {entry.noc}
          </p>
          <div className="flex flex-wrap gap-0.5">
            {apparatus.map(a => (
              <span
                key={a}
                className="px-1 py-px rounded text-[9px] font-body font-semibold"
                style={{ backgroundColor: 'var(--c-bg-4)', color: 'var(--c-txt-5)' }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptySlot() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-3 border border-dashed"
      style={{ borderColor: 'var(--c-border-lg)' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: 'var(--c-bg-3)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" className="text-[var(--c-txt-6)]">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
      <p className="font-body text-xs text-[var(--c-txt-6)]">Empty slot</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main picker
// ---------------------------------------------------------------------------

interface GymnastPickerProps {
  team: 'a' | 'b'
  roster: GymnastEntry[]
  nextStep: Step
  nextLabel: string
  backStep: Step
}

export function GymnastPicker({ team, roster, nextStep, nextLabel, backStep }: GymnastPickerProps) {
  const [state, dispatch] = useTeamSelection()
  const [query, setQuery] = useState('')
  const [nocFilter, setNocFilter] = useState('ALL')
  // photo cache: gymnast name → url string | null | 'loading'
  const [photos, setPhotos] = useState<Record<string, PhotoState>>({})
  // apparatus lookup: gymnast name → apparatus[]
  const [apparatusMap, setApparatusMap] = useState<Record<string, string[]>>({})

  const addAction = team === 'a' ? 'ADD_GYMNAST_A' : 'ADD_GYMNAST_B'
  const removeAction = team === 'a' ? 'REMOVE_GYMNAST_A' : 'REMOVE_GYMNAST_B'

  // Flatten gymnasts
  const allGymnasts = useMemo(() => {
    const result: { gymnast: string; noc: string; country: string; apparatus: string[] }[] = []
    const appMap: Record<string, string[]> = {}
    for (const c of state.countries) {
      for (const g of c.gymnasts) {
        result.push({ gymnast: g.name, noc: c.noc, country: c.name, apparatus: g.apparatus as string[] })
        appMap[g.name] = g.apparatus as string[]
      }
    }
    setApparatusMap(appMap)
    return result
  }, [state.countries])

  const nocs = useMemo(() => {
    const seen = new Set<string>()
    return state.countries
      .filter(c => { if (seen.has(c.noc)) return false; seen.add(c.noc); return true })
      .map(c => ({ noc: c.noc, name: c.name }))
      .sort((a, b) => a.noc.localeCompare(b.noc))
  }, [state.countries])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allGymnasts.filter(g => {
      if (nocFilter !== 'ALL' && g.noc !== nocFilter) return false
      if (q && !g.gymnast.toLowerCase().includes(q) && !g.noc.toLowerCase().includes(q)) return false
      return true
    })
  }, [allGymnasts, query, nocFilter])

  // Fetch photos for roster members whenever roster changes
  useEffect(() => {
    for (const entry of roster) {
      if (entry.gymnast in photos) continue  // already fetched
      setPhotos(prev => ({ ...prev, [entry.gymnast]: 'loading' }))
      fetchGymnastPhoto(entry.noc, entry.gymnast)
        .then(({ photo_url }) => {
          setPhotos(prev => ({ ...prev, [entry.gymnast]: photo_url }))
        })
        .catch(() => {
          setPhotos(prev => ({ ...prev, [entry.gymnast]: null }))
        })
    }
  }, [roster]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSet = new Set(roster.map(e => e.gymnast))
  const canAdd = roster.length < 5

  function toggleGymnast(entry: { gymnast: string; noc: string }) {
    if (selectedSet.has(entry.gymnast)) {
      dispatch({ type: removeAction, gymnast: entry.gymnast })
    } else if (canAdd) {
      dispatch({ type: addAction, entry: { gymnast: entry.gymnast, noc: entry.noc } })
    }
  }

  const label = team === 'a' ? 'Your Team' : 'Opponent Team'

  return (
    <div className="flex h-[calc(100vh-4rem-44px)]">
      {/* Left: search + list */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-[var(--c-border-sm)]">
        <div className="flex gap-2 p-4 border-b border-[var(--c-border-sm)]">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search gymnast or NOC…"
            className="flex-1 bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-2 text-sm font-body text-[var(--c-txt-0)] placeholder:text-[var(--c-txt-5)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors"
          />
          <select
            value={nocFilter}
            onChange={e => setNocFilter(e.target.value)}
            className="bg-[var(--c-bg-2)] border border-[var(--c-border-lg)] rounded-lg px-3 py-2 text-sm font-body text-[var(--c-txt-0)] outline-none focus:border-[rgba(220,38,38,0.4)] transition-colors"
          >
            <option value="ALL">All countries</option>
            {nocs.map(({ noc, name }) => (
              <option key={noc} value={noc}>{flag(noc)} {noc} — {name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!state.countriesLoaded ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-6 font-body text-sm text-[var(--c-txt-5)] text-center">No gymnasts match.</p>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 border-b border-[var(--c-border-md)]" style={{ backgroundColor: 'var(--c-bg-5)' }}>
                <tr>
                  <th className="text-left px-4 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Gymnast</th>
                  <th className="text-left px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">NOC</th>
                  <th className="text-left px-3 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Events</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const selected = selectedSet.has(g.gymnast)
                  const disabled = !selected && !canAdd
                  return (
                    <tr
                      key={`${g.noc}-${g.gymnast}`}
                      onClick={() => !disabled && toggleGymnast(g)}
                      className="border-b border-[var(--c-border-sm)] transition-colors"
                      style={{
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        backgroundColor: selected ? 'rgba(220,38,38,0.08)' : undefined,
                        opacity: disabled ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.backgroundColor = selected ? 'rgba(220,38,38,0.12)' : 'var(--c-bg-1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = selected ? 'rgba(220,38,38,0.08)' : '' }}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{
                              borderColor: selected ? '#dc2626' : 'var(--c-border-xl)',
                              backgroundColor: selected ? '#dc2626' : 'transparent',
                            }}
                          >
                            {selected && (
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                          <span className="font-body text-sm text-[var(--c-txt-1)]">{g.gymnast}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-body text-xs text-[var(--c-txt-3)]">
                          {flag(g.noc)} {g.noc}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {g.apparatus.map(a => (
                            <span
                              key={a}
                              className="px-1.5 py-0.5 rounded text-[10px] font-body font-semibold"
                              style={{ backgroundColor: 'var(--c-bg-3)', color: 'var(--c-txt-4)' }}
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: roster with photos */}
      <div className="w-72 flex flex-col" style={{ backgroundColor: 'var(--c-bg-1)' }}>
        <div className="px-4 py-3 border-b border-[var(--c-border-sm)]">
          <p className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-[#dc2626]">
            {label}
          </p>
          <p className="font-body text-xs text-[var(--c-txt-5)] mt-0.5">
            {roster.length}/5 selected
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {roster.map(e => (
            <GymnastCard
              key={e.gymnast}
              entry={e}
              apparatus={apparatusMap[e.gymnast] ?? []}
              photo={photos[e.gymnast] ?? 'loading'}
              onRemove={() => dispatch({ type: removeAction, gymnast: e.gymnast })}
            />
          ))}
          {Array.from({ length: 5 - roster.length }).map((_, i) => (
            <EmptySlot key={`empty-${i}`} />
          ))}
        </div>

        <div className="p-3 space-y-2 border-t border-[var(--c-border-sm)]">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: nextStep })}
            disabled={roster.length < 5}
            className="w-full py-2.5 rounded-lg font-body text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#dc2626', color: '#fff' }}
          >
            {nextLabel} →
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: backStep })}
            className="w-full py-2 rounded-lg font-body text-xs transition-colors"
            style={{ color: 'var(--c-txt-4)' }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}

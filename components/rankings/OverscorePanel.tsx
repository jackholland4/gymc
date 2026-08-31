'use client'

import { useState, useEffect } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApparatusDetail {
  apparatus: string
  domestic_mean: number
  international_mean: number
  delta: number
  domestic_n: number
  international_n: number
}

interface GymnastRow {
  gymnast: string
  noc: string
  index: number
  n_apparatus: number
  apparatus: ApparatusDetail[]
}

interface NationalRow {
  noc: string
  index: number
  n_gymnasts: number
  gymnasts: GymnastRow[]
}

interface OverscoreData {
  discipline: string
  n_gymnasts: number
  nations: NationalRow[]
}

function sign(n: number) {
  return n > 0 ? `+${n.toFixed(3)}` : n.toFixed(3)
}

function DeltaCell({ delta }: { delta: number }) {
  const abs = Math.abs(delta)
  const isPos = delta > 0
  const color = abs < 0.05 ? 'var(--c-txt-4)' : isPos ? '#16a34a' : '#dc2626'
  return (
    <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {sign(delta)}
    </span>
  )
}

function GymnastDrilldown({ gymnast, onClose }: { gymnast: GymnastRow; onClose: () => void }) {
  return (
    <div
      className="mt-2 mb-1 rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--c-border-md)', backgroundColor: 'var(--c-bg-2)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--c-border-md)', backgroundColor: 'var(--c-bg-3)' }}
      >
        <span className="font-body text-sm font-semibold text-[var(--c-txt-0)]">
          {gymnast.gymnast}
        </span>
        <button
          onClick={onClose}
          className="font-body text-xs text-[var(--c-txt-4)] hover:text-[var(--c-txt-1)] transition-colors"
        >
          Close ×
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--c-border-sm)' }}>
            <th className="text-left px-4 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Event</th>
            <th className="text-right px-4 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Domestic E</th>
            <th className="text-right px-4 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Intl E</th>
            <th className="text-right px-4 py-2 font-body text-xs text-[var(--c-txt-4)] font-semibold">Delta</th>
          </tr>
        </thead>
        <tbody>
          {gymnast.apparatus.map((a) => (
            <tr key={a.apparatus} className="border-b" style={{ borderColor: 'var(--c-border-sm)' }}>
              <td className="px-4 py-2 font-body text-xs font-semibold text-[var(--c-txt-2)]">{a.apparatus}</td>
              <td className="px-4 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-2)]">
                {a.domestic_mean.toFixed(3)}
                <span className="ml-1 text-[var(--c-txt-5)]">
                  ({a.domestic_n}{a.domestic_n > 3 ? '*' : ''})
                </span>
              </td>
              <td className="px-4 py-2 font-body text-xs tabular-nums text-right text-[var(--c-txt-2)]">
                {a.international_mean.toFixed(3)}
                <span className="ml-1 text-[var(--c-txt-5)]">
                  ({a.international_n}{a.international_n > 3 ? '*' : ''})
                </span>
              </td>
              <td className="px-4 py-2 font-body text-xs text-right">
                <DeltaCell delta={a.delta} />
              </td>
            </tr>
          ))}
          <tr style={{ backgroundColor: 'var(--c-bg-3)' }}>
            <td colSpan={3} className="px-4 py-2 font-body text-xs font-semibold text-[var(--c-txt-3)]">
              Gymnast Index
            </td>
            <td className="px-4 py-2 font-body text-xs font-semibold text-right">
              <DeltaCell delta={gymnast.index} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function OverscorePanel({ discipline }: { discipline: string }) {
  const [data, setData] = useState<OverscoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [openGymnast, setOpenGymnast] = useState<Record<string, string | null>>({})

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${BASE_URL}/api/overscoring?discipline=${discipline}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [discipline])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center font-body text-sm text-[var(--c-txt-4)]">
        Failed to load overscoring data: {error}
      </div>
    )
  }

  if (!data || data.nations.length === 0) {
    return (
      <div className="py-16 text-center space-y-2">
        <p className="font-body text-sm font-semibold text-[var(--c-txt-1)]">No overscoring data available</p>
        <p className="font-body text-xs text-[var(--c-txt-4)]">
          Requires gymnasts with both domestic and international E-scores in the scoresheet database.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Explainer */}
      <div
        className="rounded-xl px-5 py-4 font-body text-xs text-[var(--c-txt-3)] leading-relaxed"
        style={{ backgroundColor: 'var(--c-bg-2)', border: '1px solid var(--c-border-sm)' }}
      >
        <span className="font-semibold text-[var(--c-txt-1)]">Domestic Premium</span>
        {' '}measures the execution-score gap between domestic and international meets.
        {' '}<span className="text-[#16a34a] font-semibold">Positive</span> = scored higher domestically;{' '}
        <span className="text-[#dc2626] font-semibold">negative</span> = scored higher internationally.
        {' '}Only gymnasts with E-scores in both contexts are included.
        {' '}{data.n_gymnasts} gymnast{data.n_gymnasts !== 1 ? 's' : ''} matched.
        {' '}Counts marked <span className="font-semibold text-[var(--c-txt-2)]">*</span> use an IQR-trimmed mean (scores outside Q1–Q3 dropped) to reduce fall distortion.
      </div>

      {/* National table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--c-border-md)' }}
      >
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{ backgroundColor: 'var(--c-bg-3)', borderColor: 'var(--c-border-md)' }}
            >
              <th className="text-left px-5 py-3 font-body text-xs font-semibold text-[var(--c-txt-4)]">Country</th>
              <th className="text-right px-5 py-3 font-body text-xs font-semibold text-[var(--c-txt-4)]">Index</th>
              <th className="text-right px-5 py-3 font-body text-xs font-semibold text-[var(--c-txt-4)]">Gymnasts</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.nations.map((nation, ni) => (
              <>
                <tr
                  key={nation.noc}
                  className="border-b transition-colors cursor-pointer"
                  style={{
                    borderColor: 'var(--c-border-sm)',
                    backgroundColor:
                      expanded === nation.noc ? 'rgba(220,38,38,0.05)' : ni % 2 === 0 ? 'var(--c-bg-1)' : 'var(--c-bg-0)',
                  }}
                  onClick={() => setExpanded(expanded === nation.noc ? null : nation.noc)}
                  onMouseEnter={(e) => {
                    if (expanded !== nation.noc)
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--c-bg-2)'
                  }}
                  onMouseLeave={(e) => {
                    if (expanded !== nation.noc)
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        ni % 2 === 0 ? 'var(--c-bg-1)' : 'var(--c-bg-0)'
                  }}
                >
                  <td className="px-5 py-3 font-body text-sm font-semibold text-[var(--c-txt-1)]">
                    {nation.noc}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-right font-semibold">
                    <DeltaCell delta={nation.index} />
                  </td>
                  <td className="px-5 py-3 font-body text-xs text-right text-[var(--c-txt-4)]">
                    {nation.n_gymnasts}
                  </td>
                  <td className="px-5 py-3 text-right font-body text-xs text-[var(--c-txt-5)]">
                    {expanded === nation.noc ? '▲' : '▼'}
                  </td>
                </tr>
                {expanded === nation.noc && (
                  <tr key={`${nation.noc}-detail`}>
                    <td colSpan={4} className="px-5 py-3" style={{ backgroundColor: 'var(--c-bg-1)' }}>
                      <div className="space-y-2">
                        {/* Gymnast summary rows */}
                        <table className="w-full">
                          <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--c-border-sm)' }}>
                              <th className="text-left py-1.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">Gymnast</th>
                              <th className="text-right py-1.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">Index</th>
                              <th className="text-right py-1.5 font-body text-xs text-[var(--c-txt-4)] font-semibold">Events</th>
                              <th className="py-1.5 text-right font-body text-xs text-[var(--c-txt-5)]" />
                            </tr>
                          </thead>
                          <tbody>
                            {nation.gymnasts.map((g) => (
                              <>
                                <tr
                                  key={g.gymnast}
                                  className="border-b cursor-pointer transition-colors"
                                  style={{ borderColor: 'var(--c-border-sm)' }}
                                  onClick={() =>
                                    setOpenGymnast((prev) => ({
                                      ...prev,
                                      [nation.noc]:
                                        prev[nation.noc] === g.gymnast ? null : g.gymnast,
                                    }))
                                  }
                                  onMouseEnter={(e) =>
                                    ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--c-bg-3)')
                                  }
                                  onMouseLeave={(e) =>
                                    ((e.currentTarget as HTMLElement).style.backgroundColor = '')
                                  }
                                >
                                  <td className="py-2 font-body text-xs text-[var(--c-txt-1)]">
                                    {g.gymnast}
                                  </td>
                                  <td className="py-2 font-body text-xs text-right">
                                    <DeltaCell delta={g.index} />
                                  </td>
                                  <td className="py-2 font-body text-xs text-right text-[var(--c-txt-4)]">
                                    {g.n_apparatus}
                                  </td>
                                  <td className="py-2 text-right font-body text-xs text-[var(--c-txt-5)]">
                                    {openGymnast[nation.noc] === g.gymnast ? '▲' : '▼'}
                                  </td>
                                </tr>
                                {openGymnast[nation.noc] === g.gymnast && (
                                  <tr key={`${g.gymnast}-detail`}>
                                    <td colSpan={4}>
                                      <GymnastDrilldown
                                        gymnast={g}
                                        onClose={() =>
                                          setOpenGymnast((prev) => ({ ...prev, [nation.noc]: null }))
                                        }
                                      />
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

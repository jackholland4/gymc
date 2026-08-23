import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import Link from 'next/link'
import { RedRule } from '@/components/shared/RedRule'
import RankingsShell from '@/components/rankings/RankingsShell'
import type { RankingsData } from '@/components/rankings/RankingsShell'

const DATA_FILE = join(process.cwd(), 'public', 'data', 'rankings.json')

function NoData() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
      <p className="font-display text-lg font-semibold text-[var(--c-txt-0)]">Rankings not yet computed</p>
      <p className="font-body text-sm text-[var(--c-txt-4)] max-w-sm">
        Run <code className="text-[var(--c-txt-1)] bg-[var(--c-bg-2)] px-1.5 py-0.5 rounded">python rankings_compute.py</code>{' '}
        in the <code className="text-[var(--c-txt-1)] bg-[var(--c-bg-2)] px-1.5 py-0.5 rounded">worlds_sim/</code> directory,
        then refresh this page.
      </p>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function RankingsPage() {
  const hasData = existsSync(DATA_FILE)
  const data: RankingsData | null = hasData
    ? JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    : null

  return (
    <main className="min-h-screen flex flex-col">
      <section className="pt-24 pb-8 px-6 md:px-12 lg:px-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--c-txt-1)] hover:text-[#ef4444] transition-colors duration-200 mb-8"
        >
          ← Back to GYMC
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--c-txt-0)] leading-tight">
          Power Rankings
        </h1>
        <RedRule delay={0.3} />
        <p className="mt-4 font-body text-[var(--c-txt-1)] max-w-xl leading-relaxed">
          Projected medal probabilities and event-final rates derived from 5,000 Monte Carlo simulations
          of the 2026 World Championships.
        </p>
      </section>

      <div className="flex-1 px-6 md:px-12 lg:px-20 pb-16">
        {data ? <RankingsShell data={data} /> : <NoData />}
      </div>
    </main>
  )
}

import Link from 'next/link'
import { RedRule } from '@/components/shared/RedRule'

export default function TeamSelectionPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--gradient-red-subtle)' }}
    >
      <p className="font-body text-xs font-semibold tracking-[0.3em] uppercase text-[#dc2626] mb-6">
        Coming Soon
      </p>
      <h1 className="font-display text-4xl md:text-6xl font-bold text-[#f5f5f5] leading-tight">
        Team Selection<br />Simulator
      </h1>
      <RedRule centered delay={0.3} />
      <p className="mt-6 font-body text-[#a0a0a0] max-w-md leading-relaxed mb-12">
        Optimize team selection using historical scoring analysis. Compare every possible lineup and find the best combination for any competition.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-body text-sm px-5 py-3 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#f5f5f5] hover:border-[#dc2626] hover:text-[#ef4444] transition-all duration-200"
      >
        ← Back to GYMC
      </Link>
    </main>
  )
}

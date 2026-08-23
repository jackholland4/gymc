'use client'

import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const TOOLS = [
  {
    id: 'worlds',
    title: 'World Champs Simulation',
    description:
      'Simulate full meet scenarios with Monte Carlo draws from real scoring data. Qualifications, team finals, apparatus finals, all-around — and batch analytics across 1,000 simulations.',
    cta: 'Enter',
    href: '/worlds',
    active: true,
  },
  {
    id: 'rankings',
    title: 'Power Rankings',
    description:
      'Medal probability and event-final rates for every gymnast and team, pre-computed from 5,000 Monte Carlo runs. Sortable by gold%, medal%, average rank, and more.',
    cta: 'View Rankings',
    href: '/rankings',
    active: true,
  },
  {
    id: 'team-selection',
    title: 'Team Selection Simulator',
    description:
      'Optimize team selection with historical data analysis. Compare every possible lineup and find the best combination for any competition.',
    cta: 'Coming Soon',
    href: '/team-selection',
    active: false,
  },
] as const

export default function NavCards() {
  return (
    <section className="bg-[var(--c-bg-0)] py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <motion.p
          className="font-display text-sm font-semibold tracking-[0.2em] uppercase text-[#dc2626] mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The Suite
        </motion.p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.15 }}
            >
              <Card active={tool.active} className="flex flex-col h-full">
                {/* Red accent line at top of card */}
                <div className="h-0.5 w-full bg-[#dc2626] rounded-t-2xl" />

                <div className="flex flex-col flex-1 p-8">
                  {/* Title */}
                  <h2
                    className="font-display font-bold text-[var(--c-txt-0)] leading-tight mb-4"
                    style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}
                  >
                    {tool.title}
                  </h2>

                  {/* Description */}
                  <p className="font-body text-sm text-[var(--c-txt-1)] leading-relaxed mb-10 flex-grow">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  {tool.active ? (
                    <Button href={tool.href} variant="primary" className="self-start">
                      {tool.cta} →
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled title="Under development" className="self-start">
                      {tool.cta}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

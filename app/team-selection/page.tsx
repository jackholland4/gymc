'use client'

import { TeamSelectionProvider, useTeamSelection } from './TeamSelectionProvider'
import { SetupStep } from './components/SetupStep'
import { GymnastPicker } from './components/GymnastPicker'
import { OpponentStep } from './components/OpponentStep'
import { LineupStep } from './components/LineupStep'
import { ResultsPanel } from './components/ResultsPanel'

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEP_LABELS: Record<string, string> = {
  setup: 'Setup',
  'team-a': 'Your Team',
  'team-b': 'Opponent',
  lineup: 'Lineups',
  results: 'Results',
}
const STEP_ORDER = ['setup', 'team-a', 'team-b', 'lineup', 'results']

function StepHeader() {
  const [state] = useTeamSelection()
  const currentIdx = STEP_ORDER.indexOf(state.step)

  // For "world" benchmark, skip the team-b step visually
  const visibleSteps = state.benchmarkType === 'world'
    ? STEP_ORDER.filter(s => s !== 'team-b')
    : STEP_ORDER

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-0 px-6"
      style={{ backgroundColor: 'var(--c-header-bg)', borderBottom: '1px solid var(--c-border-sm)', height: '44px' }}
    >
      {visibleSteps.map((step, i) => {
        const isDone = STEP_ORDER.indexOf(step) < currentIdx
        const isCurrent = step === state.step
        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className="w-8 h-px mx-1"
                style={{ backgroundColor: isDone ? '#dc2626' : 'var(--c-border-lg)' }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center font-body text-xs font-bold transition-colors"
                style={{
                  backgroundColor: isCurrent ? '#dc2626' : isDone ? 'rgba(220,38,38,0.2)' : 'var(--c-bg-3)',
                  color: isCurrent ? '#fff' : isDone ? '#ef4444' : 'var(--c-txt-5)',
                }}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className="font-body text-xs transition-colors hidden sm:inline"
                style={{ color: isCurrent ? 'var(--c-txt-0)' : 'var(--c-txt-5)' }}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Content router
// ---------------------------------------------------------------------------

function TeamSelectionContent() {
  const [state] = useTeamSelection()

  if (state.step === 'setup') return <SetupStep />

  if (state.step === 'team-a') {
    const nextStep = state.benchmarkType === 'world' ? 'lineup' : 'team-b'
    const nextLabel = state.benchmarkType === 'world' ? 'Set Lineup' : 'Set Opponent'
    return (
      <GymnastPicker
        team="a"
        roster={state.rosterA}
        nextStep={nextStep}
        nextLabel={nextLabel}
        backStep="setup"
      />
    )
  }

  if (state.step === 'team-b') return <OpponentStep />
  if (state.step === 'lineup') return <LineupStep />
  if (state.step === 'results') return <ResultsPanel />

  return null
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TeamSelectionPage() {
  return (
    <TeamSelectionProvider>
      <main className="min-h-screen" style={{ paddingTop: '4rem' }}>
        <StepHeader />
        <div style={{ paddingTop: '44px' }}>
          <TeamSelectionContent />
        </div>
      </main>
    </TeamSelectionProvider>
  )
}

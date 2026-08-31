import { WorldsProvider } from './WorldsProvider'
import { WorldsLayout } from './WorldsLayout'
import { GymnastPanel } from './components/GymnastPanel'

export const metadata = {
  title: 'World Championships Simulation — GYMC',
  description: 'Monte Carlo simulation of the 2026 World Championships using historical scoring data.',
}

export default function WorldsPage() {
  return (
    <main className="min-h-screen pt-16">
      <WorldsProvider>
        <WorldsLayout />
        <GymnastPanel />
      </WorldsProvider>
    </main>
  )
}

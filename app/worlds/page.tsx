import { WorldsProvider } from './WorldsProvider'
import { WorldsSidebar } from './components/WorldsSidebar'
import { WorldsMain } from './components/WorldsMain'
import { GymnastPanel } from './components/GymnastPanel'

export const metadata = {
  title: 'World Championships Simulation — GYMC',
  description: 'Monte Carlo simulation of the 2026 World Championships using historical scoring data.',
}

export default function WorldsPage() {
  return (
    <main className="min-h-screen pt-16">
      <WorldsProvider>
        <div className="flex h-[calc(100vh-4rem)]">
          <WorldsSidebar />
          <WorldsMain />
        </div>
        <GymnastPanel />
      </WorldsProvider>
    </main>
  )
}

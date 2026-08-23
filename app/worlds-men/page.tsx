import { WorldsProvider } from '../worlds/WorldsProvider'
import { WorldsSidebar } from '../worlds/components/WorldsSidebar'
import { WorldsMain } from '../worlds/components/WorldsMain'
import { GymnastPanel } from '../worlds/components/GymnastPanel'

export const metadata = {
  title: "Men's World Championships Simulation — GYMC",
  description: 'Monte Carlo simulation of the 2026 Men\'s World Championships.',
}

export default function WorldsMenPage() {
  return (
    <main className="min-h-screen pt-16">
      <WorldsProvider discipline="MAG">
        <div className="flex h-[calc(100vh-4rem)]">
          <WorldsSidebar />
          <WorldsMain />
        </div>
        <GymnastPanel />
      </WorldsProvider>
    </main>
  )
}

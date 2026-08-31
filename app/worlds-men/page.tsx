import { WorldsProvider } from '../worlds/WorldsProvider'
import { WorldsLayout } from '../worlds/WorldsLayout'
import { GymnastPanel } from '../worlds/components/GymnastPanel'

export const metadata = {
  title: "Men's World Championships Simulation — GYMC",
  description: 'Monte Carlo simulation of the 2026 Men\'s World Championships.',
}

export default function WorldsMenPage() {
  return (
    <main className="min-h-screen pt-16">
      <WorldsProvider discipline="MAG">
        <WorldsLayout />
        <GymnastPanel />
      </WorldsProvider>
    </main>
  )
}

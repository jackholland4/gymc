'use client'

import { useWorlds } from './WorldsProvider'
import { WorldsSidebar } from './components/WorldsSidebar'
import { WorldsMain } from './components/WorldsMain'
import { DisciplinePicker } from './components/DisciplinePicker'

export function WorldsLayout() {
  const [state] = useWorlds()

  if (!state.disciplineConfirmed) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <DisciplinePicker />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <WorldsSidebar />
      <WorldsMain />
    </div>
  )
}

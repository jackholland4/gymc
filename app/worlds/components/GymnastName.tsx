'use client'

import { useWorlds } from '../WorldsProvider'

export function GymnastName({ name, noc }: { name: string; noc: string }) {
  const [, dispatch] = useWorlds()
  return (
    <button
      onClick={() => dispatch({ type: 'OPEN_GYMNAST', noc, name })}
      className="font-body text-xs text-[#f5f5f5] hover:text-[#ef4444] transition-colors text-left"
    >
      {name}
    </button>
  )
}

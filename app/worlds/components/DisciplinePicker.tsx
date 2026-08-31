'use client'

import { useWorlds } from '../WorldsProvider'
import { useTheme } from '@/components/shared/ThemeProvider'
import type { Discipline } from '@/types/simulation'

const OPTIONS: { discipline: Discipline; label: string; sub: string; src: string }[] = [
  {
    discipline: 'WAG',
    label: 'WAG',
    sub: "Women's Artistic",
    src: '/images/pictogram-wag.png',
  },
  {
    discipline: 'MAG',
    label: 'MAG',
    sub: "Men's Artistic",
    src: '/images/pictogram-mag.png',
  },
]

export function DisciplinePicker() {
  const [, dispatch] = useWorlds()
  const { theme } = useTheme()

  const imgFilter = theme === 'dark' ? 'invert(1)' : 'none'

  function pick(discipline: Discipline) {
    dispatch({ type: 'SET_DISCIPLINE', discipline })
    dispatch({ type: 'CONFIRM_DISCIPLINE' })
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-14">
      <div className="text-center space-y-2">
        <p className="font-body text-xs uppercase tracking-widest text-[#ef4444]">
          2026 World Championships
        </p>
        <h2 className="font-display text-3xl font-bold text-[var(--c-txt-0)]">
          Select a discipline
        </h2>
      </div>

      <div className="flex gap-6">
        {OPTIONS.map(({ discipline, label, sub, src }) => (
          <button
            key={discipline}
            onClick={() => pick(discipline)}
            className="group flex flex-col items-center gap-5 px-12 py-8 rounded-2xl border border-[var(--c-border-md)] bg-[var(--c-bg-2)] hover:border-[rgba(220,38,38,0.45)] hover:bg-[rgba(220,38,38,0.04)] transition-all duration-200 cursor-pointer"
          >
            {/* Pictogram */}
            <div className="w-36 h-40 flex items-end justify-center">
              <img
                src={src}
                alt={label}
                className="max-w-full max-h-full object-contain object-bottom select-none"
                style={{ filter: imgFilter }}
                draggable={false}
              />
            </div>

            {/* Label */}
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-[var(--c-txt-0)] group-hover:text-[#ef4444] transition-colors duration-150">
                {label}
              </p>
              <p className="font-body text-sm text-[var(--c-txt-4)] mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

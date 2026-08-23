'use client'

export default function TeamToggle({
  worldsOnly,
  onChange,
}: {
  worldsOnly: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center rounded-lg border border-[var(--c-border-md)] overflow-hidden text-xs font-body">
      {[
        { label: 'Global', value: false },
        { label: 'Projected Field', value: true },
      ].map(({ label, value }) => (
        <button
          key={label}
          onClick={() => onChange(value)}
          className="px-3 py-1.5 transition-colors duration-150"
          style={{
            backgroundColor: worldsOnly === value ? 'rgba(220,38,38,0.15)' : 'transparent',
            color: worldsOnly === value ? '#ef4444' : 'var(--c-txt-4)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

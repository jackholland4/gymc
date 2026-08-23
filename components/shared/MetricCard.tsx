export function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string | number | null
  sub?: string
  highlight?: boolean
}) {
  const displayValue = value === null || value === undefined ? '—' : value

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'var(--c-bg-1)',
        border: '1px solid var(--c-border-md)',
      }}
    >
      <p className="font-body text-xs text-[var(--c-txt-4)] mb-1">{label}</p>
      <p
        className="font-body text-xl font-semibold tabular-nums leading-tight"
        style={{ color: highlight ? '#ef4444' : 'var(--c-txt-0)' }}
      >
        {displayValue}
      </p>
      {sub && (
        <p className="font-body text-xs text-[var(--c-txt-5)] mt-0.5 tabular-nums">{sub}</p>
      )}
    </div>
  )
}

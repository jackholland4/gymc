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
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p className="font-body text-xs text-[#666] mb-1">{label}</p>
      <p
        className="font-body text-xl font-semibold tabular-nums leading-tight"
        style={{ color: highlight ? '#ef4444' : '#f5f5f5' }}
      >
        {displayValue}
      </p>
      {sub && (
        <p className="font-body text-xs text-[#555] mt-0.5 tabular-nums">{sub}</p>
      )}
    </div>
  )
}

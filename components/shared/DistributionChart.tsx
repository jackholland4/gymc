'use client'

export function DistributionChart({
  data,
  bins = 8,
  label,
  color = '#dc2626',
  height = 80,
}: {
  data: number[]
  bins?: number
  label?: string
  color?: string
  height?: number
}) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center font-body text-xs text-[#555]"
        style={{ height }}
      >
        No data
      </div>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)

  // Edge case: all values identical — put everything in one bin
  const range = max - min || 1
  const binWidth = range / bins

  const counts = new Array<number>(bins).fill(0)
  for (const v of data) {
    // Clamp the last bin to include the maximum value
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1)
    counts[idx]++
  }

  const maxCount = Math.max(...counts, 1)

  // SVG layout constants
  const barGap = 2
  const viewW = 200
  const viewH = height
  // Leave 2px top padding so the tallest bar isn't clipped
  const chartH = viewH - 2
  const totalGap = barGap * (bins - 1)
  const barW = (viewW - totalGap) / bins

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height, display: 'block' }}
        aria-label={label}
      >
        {counts.map((count, i) => {
          const barH = (count / maxCount) * chartH
          const x = i * (barW + barGap)
          const y = viewH - barH

          const binStart = (min + i * binWidth).toFixed(2)
          const binEnd = (min + (i + 1) * binWidth).toFixed(2)
          const titleText = `${binStart}–${binEnd}: ${count}`

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              opacity={0.7}
              rx={1}
              className="transition-opacity hover:opacity-100"
              style={{ cursor: 'default' }}
            >
              <title>{titleText}</title>
            </rect>
          )
        })}
      </svg>
      {label && (
        <p className="mt-1 text-center font-body text-xs text-[#555]">{label}</p>
      )}
    </div>
  )
}

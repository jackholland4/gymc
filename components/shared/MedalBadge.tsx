// rank: 1 = gold (🥇), 2 = silver (🥈), 3 = bronze (🥉), else number
export function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>
  if (rank === 2) return <span className="text-base">🥈</span>
  if (rank === 3) return <span className="text-base">🥉</span>
  return <span className="font-body text-xs text-[var(--c-txt-5)] tabular-nums">{rank}</span>
}

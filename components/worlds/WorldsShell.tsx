'use client'

import { useState } from 'react'

const SIM_URL = process.env.NEXT_PUBLIC_WORLDS_SIM_URL ?? 'http://localhost:8501'

export default function WorldsShell() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-[var(--c-border-md)] bg-[var(--c-bg-1)]"
      style={{ minHeight: 'calc(100vh - 220px)' }}
    >
      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
          <span className="font-body text-sm text-[var(--c-txt-1)]">Loading simulation…</span>
        </div>
      )}

      <iframe
        src={SIM_URL}
        title="World Championships Simulator"
        onLoad={() => setLoaded(true)}
        className="w-full border-0 transition-opacity duration-500"
        style={{
          minHeight: 'calc(100vh - 220px)',
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  )
}

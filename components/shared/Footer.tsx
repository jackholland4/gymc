export default function Footer() {
  return (
    <footer className="bg-[var(--c-bg-0)] border-t border-[var(--c-border-sm)] py-6 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="font-body text-xs text-[var(--c-txt-6)]">
          <span className="font-display font-semibold text-[#dc2626]">GYMC</span>
          {' · '}Gymnastics Yearly Monte Carlo
        </span>
        <span className="font-body text-xs text-[var(--c-txt-6)]">© 2026</span>
      </div>
    </footer>
  )
}

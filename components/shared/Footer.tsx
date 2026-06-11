export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[rgba(255,255,255,0.06)] py-6 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="font-body text-xs text-[#444]">
          <span className="font-display font-semibold text-[#dc2626]">GYMC</span>
          {' · '}Gymnastics Yearly Monte Carlo
        </span>
        <span className="font-body text-xs text-[#444]">© 2026</span>
      </div>
    </footer>
  )
}

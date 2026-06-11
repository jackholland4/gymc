import Link from 'next/link'

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  href?: string
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
  title?: string
}

export default function Button({
  variant = 'primary',
  href,
  disabled,
  children,
  onClick,
  className = '',
  title,
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-3 rounded-lg transition-all duration-200 tracking-tight'

  const styles = {
    primary: disabled
      ? `${base} bg-[#dc2626] text-white opacity-40 cursor-not-allowed`
      : `${base} bg-[#dc2626] text-white hover:bg-[#ef4444] hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]`,
    ghost: disabled
      ? `${base} border border-[rgba(255,255,255,0.08)] text-[#444] cursor-not-allowed`
      : `${base} border border-[rgba(255,255,255,0.08)] text-[#f5f5f5] hover:border-[#dc2626] hover:text-[#ef4444]`,
  }

  const cls = `${styles[variant]} ${className}`

  if (href && !disabled) {
    return <Link href={href} className={cls} title={title}>{children}</Link>
  }
  return (
    <button className={cls} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  )
}

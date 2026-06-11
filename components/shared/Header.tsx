'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const isLanding = pathname === '/'
  const transparent = isLanding && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reset scroll state on route change
  useEffect(() => {
    setScrolled(false)
  }, [pathname])

  const navLinks = [
    { href: '/worlds', label: 'Worlds' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/team-selection', label: 'Team Selection' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 lg:px-20"
      style={{
        backgroundColor: transparent ? 'transparent' : 'rgba(10,10,10,0.95)',
        backdropFilter: transparent ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(12px)',
        borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.06)',
        transition: 'background-color 300ms ease, border-color 300ms ease',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-display font-bold text-lg text-[#f5f5f5] tracking-tight hover:text-white transition-colors duration-200 group"
      >
        GYMC
        <span className="block h-0.5 w-0 group-hover:w-full bg-[#dc2626] transition-all duration-300 ease-out" />
      </Link>

      {/* Nav */}
      <nav className="ml-auto flex items-center gap-7">
        {navLinks.map(({ href, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative font-body text-sm transition-colors duration-200 pb-0.5"
              style={{ color: active ? '#f5f5f5' : '#a0a0a0' }}
            >
              {label}
              {active && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#dc2626] rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

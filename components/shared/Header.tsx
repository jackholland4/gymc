'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

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

  const navLinks: { href: string; label: string; activeOn?: string[] }[] = [
    { href: '/worlds',         label: 'Simulate', activeOn: ['/worlds', '/worlds-men'] },
    { href: '/rankings',       label: 'Compare'  },
    { href: '/team-selection', label: 'Generate' },
    { href: '/calendar',       label: 'Calendar' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 lg:px-20"
      style={{
        backgroundColor: transparent ? 'transparent' : 'var(--c-header-bg)',
        backdropFilter: transparent ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(12px)',
        borderBottom: transparent ? 'none' : '1px solid var(--c-header-border)',
        transition: 'background-color 300ms ease, border-color 300ms ease',
      }}
    >
      {/* Discipline pictograms + logo */}
      <div className="flex items-center gap-3">
        {[
          { href: '/worlds',     src: '/images/pictogram-wag.png', alt: 'WAG' },
          { href: '/worlds-men', src: '/images/pictogram-mag.png', alt: 'MAG' },
        ].map(({ href, src, alt }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const imgFilter = theme === 'dark' ? 'invert(1)' : 'none'
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center pb-1"
              title={alt}
            >
              <img
                src={src}
                alt={alt}
                className="h-7 w-auto object-contain select-none transition-opacity duration-150"
                style={{
                  filter: imgFilter,
                  opacity: active ? 1 : 0.35,
                }}
                draggable={false}
              />
              {active && (
                <span className="absolute -bottom-0 left-0 right-0 h-0.5 bg-[#dc2626] rounded-full" />
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <span className="w-px h-4 bg-[var(--c-border-md)] mx-1" />

        {/* Logo */}
        <Link
          href="/"
          className="font-display font-bold text-lg text-[var(--c-txt-0)] tracking-tight hover:text-[#ef4444] transition-colors duration-200 group"
        >
          GYMC
          <span className="block h-0.5 w-0 group-hover:w-full bg-[#dc2626] transition-all duration-300 ease-out" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="ml-auto flex items-center gap-7">
        {navLinks.map(({ href, label, activeOn }) => {
          const routes = activeOn ?? [href]
          const active = routes.some((r) => pathname === r || pathname.startsWith(r + '/'))
          return (
            <Link
              key={href}
              href={href}
              className="relative font-body text-sm transition-colors duration-200 pb-0.5"
              style={{ color: active ? 'var(--c-txt-0)' : 'var(--c-txt-1)' }}
            >
              {label}
              {active && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#dc2626] rounded-full" />
              )}
            </Link>
          )
        })}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
          style={{ color: 'var(--c-txt-1)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-txt-0)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-txt-1)')}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>
    </header>
  )
}

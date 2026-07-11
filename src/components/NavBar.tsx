import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import GradientText from '../reactbits/GradientText/GradientText'
import { GUIDE_URL, TIER_LIST_URL } from '../lib/externalLinks'

const links = [
  { href: TIER_LIST_URL, label: 'Tier List' },
  { href: GUIDE_URL, label: 'Guide' },
  { to: '/team-builder', label: 'Team Builder' },
] as const

const linkClasses = ({ isActive }: { isActive: boolean } = { isActive: false }) =>
  `block rounded-full px-4 py-2 transition-colors ${
    isActive ? 'bg-gold-500/15 text-gold-300' : 'text-gold-100/70 hover:text-gold-300'
  }`

function NavItem({ link }: { link: (typeof links)[number] }) {
  if ('href' in link) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClasses()}>
        {link.label}
      </a>
    )
  }
  return (
    <NavLink to={link.to} className={linkClasses}>
      {link.label}
    </NavLink>
  )
}

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-void/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <NavLink to="/" className="font-display text-base tracking-wide whitespace-nowrap sm:text-lg">
          <GradientText colors={['#e2b53c', '#c9a8ff', '#e2b53c']} animationSpeed={6}>
            <span className="sm:hidden">AFK Arena Hub</span>
            <span className="hidden sm:inline">AFK Arena Companions Hub</span>
          </GradientText>
        </NavLink>

        <ul className="hidden items-center gap-2 font-body text-sm sm:flex">
          {links.map((link) => (
            <li key={link.label}>
              <NavItem link={link} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gold-100/80 transition-colors hover:text-gold-300 sm:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 font-body text-sm sm:hidden"
          >
            {links.map((link) => (
              <li key={link.label} className="px-4 py-1 first:pt-3 last:pb-3">
                <NavItem link={link} />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}

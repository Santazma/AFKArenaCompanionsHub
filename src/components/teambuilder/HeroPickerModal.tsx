import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Hero } from '../../data/heroes'
import type { ContentMode, InvestmentLevel } from '../../lib/teamBuilder'
import type { RosterStore } from '../../hooks/useRoster'
import { useHeroFilter } from '../../hooks/useHeroFilter'
import FactionFilter from './FactionFilter'
import HeroCard from './HeroCard'

interface HeroPickerModalProps {
  open: boolean
  title: string
  mode: ContentMode
  investmentLevel: InvestmentLevel
  roster: RosterStore
  onPick: (heroId: string) => void
  onOpenDetail: (hero: Hero) => void
  onClose: () => void
}

export default function HeroPickerModal({
  open,
  title,
  mode,
  investmentLevel,
  roster,
  onPick,
  onOpenDetail,
  onClose,
}: HeroPickerModalProps) {
  const { query, setQuery, activeFactions, toggleFaction, rosterOnly, setRosterOnly, results } = useHeroFilter(
    mode,
    roster,
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <p className="font-body text-[10px] font-semibold tracking-[0.2em] text-gold-300/70 uppercase">
                  Add a hero
                </p>
                <h2 className="font-display text-lg font-bold text-gold-300">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-gold-100/60 hover:border-red-400 hover:text-red-400"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 border-b border-border/60 p-3 sm:flex-row sm:justify-between">
              <FactionFilter active={activeFactions} onToggle={toggleFaction} />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRosterOnly((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                    rosterOnly
                      ? 'border-arcane-500 bg-arcane-500/20 text-arcane-300'
                      : 'border-border bg-void/60 text-gold-100/60 hover:border-arcane-500/50'
                  }`}
                >
                  <span aria-hidden>{rosterOnly ? '★' : '☆'}</span>
                  My Roster {roster.ownedCount > 0 && <span className="text-gold-100/40">({roster.ownedCount})</span>}
                </button>
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search hero name…"
                  className="w-40 rounded-full border border-border bg-void/60 px-4 py-1.5 font-body text-sm text-gold-100 placeholder:text-gold-100/40 focus:border-gold-500 focus:outline-none sm:w-56"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-5 md:grid-cols-6">
              {results.map((hero) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  mode={mode}
                  investmentLevel={investmentLevel}
                  roster={roster}
                  selected={false}
                  variant="pick"
                  onSelect={() => onPick(hero.id)}
                  onOpenDetail={onOpenDetail}
                />
              ))}
              {results.length === 0 && (
                <p className="col-span-full py-8 text-center font-body text-sm text-gold-100/50">No heroes found.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

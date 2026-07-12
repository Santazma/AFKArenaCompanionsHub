import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Hero } from '../../data/heroes'
import { FACTION_COLORS } from '../../data/heroes'
import { CONTENT_MODES, tierColor } from '../../lib/teamBuilder'
import { heroFrameUrl } from '../../lib/heroFrame'
import { OWNED_SI, OWNED_TIERS, type OwnedSi, type OwnedTier, type RosterStore } from '../../hooks/useRoster'
import HeroAvatar from './HeroAvatar'
import FactionBadge from './FactionBadge'

interface HeroDetailModalProps {
  hero: Hero | null
  roster: RosterStore
  onClose: () => void
}

const INVESTMENT_ROWS: { key: 'minimum' | 'optimal' | 'competitive'; label: string }[] = [
  { key: 'minimum', label: 'Minimum' },
  { key: 'optimal', label: 'Optimal' },
  { key: 'competitive', label: 'Competitive' },
]

function TierChip({ tier }: { tier: string }) {
  if (!tier) return <span className="font-body text-sm text-gold-100/30">—</span>
  const color = tierColor(tier)
  return (
    <span
      className="rounded-md px-2 py-0.5 font-body text-sm font-bold"
      style={{ color, backgroundColor: `${color}22` }}
    >
      {tier}
    </span>
  )
}

export default function HeroDetailModal({ hero, roster, onClose }: HeroDetailModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {hero && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-4 border-b border-border p-5"
              style={{ background: `linear-gradient(120deg, ${FACTION_COLORS[hero.faction]}22, transparent 70%)` }}
            >
              <HeroAvatar hero={hero} size="lg" frameUrl={heroFrameUrl(hero, 'optimal')} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-2xl font-bold text-gold-300">{hero.name}</h2>
                  <FactionBadge faction={hero.faction} size="md" />
                </div>
                <p className="mt-1 font-body text-xs text-gold-100/60">
                  {hero.faction}
                  {hero.class ? ` · ${hero.class}` : ''}
                  {hero.role ? ` · ${hero.role}` : ''}
                </p>
                <p className="mt-1 font-body text-xs text-gold-100/40">
                  Overall <span className="font-semibold text-gold-100/70">{hero.overallRank}</span> · Score{' '}
                  <span className="font-semibold text-gold-100/70">{hero.score}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-border text-gold-100/60 hover:border-red-400 hover:text-red-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <section>
                <h3 className="mb-2 font-body text-[11px] font-semibold tracking-[0.15em] text-gold-100/50 uppercase">
                  Tier by mode
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_MODES.map((m) => (
                    <div key={m.id} className="rounded-lg border border-border/60 bg-void/40 p-2 text-center">
                      <div className="mb-1 font-body text-[10px] text-gold-100/50">{m.label}</div>
                      <TierChip tier={hero.modes[m.id]} />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-body text-[11px] font-semibold tracking-[0.15em] text-gold-100/50 uppercase">
                  Recommended investment
                </h3>
                <div className="space-y-1.5">
                  {INVESTMENT_ROWS.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-void/30 px-3 py-1.5"
                    >
                      <span className="font-body text-xs text-gold-100/60">{row.label}</span>
                      <span className="font-body text-sm font-medium text-gold-100/90">
                        {hero.investment[row.key] || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-arcane-700/40 bg-arcane-700/10 p-3">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="font-body text-sm font-medium text-gold-100/90">I own this hero</span>
                  <input
                    type="checkbox"
                    checked={roster.isOwned(hero.id)}
                    onChange={() => roster.toggleOwned(hero.id)}
                    className="h-4 w-4 accent-arcane-500"
                  />
                </label>
                {roster.isOwned(hero.id) && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-body text-xs text-gold-100/60">Ascension</span>
                      <select
                        value={roster.ownedTier(hero.id) ?? ''}
                        onChange={(e) => roster.setOwnedTier(hero.id, (e.target.value || null) as OwnedTier | null)}
                        className="rounded-md border border-border bg-void/60 px-2 py-1 font-body text-xs text-gold-100 focus:border-gold-500 focus:outline-none"
                      >
                        <option value="">Not set</option>
                        {OWNED_TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-body text-xs text-gold-100/60">Signature Item (SI)</span>
                      <select
                        value={roster.ownedSi(hero.id) ?? ''}
                        onChange={(e) =>
                          roster.setOwnedSi(hero.id, e.target.value === '' ? null : (Number(e.target.value) as OwnedSi))
                        }
                        className="rounded-md border border-border bg-void/60 px-2 py-1 font-body text-xs text-gold-100 focus:border-gold-500 focus:outline-none"
                      >
                        <option value="">Not set</option>
                        {OWNED_SI.map((s) => (
                          <option key={s} value={s}>
                            SI {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="font-body text-[10px] text-gold-100/40">
                      Drives the <span className="text-arcane-300">My Investment</span> view. SI shows on Mythic tiers
                      and above.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

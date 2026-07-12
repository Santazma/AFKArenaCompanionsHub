import type { DragEvent, KeyboardEvent } from 'react'
import type { Hero } from '../../data/heroes'
import { tierColor, type ContentMode, type InvestmentLevel } from '../../lib/teamBuilder'
import { resolveFrameUrl, investmentLabel } from '../../lib/heroFrame'
import type { RosterStore } from '../../hooks/useRoster'
import HeroAvatar from './HeroAvatar'
import FactionBadge from './FactionBadge'

interface HeroCardProps {
  hero: Hero
  mode: ContentMode
  investmentLevel: InvestmentLevel
  roster: RosterStore
  selected: boolean
  // 'browse' → tapping the card opens details (placement is via drag or the
  // in-slot picker). 'pick' → tapping places the hero into the target slot.
  variant: 'browse' | 'pick'
  onSelect: () => void
  onOpenDetail: (hero: Hero) => void
}

export default function HeroCard({
  hero,
  mode,
  investmentLevel,
  roster,
  selected,
  variant,
  onSelect,
  onOpenDetail,
}: HeroCardProps) {
  const owned = roster.isOwned(hero.id)
  const ownership = roster.entry(hero.id)
  const frameUrl = resolveFrameUrl(hero, investmentLevel, ownership)
  const primary = variant === 'pick' ? onSelect : () => onOpenDetail(hero)

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={variant === 'browse'}
      onDragStart={(event: DragEvent) => {
        event.dataTransfer.setData('text/plain', hero.id)
        event.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={primary}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          primary()
        }
      }}
      title={variant === 'pick' ? `Place ${hero.name}` : `${hero.name} — tap for details`}
      className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors ${
        selected
          ? 'border-gold-500 bg-gold-500/10'
          : owned
            ? 'border-arcane-500/40 bg-arcane-500/5 hover:border-arcane-500/70'
            : 'border-transparent hover:border-gold-500/40 hover:bg-void/40'
      }`}
    >
      <div className="relative">
        <HeroAvatar hero={hero} size="sm" frameUrl={frameUrl} />
        <FactionBadge faction={hero.faction} size="xs" className="absolute -top-1 -left-1" />
        {/* One-click roster toggle — always visible so adding heroes is effortless. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            roster.toggleOwned(hero.id)
          }}
          aria-label={owned ? 'Remove from My Roster' : 'Add to My Roster'}
          title={owned ? 'In My Roster — tap to remove' : 'Add to My Roster'}
          className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] leading-none shadow-sm transition-colors ${
            owned
              ? 'border-emerald-400 bg-emerald-500 text-void'
              : 'border-border bg-void/90 text-gold-100/50 hover:border-gold-400 hover:text-gold-300'
          }`}
        >
          {owned ? '★' : '☆'}
        </button>
        {/* Quick placement affordance in browse mode so drag isn't the only way. */}
        {variant === 'browse' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            aria-label={`Select ${hero.name} to place`}
            title="Select, then tap a slot"
            className="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-void/90 text-[13px] leading-none text-gold-100/60 shadow-sm hover:border-gold-400 hover:text-gold-300"
          >
            +
          </button>
        )}
      </div>

      <span className="w-full truncate font-body text-[11px] text-gold-100/80">{hero.name}</span>
      <span
        className="rounded-full px-2 py-0.5 font-body text-[10px] font-semibold"
        style={{ color: tierColor(hero.modes[mode]), backgroundColor: `${tierColor(hero.modes[mode])}22` }}
      >
        {hero.modes[mode]}
      </span>
      <span className="font-body text-[10px] text-gold-100/40">{investmentLabel(hero, investmentLevel, ownership)}</span>
    </div>
  )
}

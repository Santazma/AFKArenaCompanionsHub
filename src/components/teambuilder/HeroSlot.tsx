import type { Hero } from '../../data/heroes'
import HeroAvatar from './HeroAvatar'

interface HeroSlotProps {
  hero: Hero | null
  selected: boolean
  onClick: () => void
}

export default function HeroSlot({ hero, selected, onClick }: HeroSlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hero ? `${hero.name} — click to remove` : 'Empty slot — click to fill'}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors ${
        selected
          ? 'border-gold-500 bg-gold-500/10'
          : hero
            ? 'border-border bg-void/40 hover:border-gold-500/50'
            : 'border-dashed border-border/70 bg-void/20 hover:border-gold-500/40'
      }`}
    >
      {hero ? (
        <>
          <HeroAvatar hero={hero} size="sm" />
          <span className="max-w-16 truncate font-body text-[11px] text-gold-100/80">{hero.name}</span>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-border/70 text-gold-100/30">
            +
          </div>
          <span className="font-body text-[11px] text-gold-100/30">Empty</span>
        </>
      )}
    </button>
  )
}

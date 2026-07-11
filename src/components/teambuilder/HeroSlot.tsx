import { useState, type DragEvent } from 'react'
import type { Hero } from '../../data/heroes'
import HeroAvatar from './HeroAvatar'

interface HeroSlotProps {
  hero: Hero | null
  selected: boolean
  onClick: () => void
  onDropHero: (heroId: string) => void
}

export default function HeroSlot({ hero, selected, onClick, onDropHero }: HeroSlotProps) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onDragOver={(event: DragEvent) => {
        event.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event: DragEvent) => {
        event.preventDefault()
        setDragOver(false)
        const heroId = event.dataTransfer.getData('text/plain')
        if (heroId) onDropHero(heroId)
      }}
      title={hero ? `${hero.name} — click to remove` : 'Empty slot — click or drop a hero to fill'}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors ${
        selected || dragOver
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
          <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-dashed border-border/70 text-gold-100/30">
            +
          </div>
          <span className="font-body text-[11px] text-gold-100/30">Empty</span>
        </>
      )}
    </button>
  )
}

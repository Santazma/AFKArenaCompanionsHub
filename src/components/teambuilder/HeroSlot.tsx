import { useState, type DragEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Hero } from '../../data/heroes'
import HeroAvatar from './HeroAvatar'
import FactionBadge from './FactionBadge'

interface HeroSlotProps {
  hero: Hero | null
  selected: boolean
  slotKey: string
  frameUrl?: string | null
  caption?: string
  owned?: boolean
  onClick: () => void
  onRemove: () => void
  onDropHero: (heroId: string, sourceSlotKey: string | null) => void
}

export default function HeroSlot({
  hero,
  selected,
  slotKey,
  frameUrl,
  caption,
  owned,
  onClick,
  onRemove,
  onDropHero,
}: HeroSlotProps) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={Boolean(hero)}
      onDragStart={(event: DragEvent) => {
        if (!hero) return
        event.dataTransfer.setData('text/plain', hero.id)
        event.dataTransfer.setData('application/x-slot-key', slotKey)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={(event: DragEvent) => {
        event.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event: DragEvent) => {
        event.preventDefault()
        setDragOver(false)
        const heroId = event.dataTransfer.getData('text/plain')
        const sourceSlotKey = event.dataTransfer.getData('application/x-slot-key') || null
        if (heroId) onDropHero(heroId, sourceSlotKey)
      }}
      onClick={onClick}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      title={hero ? `${hero.name} — drag or tap to move` : 'Empty slot — tap or drop a hero to fill'}
      className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-2 transition-colors ${
        selected || dragOver
          ? 'border-gold-500 bg-gold-500/10'
          : hero
            ? 'border-border bg-void/40 hover:border-gold-500/50'
            : 'border-dashed border-border/70 bg-void/20 hover:border-gold-500/40'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {hero ? (
          <motion.div
            key={hero.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex flex-col items-center gap-1"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onRemove()
              }}
              aria-label={`Remove ${hero.name}`}
              className="absolute -top-1.5 -right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-void text-[10px] leading-none text-gold-100/60 hover:border-red-400 hover:text-red-400"
            >
              ×
            </button>
            <div className="relative">
              <HeroAvatar hero={hero} size="sm" frameUrl={frameUrl} />
              <FactionBadge faction={hero.faction} size="xs" className="absolute -top-1 -left-1" />
              {owned && (
                <span
                  title="In your roster"
                  className="absolute -bottom-1 -left-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-void bg-emerald-500 text-[8px] font-bold text-void"
                >
                  ✓
                </span>
              )}
            </div>
            <span className="max-w-16 truncate font-body text-[11px] text-gold-100/80">{hero.name}</span>
            <span className="max-w-16 truncate font-body text-[10px] text-gold-100/40">{caption || '—'}</span>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-dashed border-border/70 text-gold-100/30">
              +
            </div>
            <span className="font-body text-[11px] text-gold-100/30">Empty</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

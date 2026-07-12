import type { Faction } from '../../data/heroes'
import { FACTION_COLORS } from '../../data/heroes'

// A CSS-only faction emblem (no external image) so it stays crisp and, crucially,
// doesn't taint the canvas when the team board is exported to PNG. Every faction
// has a unique initial, so the letter alone reads clearly.
const SIZE_CLASSES = {
  xs: 'h-4 w-4 text-[9px]',
  sm: 'h-5 w-5 text-[11px]',
  md: 'h-6 w-6 text-xs',
}

interface FactionBadgeProps {
  faction: Faction
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export default function FactionBadge({ faction, size = 'sm', className = '' }: FactionBadgeProps) {
  const color = FACTION_COLORS[faction]
  return (
    <span
      title={faction}
      className={`flex items-center justify-center rounded-full border font-body font-bold text-void shadow-sm ${SIZE_CLASSES[size]} ${className}`}
      style={{
        borderColor: `${color}cc`,
        background: `radial-gradient(circle at 30% 25%, ${color}, ${color}bb 70%, ${color}88)`,
      }}
    >
      {faction[0]}
    </span>
  )
}

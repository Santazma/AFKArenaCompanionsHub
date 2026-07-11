import { FACTION_ICONS, FACTION_ORDER, type Faction } from '../../data/heroes'

interface FactionFilterProps {
  active: Set<Faction>
  onToggle: (faction: Faction) => void
}

export default function FactionFilter({ active, onToggle }: FactionFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {FACTION_ORDER.map((faction) => {
        const isActive = active.has(faction)
        return (
          <button
            key={faction}
            type="button"
            onClick={() => onToggle(faction)}
            title={faction}
            aria-pressed={isActive}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 p-0.5 transition-all ${
              isActive ? 'border-gold-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <img
              src={FACTION_ICONS[faction]}
              alt={faction}
              referrerPolicy="no-referrer"
              className="h-full w-full rounded-full object-cover"
            />
          </button>
        )
      })}
    </div>
  )
}

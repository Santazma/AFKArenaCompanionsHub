import { useMemo, useState, type DragEvent } from 'react'
import { heroes, type Faction } from '../../data/heroes'
import { tierColor, tierRank, type ContentMode, type InvestmentLevel } from '../../lib/teamBuilder'
import FactionFilter from './FactionFilter'
import HeroAvatar from './HeroAvatar'

interface HeroBrowserProps {
  mode: ContentMode
  investmentLevel: InvestmentLevel
  selectedHeroId: string | null
  onSelectHero: (heroId: string) => void
}

export default function HeroBrowser({ mode, investmentLevel, selectedHeroId, onSelectHero }: HeroBrowserProps) {
  const [query, setQuery] = useState('')
  const [activeFactions, setActiveFactions] = useState<Set<Faction>>(new Set())

  const toggleFaction = (faction: Faction) => {
    setActiveFactions((prev) => {
      const next = new Set(prev)
      if (next.has(faction)) next.delete(faction)
      else next.add(faction)
      return next
    })
  }

  const sorted = useMemo(() => {
    const filtered = heroes.filter((hero) => {
      const matchesName = hero.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesFaction = activeFactions.size === 0 || activeFactions.has(hero.faction)
      return matchesName && matchesFaction
    })
    return filtered.sort((a, b) => {
      const rankDiff = tierRank(a.modes[mode]) - tierRank(b.modes[mode])
      if (rankDiff !== 0) return rankDiff
      return b.score - a.score
    })
  }, [query, mode, activeFactions])

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-4">
      <div className="mb-3 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">
          Heroes ({sorted.length})
        </h3>
        <FactionFilter active={activeFactions} onToggle={toggleFaction} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search hero name…"
          className="w-48 rounded-full border border-border bg-void/60 px-4 py-1.5 font-body text-sm text-gold-100 placeholder:text-gold-100/40 focus:border-gold-500 focus:outline-none sm:w-64"
        />
      </div>
      <p className="mb-3 font-body text-[11px] text-gold-100/40">
        Drag a hero onto a slot, or tap a hero then tap a slot to place them.
      </p>

      <div className="grid max-h-[28rem] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {sorted.map((hero) => (
          <button
            key={hero.id}
            type="button"
            draggable
            onDragStart={(event: DragEvent) => {
              event.dataTransfer.setData('text/plain', hero.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={() => onSelectHero(hero.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors ${
              selectedHeroId === hero.id
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-transparent hover:border-gold-500/40 hover:bg-void/40'
            }`}
          >
            <HeroAvatar hero={hero} size="sm" investmentLevel={investmentLevel} />
            <span className="w-full truncate font-body text-[11px] text-gold-100/80">{hero.name}</span>
            <span
              className="rounded-full px-2 py-0.5 font-body text-[10px] font-semibold"
              style={{ color: tierColor(hero.modes[mode]), backgroundColor: `${tierColor(hero.modes[mode])}22` }}
            >
              {hero.modes[mode]}
            </span>
            <span className="font-body text-[10px] text-gold-100/40">{hero.investment[investmentLevel] || '—'}</span>
          </button>
        ))}
        {sorted.length === 0 && (
          <p className="col-span-full py-8 text-center font-body text-sm text-gold-100/50">No heroes found.</p>
        )}
      </div>
    </div>
  )
}

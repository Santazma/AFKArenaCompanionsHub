import { useMemo, useState, type DragEvent } from 'react'
import { heroes } from '../../data/heroes'
import { tierColor, tierRank, type ContentMode, type InvestmentLevel } from '../../lib/teamBuilder'
import HeroAvatar from './HeroAvatar'

interface HeroBrowserProps {
  mode: ContentMode
  investmentLevel: InvestmentLevel
  selectedHeroId: string | null
  onSelectHero: (heroId: string) => void
}

export default function HeroBrowser({ mode, investmentLevel, selectedHeroId, onSelectHero }: HeroBrowserProps) {
  const [query, setQuery] = useState('')

  const sorted = useMemo(() => {
    const filtered = heroes.filter((hero) => hero.name.toLowerCase().includes(query.trim().toLowerCase()))
    return filtered.sort((a, b) => {
      const rankDiff = tierRank(a.modes[mode]) - tierRank(b.modes[mode])
      if (rankDiff !== 0) return rankDiff
      return b.score - a.score
    })
  }, [query, mode])

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-4">
      <div className="mb-1 flex items-center justify-between gap-4">
        <h3 className="font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">
          Heroes ({sorted.length})
        </h3>
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
            <HeroAvatar hero={hero} size="sm" />
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

import type { Hero } from '../../data/heroes'
import type { ContentMode, InvestmentLevel } from '../../lib/teamBuilder'
import type { RosterStore } from '../../hooks/useRoster'
import { useHeroFilter } from '../../hooks/useHeroFilter'
import FactionFilter from './FactionFilter'
import HeroCard from './HeroCard'

interface HeroBrowserProps {
  mode: ContentMode
  investmentLevel: InvestmentLevel
  selectedHeroId: string | null
  roster: RosterStore
  onSelectHero: (heroId: string) => void
  onOpenDetail: (hero: Hero) => void
}

export default function HeroBrowser({
  mode,
  investmentLevel,
  selectedHeroId,
  roster,
  onSelectHero,
  onOpenDetail,
}: HeroBrowserProps) {
  const { query, setQuery, activeFactions, toggleFaction, rosterOnly, setRosterOnly, results } = useHeroFilter(
    mode,
    roster,
  )

  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-4">
      <div className="mb-3 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">
          Heroes ({results.length})
        </h3>
        <FactionFilter active={activeFactions} onToggle={toggleFaction} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRosterOnly((v) => !v)}
            title="Show only heroes in My Roster"
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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hero name…"
            className="w-40 rounded-full border border-border bg-void/60 px-4 py-1.5 font-body text-sm text-gold-100 placeholder:text-gold-100/40 focus:border-gold-500 focus:outline-none sm:w-56"
          />
        </div>
      </div>
      <p className="mb-3 font-body text-[11px] text-gold-100/40">
        Tap a hero for details · ＋ to select then tap a slot · drag onto a slot · ★ adds to My Roster.
      </p>

      <div className="grid max-h-[28rem] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {results.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            mode={mode}
            investmentLevel={investmentLevel}
            roster={roster}
            selected={selectedHeroId === hero.id}
            variant="browse"
            onSelect={() => onSelectHero(hero.id)}
            onOpenDetail={onOpenDetail}
          />
        ))}
        {results.length === 0 && (
          <p className="col-span-full py-8 text-center font-body text-sm text-gold-100/50">No heroes found.</p>
        )}
      </div>
    </div>
  )
}

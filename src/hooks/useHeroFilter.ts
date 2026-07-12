import { useMemo, useState } from 'react'
import { heroes, type Faction } from '../data/heroes'
import { tierRank, type ContentMode } from '../lib/teamBuilder'
import type { RosterStore } from './useRoster'

// Shared search / faction / roster filtering used by both the always-on hero
// browser and the in-slot picker modal, sorted by tier for the active mode.
export function useHeroFilter(mode: ContentMode, roster: RosterStore) {
  const [query, setQuery] = useState('')
  const [activeFactions, setActiveFactions] = useState<Set<Faction>>(new Set())
  const [rosterOnly, setRosterOnly] = useState(false)

  const toggleFaction = (faction: Faction) => {
    setActiveFactions((prev) => {
      const next = new Set(prev)
      if (next.has(faction)) next.delete(faction)
      else next.add(faction)
      return next
    })
  }

  const results = useMemo(() => {
    const filtered = heroes.filter((hero) => {
      const matchesName = hero.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesFaction = activeFactions.size === 0 || activeFactions.has(hero.faction)
      const matchesRoster = !rosterOnly || roster.isOwned(hero.id)
      return matchesName && matchesFaction && matchesRoster
    })
    return filtered.sort((a, b) => {
      const rankDiff = tierRank(a.modes[mode]) - tierRank(b.modes[mode])
      if (rankDiff !== 0) return rankDiff
      return b.score - a.score
    })
  }, [query, mode, activeFactions, rosterOnly, roster])

  return { query, setQuery, activeFactions, toggleFaction, rosterOnly, setRosterOnly, results }
}

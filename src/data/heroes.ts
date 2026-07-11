import rawHeroes from './heroes.json'

export type Faction =
  | 'Dimensional'
  | 'Hypogean'
  | 'Wilder'
  | 'Celestial'
  | 'Mauler'
  | 'Graveborn'
  | 'Lightbearer'

export interface Hero {
  id: string
  name: string
  faction: Faction
  overallRank: string
  score: number
  investment: {
    minimum: string
    optimal: string
    competitive: string
  }
  modes: {
    arena: string
    dreamRealm: string
    guildHunt: string
  }
}

export const heroes = rawHeroes as Hero[]

export const heroById = new Map(heroes.map((hero) => [hero.id, hero]))

export const FACTION_COLORS: Record<Faction, string> = {
  Dimensional: '#9d5cff',
  Hypogean: '#e2b53c',
  Wilder: '#4ade80',
  Celestial: '#60a5fa',
  Mauler: '#f87171',
  Graveborn: '#a78bfa',
  Lightbearer: '#fde68a',
}

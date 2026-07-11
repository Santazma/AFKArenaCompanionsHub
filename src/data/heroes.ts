import rawHeroes from './heroes.json'
import judyPunchImage from '../assets/heroes/judy-punch.webp'

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
  image: string | null
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

const IMAGE_OVERRIDES: Record<string, string> = {
  'judy-punch': judyPunchImage,
}

export const heroes = (rawHeroes as Hero[]).map((hero) =>
  IMAGE_OVERRIDES[hero.id] ? { ...hero, image: IMAGE_OVERRIDES[hero.id] } : hero,
)

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

// Order requested for the faction filter row.
export const FACTION_ORDER: Faction[] = [
  'Lightbearer',
  'Mauler',
  'Wilder',
  'Graveborn',
  'Celestial',
  'Hypogean',
  'Dimensional',
]

export const FACTION_ICONS: Record<Faction, string> = {
  Lightbearer: 'https://static.wikia.nocookie.net/afk-arena/images/2/22/Lightbearer.png/revision/latest?cb=20191114215332',
  Mauler: 'https://static.wikia.nocookie.net/afk-arena/images/6/60/Mauler.png/revision/latest?cb=20191114215332',
  Wilder: 'https://static.wikia.nocookie.net/afk-arena/images/a/ab/Wilder.png/revision/latest?cb=20191114215332',
  Graveborn: 'https://static.wikia.nocookie.net/afk-arena/images/a/a7/Graveborn.png/revision/latest?cb=20191114215332',
  Celestial: 'https://static.wikia.nocookie.net/afk-arena/images/f/fc/Celestial.png/revision/latest?cb=20191114215332',
  Hypogean: 'https://static.wikia.nocookie.net/afk-arena/images/1/14/Hypogean.png/revision/latest?cb=20191114215332',
  Dimensional: 'https://static.wikia.nocookie.net/afk-arena/images/d/d8/Dimensional.png/revision/latest?cb=20200122022208',
}

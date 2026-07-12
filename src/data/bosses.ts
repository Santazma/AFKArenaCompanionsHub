import type { ContentMode } from '../lib/teamBuilder'

export interface Boss {
  id: string
  name: string
  mode: Extract<ContentMode, 'dreamRealm' | 'guildHunt'>
  image: string | null
}

// Boss art uses floofpire/cdn's unit icons (keyed by the game's numeric unit
// id), matching the framed hero icons for a consistent look.
const bossIcon = (unitId: number) =>
  `https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/${unitId}_2x.webp`

export const bosses: Boss[] = [
  { id: 'kane', name: 'Kane', mode: 'dreamRealm', image: bossIcon(1003) },
  { id: 'ice-shemira', name: 'Ice Shemira', mode: 'dreamRealm', image: bossIcon(1016) },
  { id: 'demonic-entity', name: 'Demonic Entity', mode: 'dreamRealm', image: bossIcon(1012) },
  { id: 'grotesque-mage', name: 'Grotesque Mage', mode: 'dreamRealm', image: bossIcon(1025) },
  { id: 'the-unhinged', name: 'The Unhinged', mode: 'dreamRealm', image: bossIcon(1022) },
  { id: 'burning-brute', name: 'Burning Brute', mode: 'dreamRealm', image: bossIcon(1017) },
  { id: 'wrizz', name: 'Wrizz', mode: 'guildHunt', image: bossIcon(1006) },
  { id: 'dune-destroyer', name: 'Dune Destroyer', mode: 'guildHunt', image: bossIcon(1075) },
  { id: 'raven-whisperer', name: 'Raven Whisperer', mode: 'guildHunt', image: bossIcon(1092) },
  { id: 'fortune-firecrackers', name: 'Fortune Firecrackers', mode: 'guildHunt', image: bossIcon(1098) },
]

export const bossById = new Map(bosses.map((boss) => [boss.id, boss]))

export function bossesForMode(mode: ContentMode): Boss[] {
  return bosses.filter((boss) => boss.mode === mode)
}

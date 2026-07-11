import type { ContentMode } from '../lib/teamBuilder'

export interface Boss {
  id: string
  name: string
  mode: Extract<ContentMode, 'dreamRealm' | 'guildHunt'>
  image: string | null
}

export const bosses: Boss[] = [
  {
    id: 'kane',
    name: 'Kane',
    mode: 'dreamRealm',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/6/6c/Kane.png/revision/latest?cb=20190915194839',
  },
  {
    id: 'ice-shemira',
    name: 'Ice Shemira',
    mode: 'dreamRealm',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/6/6d/Shemira_Skin_Model.png/revision/latest?cb=20210113223358',
  },
  {
    id: 'demonic-entity',
    name: 'Demonic Entity',
    mode: 'dreamRealm',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/0/0b/Nemora_Alt_Design.jpg/revision/latest?cb=20191109195849',
  },
  {
    id: 'grotesque-mage',
    name: 'Grotesque Mage',
    mode: 'dreamRealm',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/4/44/Grotesque_Mage.png/revision/latest?cb=20210319151547',
  },
  {
    id: 'the-unhinged',
    name: 'The Unhinged',
    mode: 'dreamRealm',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/6/65/The_Unhinged.png/revision/latest?cb=20210122174320',
  },
  {
    id: 'burning-brute',
    name: 'Burning Brute',
    mode: 'dreamRealm',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/f/f1/Nian_Monster.png/revision/latest?cb=20200928210346',
  },
  {
    id: 'wrizz',
    name: 'Wrizz',
    mode: 'guildHunt',
    image: 'https://static.wikia.nocookie.net/afk-arena/images/f/f5/Wrizz_Model.png/revision/latest?cb=20210122042548',
  },
  // No artwork found on the AFK Arena Fandom wiki for these three — the wiki
  // confirms "Dune Destroyer" as a real (upcoming/undocumented) Nightmare
  // Corridor boss name with no uploaded art yet, while "Raven Whisperer" and
  // "Fortune Firecrackers" don't appear anywhere on the wiki at all, likely
  // Companions-exclusive content. They stay selectable with a placeholder.
  { id: 'dune-destroyer', name: 'Dune Destroyer', mode: 'guildHunt', image: null },
  { id: 'raven-whisperer', name: 'Raven Whisperer', mode: 'guildHunt', image: null },
  { id: 'fortune-firecrackers', name: 'Fortune Firecrackers', mode: 'guildHunt', image: null },
]

export const bossById = new Map(bosses.map((boss) => [boss.id, boss]))

export function bossesForMode(mode: ContentMode): Boss[] {
  return bosses.filter((boss) => boss.mode === mode)
}

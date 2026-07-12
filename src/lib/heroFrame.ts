import type { Hero } from '../data/heroes'
import type { InvestmentLevel } from './teamBuilder'
import { FLOOFPIRE_UNIT_ID } from '../data/floofpireIds'

// floofpire/cdn serves pre-rendered "framed" hero icons: the character art
// composited with the in-game ascension frame, star tier, and SI badge. We map
// each hero's recommended investment string (per level) onto one of those files
// so the avatar itself communicates the tier at a glance.
//
// Filename grammar (from the CDN's nameGenerator):
//   <unitId>_<ascension>[_si<level>]_2x.webp
// where the SI suffix is only present for Mythic tier and above.

const CDN_BASE = 'https://raw.githubusercontent.com/floofpire/cdn/main/framed_unit_icon'

// Ascension short codes, lowest → highest, matching the CDN.
const ASCENSION_ORDER = ['c', 'r', 'rp', 'e', 'ep', 'l', 'lp', 'm', 'mp', 'a', 'a1', 'a2', 'a3', 'a4', 'a5']
const MYTHIC_RANK = ASCENSION_ORDER.indexOf('m')

function ascensionRank(code: string): number {
  return ASCENSION_ORDER.indexOf(code)
}

function tokenToCode(token: string): string | null {
  const t = token.trim().toLowerCase()
  if (/^a[1-5]\*?$/.test(t)) return 'a' + t[1]
  if (t === 'a' || t === 'ascended') return 'a'
  if (t === 'm' || t === 'mythic') return 'm'
  if (t === 'm+' || t === 'mythic+') return 'mp'
  if (t === 'e' || t === 'elite') return 'e'
  if (t === 'e+' || t === 'elite+') return 'ep'
  if (t === 'l' || t === 'legendary') return 'l'
  // "T" (Transcended) has no dedicated frame — treat it as the highest we have.
  if (t === 't' || t === 'transcended') return 'a5'
  return null
}

// SI is only rendered at discrete levels; snap down to the nearest valid one.
const VALID_SI = [0, 10, 20, 30, 40, 50]

function normalizeSi(value: number): number {
  let best = 0
  for (const level of VALID_SI) if (value >= level) best = level
  return best
}

interface ParsedInvestment {
  ascension: string
  si: number | null
}

// Investment strings mix single values and ranges ("Elite", "A3* SI 20",
// "Mythic < A5* SI 20 < SI 30", "A5* / T SI 30"). We take the LOWEST tier and
// LOWEST SI mentioned — the entry point of that band — so the three investment
// levels stay visually distinct (minimum < optimal < competitive).
function parseInvestment(raw: string | undefined): ParsedInvestment | null {
  if (!raw || !raw.trim()) return null
  const tiers: string[] = []
  const tierRe = /(a[1-5]\*?|mythic\+?|m\+?|elite\+?|legendary|ascended|\bt\b|\ba\b)/gi
  let match: RegExpExecArray | null
  while ((match = tierRe.exec(raw))) {
    const code = tokenToCode(match[1])
    if (code) tiers.push(code)
  }
  if (!tiers.length) return null
  tiers.sort((a, b) => ascensionRank(a) - ascensionRank(b))
  const ascension = tiers[0]

  const siValues = [...raw.matchAll(/si\s*(\d+)/gi)].map((m) => Number(m[1]))
  const si = siValues.length ? normalizeSi(Math.min(...siValues)) : null

  return { ascension, si }
}

function buildFileName(unitId: number, parsed: ParsedInvestment): string {
  let name = `${unitId}_${parsed.ascension}`
  if (ascensionRank(parsed.ascension) >= MYTHIC_RANK && parsed.si != null) {
    name += `_si${parsed.si}`
  }
  return `${name}_2x.webp`
}

// The three preset investment bands come straight from the tier-list data; the
// fourth level ("mine") is roster-driven and handled by ownedFrameUrl below.
type PresetLevel = 'minimum' | 'optimal' | 'competitive'

// Returns the CDN URL of the framed icon for this hero at the given investment
// level, falling back to lower levels if the requested one is blank, or null if
// the hero has no floofpire mapping (anime collabs) or no usable investment data.
export function heroFrameUrl(hero: Hero, level: PresetLevel): string | null {
  const unitId = FLOOFPIRE_UNIT_ID[hero.id]
  if (unitId == null) return null

  const fallbackOrder: PresetLevel[] =
    level === 'competitive'
      ? ['competitive', 'optimal', 'minimum']
      : level === 'optimal'
        ? ['optimal', 'minimum']
        : ['minimum']

  for (const lvl of fallbackOrder) {
    const parsed = parseInvestment(hero.investment[lvl])
    if (parsed) return `${CDN_BASE}/${buildFileName(unitId, parsed)}`
  }
  return null
}

// Maps a roster ascension label to the CDN's short code.
const OWNED_TIER_CODE: Record<string, string> = {
  Elite: 'e',
  'Elite+': 'ep',
  Legendary: 'l',
  Mythic: 'm',
  'Mythic+': 'mp',
  Ascended: 'a',
  A1: 'a1',
  A2: 'a2',
  A3: 'a3',
  A4: 'a4',
  A5: 'a5',
}

export interface Ownership {
  tier: string | null
  si: number | null
}

// "My Investment" view: heroes you don't own (or own without a set tier) show the
// plain Common (green) frame, mirroring the game's uninvested icon; owned heroes
// render at the exact ascension + SI recorded in your roster.
export function ownedFrameUrl(hero: Hero, ownership: Ownership | null): string | null {
  const unitId = FLOOFPIRE_UNIT_ID[hero.id]
  if (unitId == null) return null

  const asc = ownership?.tier ? OWNED_TIER_CODE[ownership.tier] : null
  if (!asc) return `${CDN_BASE}/${unitId}_c_2x.webp`

  let name = `${unitId}_${asc}`
  if (ascensionRank(asc) >= MYTHIC_RANK) name += `_si${ownership?.si ?? 0}`
  return `${CDN_BASE}/${name}_2x.webp`
}

// Resolves the framed icon for any investment level, including roster-driven "mine".
export function resolveFrameUrl(hero: Hero, level: InvestmentLevel, ownership: Ownership | null): string | null {
  if (level === 'mine') return ownedFrameUrl(hero, ownership)
  return heroFrameUrl(hero, level)
}

// Short text describing the investment shown for a level (for card captions).
export function investmentLabel(hero: Hero, level: InvestmentLevel, ownership: Ownership | null): string {
  if (level !== 'mine') return hero.investment[level] || '—'
  if (!ownership) return 'Not owned'
  const tier = ownership.tier ?? 'Owned'
  return ownership.si != null ? `${tier} · SI ${ownership.si}` : tier
}

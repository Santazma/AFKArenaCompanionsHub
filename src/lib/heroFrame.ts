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

// Returns the CDN URL of the framed icon for this hero at the given investment
// level, falling back to lower levels if the requested one is blank, or null if
// the hero has no floofpire mapping (anime collabs) or no usable investment data.
export function heroFrameUrl(hero: Hero, level: InvestmentLevel): string | null {
  const unitId = FLOOFPIRE_UNIT_ID[hero.id]
  if (unitId == null) return null

  const fallbackOrder: InvestmentLevel[] =
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

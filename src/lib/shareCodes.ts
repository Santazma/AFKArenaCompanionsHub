import { heroById } from '../data/heroes'
import { OWNED_SI, OWNED_TIERS, type OwnedSi, type OwnedTier, type Roster } from '../hooks/useRoster'
import { fromBase64Url, sanitizeBuild, toBase64Url, type BuilderState, type ContentMode } from './teamBuilder'

// Portable, backend-less sync codes. Each code is tagged with a "kind" so the
// importer can reject a team code pasted into the roster box (and vice versa).
// The site is fully static, so these codes ARE the cross-device mechanism.

type Kind = 'team' | 'roster' | 'profile'

function slimBuilds(builds: BuilderState): Record<string, unknown> {
  const slim: Record<string, unknown> = {}
  for (const mode of Object.keys(builds) as ContentMode[]) {
    const { ours, opponent, bossId } = builds[mode]
    slim[mode] = { ours, opponent, bossId }
  }
  return slim
}

const VALID_TIERS = new Set<string>(OWNED_TIERS)
const VALID_SI = new Set<number>(OWNED_SI)

export function sanitizeRoster(input: unknown): Roster {
  const out: Roster = {}
  if (!input || typeof input !== 'object') return out
  for (const [id, value] of Object.entries(input as Record<string, unknown>)) {
    if (!heroById.has(id)) continue
    const entry = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
    const tier = typeof entry.tier === 'string' && VALID_TIERS.has(entry.tier) ? (entry.tier as OwnedTier) : null
    const si = typeof entry.si === 'number' && VALID_SI.has(entry.si) ? (entry.si as OwnedSi) : null
    out[id] = { tier, si }
  }
  return out
}

function decode(code: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code.trim()))
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function tag(kind: Kind, payload: Record<string, unknown>): string {
  return toBase64Url(JSON.stringify({ k: kind, v: 1, ...payload }))
}

// ---- Team (builds only) ----

export function encodeTeamCode(builds: BuilderState): string {
  return tag('team', { builds: slimBuilds(builds) })
}

export function decodeTeamCode(code: string): BuilderState | null {
  const parsed = decode(code)
  if (!parsed) return null
  // A roster/profile code must never load as a team.
  if (parsed.k === 'roster' || parsed.k === 'profile' || 'roster' in parsed) return null
  if (parsed.k === 'team') return sanitizeBuild(parsed.builds)
  // Back-compat: legacy untagged all-modes build object.
  if ('arena' in parsed || 'dreamRealm' in parsed || 'guildHunt' in parsed) return sanitizeBuild(parsed)
  return null
}

// ---- Roster only ----

export function encodeRosterCode(roster: Roster): string {
  return tag('roster', { roster })
}

export function decodeRosterCode(code: string): Roster | null {
  const parsed = decode(code)
  if (!parsed || parsed.k !== 'roster') return null
  return sanitizeRoster(parsed.roster)
}

// ---- Full profile (name + avatar + roster + builds) ----

export interface ProfilePayload {
  name: string
  avatarHeroId: string | null
  roster: Roster
  builds: BuilderState
}

export function encodeProfileCode(profile: ProfilePayload): string {
  return tag('profile', {
    name: profile.name,
    avatarHeroId: profile.avatarHeroId,
    roster: profile.roster,
    builds: slimBuilds(profile.builds),
  })
}

export function decodeProfileCode(code: string): ProfilePayload | null {
  const parsed = decode(code)
  if (!parsed || parsed.k !== 'profile') return null
  return {
    name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.slice(0, 40) : 'Imported profile',
    avatarHeroId: typeof parsed.avatarHeroId === 'string' && heroById.has(parsed.avatarHeroId) ? parsed.avatarHeroId : null,
    roster: sanitizeRoster(parsed.roster),
    builds: sanitizeBuild(parsed.builds),
  }
}

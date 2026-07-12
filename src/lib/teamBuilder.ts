import { bossById } from '../data/bosses'
import { heroById } from '../data/heroes'

export type ContentMode = 'arena' | 'dreamRealm' | 'guildHunt'
export type InvestmentLevel = 'minimum' | 'optimal' | 'competitive' | 'mine'
export type Side = 'ours' | 'opponent'

export interface SlotRef {
  side: Side
  teamIndex: number
  slotIndex: number
}

export function slotKey(ref: SlotRef): string {
  return `${ref.side}:${ref.teamIndex}:${ref.slotIndex}`
}

export function parseSlotKey(key: string): SlotRef | null {
  const [side, teamIndex, slotIndex] = key.split(':')
  if (side !== 'ours' && side !== 'opponent') return null
  return { side, teamIndex: Number(teamIndex), slotIndex: Number(slotIndex) }
}

export const TEAM_SIZE = 5
export const MIN_TEAMS = 1
export const MAX_TEAMS = 5

export const CONTENT_MODES: { id: ContentMode; label: string; hasOpponentTeam: boolean }[] = [
  { id: 'arena', label: 'Arena', hasOpponentTeam: true },
  { id: 'dreamRealm', label: 'Dream Realm', hasOpponentTeam: false },
  { id: 'guildHunt', label: 'Guild Hunt', hasOpponentTeam: false },
]

export const INVESTMENT_LEVELS: { id: InvestmentLevel; label: string }[] = [
  { id: 'minimum', label: 'Minimum' },
  { id: 'optimal', label: 'Optimal' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'mine', label: 'My Investment' },
]

export type Team = (string | null)[]

export interface ModeTeams {
  ours: Team[]
  opponent: Team[]
  // A single boss shared by every team in this mode — Dream Realm / Guild
  // Hunt teams are all built against the same boss, not one each.
  bossId: string | null
}

export type BuilderState = Record<ContentMode, ModeTeams>

function emptyTeam(): Team {
  return Array.from({ length: TEAM_SIZE }, () => null)
}

function emptyTeams(count: number): Team[] {
  return Array.from({ length: count }, emptyTeam)
}

export function createInitialState(): BuilderState {
  return {
    arena: { ours: emptyTeams(1), opponent: emptyTeams(1), bossId: null },
    dreamRealm: { ours: emptyTeams(1), opponent: [], bossId: null },
    guildHunt: { ours: emptyTeams(1), opponent: [], bossId: null },
  }
}

export function resizeTeams(teams: Team[], count: number): Team[] {
  const next = teams.slice(0, count)
  while (next.length < count) next.push(emptyTeam())
  return next
}

const TIER_ORDER = ['SSS', 'SS', 'S+', 'S', 'S-', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'X']

export function tierRank(tier: string): number {
  const index = TIER_ORDER.indexOf(tier)
  return index === -1 ? TIER_ORDER.length : index
}

export function tierColor(tier: string): string {
  if (tier === 'SSS' || tier === 'SS') return '#f4d67f'
  if (tier === 'S+' || tier === 'S' || tier === 'S-') return '#c9a8ff'
  if (tier === 'A+' || tier === 'A') return '#7dd3fc'
  if (tier === 'B') return '#86efac'
  if (tier === 'C') return '#e2b53c'
  if (tier === 'D' || tier === 'E') return '#fb923c'
  if (tier === 'F') return '#f87171'
  return '#6b6375'
}

export function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(input: string): string {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4)
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

interface ShareablePayload {
  mode: ContentMode
  ours: Team[]
  opponent: Team[]
  bossId: string | null
}

export function encodeShare(mode: ContentMode, teams: ModeTeams): string {
  const payload: ShareablePayload = {
    mode,
    ours: teams.ours,
    opponent: teams.opponent,
    bossId: teams.bossId,
  }
  return toBase64Url(JSON.stringify(payload))
}

function sanitizeModeTeams(parsed: {
  ours?: unknown
  opponent?: unknown
  bossId?: unknown
}): Pick<ModeTeams, 'ours' | 'opponent' | 'bossId'> {
  const sanitizeTeam = (team: unknown): Team =>
    Array.isArray(team)
      ? Array.from({ length: TEAM_SIZE }, (_, i) => {
          const id = team[i]
          return typeof id === 'string' && heroById.has(id) ? id : null
        })
      : emptyTeam()
  return {
    ours: Array.isArray(parsed.ours) ? parsed.ours.map(sanitizeTeam) : [],
    opponent: Array.isArray(parsed.opponent) ? parsed.opponent.map(sanitizeTeam) : [],
    bossId: typeof parsed.bossId === 'string' && bossById.has(parsed.bossId) ? parsed.bossId : null,
  }
}

export function decodeShare(code: string): ShareablePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code)) as ShareablePayload
    if (!parsed || typeof parsed.mode !== 'string' || !Array.isArray(parsed.ours)) return null
    return { mode: parsed.mode, ...sanitizeModeTeams(parsed) }
  } catch {
    return null
  }
}

// Encodes the ENTIRE builder (all three modes) into one shareable code, so a
// single link carries a player's Arena, Dream Realm and Guild Hunt drafts.
export function encodeBuild(state: BuilderState): string {
  const slim: Record<string, Pick<ModeTeams, 'ours' | 'opponent' | 'bossId'>> = {}
  for (const mode of Object.keys(state) as ContentMode[]) {
    const { ours, opponent, bossId } = state[mode]
    slim[mode] = { ours, opponent, bossId }
  }
  return toBase64Url(JSON.stringify(slim))
}

// Validates a decoded (object) build into a full BuilderState, ignoring unknown
// modes/heroes. Shared by decodeBuild and the profile importer.
export function sanitizeBuild(parsed: unknown): BuilderState {
  const base = createInitialState()
  if (parsed && typeof parsed === 'object') {
    const byMode = parsed as Partial<Record<ContentMode, unknown>>
    for (const mode of Object.keys(base) as ContentMode[]) {
      const modeTeams = byMode[mode]
      if (modeTeams && typeof modeTeams === 'object') {
        base[mode] = sanitizeModeTeams(modeTeams as Record<string, unknown>)
      }
    }
  }
  return base
}

export function decodeBuild(code: string): BuilderState | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code))
    if (!parsed || typeof parsed !== 'object') return null
    return sanitizeBuild(parsed)
  } catch {
    return null
  }
}

// A plain-text roster summary of every non-empty team, for pasting into chat.
export function buildSummary(state: BuilderState, heroName: (id: string) => string): string {
  const lines: string[] = []
  for (const { id, label } of CONTENT_MODES) {
    const modeTeams = state[id]
    const teamLines: string[] = []
    modeTeams.ours.forEach((team, i) => {
      const names = team.filter((h): h is string => Boolean(h)).map(heroName)
      if (names.length) teamLines.push(`  Team ${i + 1}: ${names.join(', ')}`)
    })
    if (teamLines.length) {
      const bossName = modeTeams.bossId ? bossById.get(modeTeams.bossId)?.name : null
      lines.push(`${label}${bossName ? ` (vs ${bossName})` : ''}:`)
      lines.push(...teamLines)
    }
  }
  return lines.length ? lines.join('\n') : 'No teams built yet.'
}

export function clearModeTeams(teams: ModeTeams): ModeTeams {
  return {
    ours: teams.ours.map(() => emptyTeam()),
    opponent: teams.opponent.map(() => emptyTeam()),
    bossId: teams.bossId,
  }
}

const STORAGE_KEY = 'afk-team-builder-state-v1'

export function loadState(): BuilderState {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<Record<ContentMode, Partial<ModeTeams>>>
    const base = createInitialState()
    for (const mode of Object.keys(base) as ContentMode[]) {
      const modeTeams = parsed[mode]
      if (modeTeams) base[mode] = sanitizeModeTeams(modeTeams)
    }
    return base
  } catch {
    return createInitialState()
  }
}

export function saveState(state: BuilderState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

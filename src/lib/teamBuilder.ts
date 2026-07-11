import { bossById } from '../data/bosses'
import { heroById } from '../data/heroes'

export type ContentMode = 'arena' | 'dreamRealm' | 'guildHunt'
export type InvestmentLevel = 'minimum' | 'optimal' | 'competitive'
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
]

const BOSS_LABEL: Record<Exclude<ContentMode, 'arena'>, string> = {
  dreamRealm: 'Dream Realm Boss',
  guildHunt: 'Guild Hunt Boss',
}

export function bossLabelFor(mode: ContentMode): string | null {
  return mode === 'arena' ? null : BOSS_LABEL[mode]
}

export type Team = (string | null)[]

export interface ModeTeams {
  ours: Team[]
  opponent: Team[]
  bossIds: (string | null)[]
}

export type BuilderState = Record<ContentMode, ModeTeams>

function emptyTeam(): Team {
  return Array.from({ length: TEAM_SIZE }, () => null)
}

function emptyTeams(count: number): Team[] {
  return Array.from({ length: count }, emptyTeam)
}

function emptyBossIds(count: number): (string | null)[] {
  return Array.from({ length: count }, () => null)
}

export function createInitialState(): BuilderState {
  return {
    arena: { ours: emptyTeams(1), opponent: emptyTeams(1), bossIds: [] },
    dreamRealm: { ours: emptyTeams(1), opponent: [], bossIds: emptyBossIds(1) },
    guildHunt: { ours: emptyTeams(1), opponent: [], bossIds: emptyBossIds(1) },
  }
}

export function resizeTeams(teams: Team[], count: number): Team[] {
  const next = teams.slice(0, count)
  while (next.length < count) next.push(emptyTeam())
  return next
}

export function resizeBossIds(bossIds: (string | null)[], count: number): (string | null)[] {
  const next = bossIds.slice(0, count)
  while (next.length < count) next.push(null)
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

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): string {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4)
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

interface ShareablePayload {
  mode: ContentMode
  ours: Team[]
  opponent: Team[]
  bossIds: (string | null)[]
}

export function encodeShare(mode: ContentMode, teams: ModeTeams): string {
  const payload: ShareablePayload = {
    mode,
    ours: teams.ours,
    opponent: teams.opponent,
    bossIds: teams.bossIds,
  }
  return toBase64Url(JSON.stringify(payload))
}

function sanitizeModeTeams(parsed: {
  ours?: unknown
  opponent?: unknown
  bossIds?: unknown
}): Pick<ModeTeams, 'ours' | 'opponent' | 'bossIds'> {
  const sanitizeTeam = (team: unknown): Team =>
    Array.isArray(team)
      ? Array.from({ length: TEAM_SIZE }, (_, i) => {
          const id = team[i]
          return typeof id === 'string' && heroById.has(id) ? id : null
        })
      : emptyTeam()
  const sanitizeBossId = (id: unknown): string | null => (typeof id === 'string' && bossById.has(id) ? id : null)
  const ours = Array.isArray(parsed.ours) ? parsed.ours.map(sanitizeTeam) : []
  const bossIds = Array.isArray(parsed.bossIds) ? parsed.bossIds.map(sanitizeBossId) : []
  return {
    ours,
    opponent: Array.isArray(parsed.opponent) ? parsed.opponent.map(sanitizeTeam) : [],
    // Older saved state (from before boss picking existed) has no bossIds,
    // or a length that no longer matches `ours` after a resize — always
    // reconcile against the current team count so setBoss's index-based
    // update can never silently no-op on a too-short array.
    bossIds: resizeBossIds(bossIds, ours.length),
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

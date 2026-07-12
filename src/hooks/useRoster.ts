import { useCallback, useEffect, useState } from 'react'

// The player's personal roster: which heroes they own and, optionally, the
// ascension tier they've invested to. Persisted separately from team builds so
// it survives across every mode and share import.

export const OWNED_TIERS = [
  'Elite',
  'Elite+',
  'Legendary',
  'Mythic',
  'Mythic+',
  'Ascended',
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
] as const

export type OwnedTier = (typeof OWNED_TIERS)[number]

// Signature Item levels a player can record for an owned hero.
export const OWNED_SI = [0, 10, 20, 30, 40] as const
export type OwnedSi = (typeof OWNED_SI)[number]

export interface RosterEntry {
  tier: OwnedTier | null
  si: OwnedSi | null
}

export type Roster = Record<string, RosterEntry>

const STORAGE_KEY = 'afk-roster-v1'

function loadRoster(): Roster {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Roster
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function useRoster() {
  const [roster, setRoster] = useState<Roster>(loadRoster)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roster))
  }, [roster])

  const isOwned = useCallback((heroId: string) => heroId in roster, [roster])

  const entry = useCallback((heroId: string): RosterEntry | null => roster[heroId] ?? null, [roster])

  const ownedTier = useCallback((heroId: string) => roster[heroId]?.tier ?? null, [roster])

  const ownedSi = useCallback((heroId: string) => roster[heroId]?.si ?? null, [roster])

  const toggleOwned = useCallback((heroId: string) => {
    setRoster((prev) => {
      const next = { ...prev }
      if (heroId in next) delete next[heroId]
      else next[heroId] = { tier: null, si: null }
      return next
    })
  }, [])

  const setOwned = useCallback((heroId: string, owned: boolean) => {
    setRoster((prev) => {
      if (owned === heroId in prev) return prev
      const next = { ...prev }
      if (owned) next[heroId] = { tier: null, si: null }
      else delete next[heroId]
      return next
    })
  }, [])

  const setOwnedTier = useCallback((heroId: string, tier: OwnedTier | null) => {
    setRoster((prev) => ({ ...prev, [heroId]: { tier, si: prev[heroId]?.si ?? null } }))
  }, [])

  const setOwnedSi = useCallback((heroId: string, si: OwnedSi | null) => {
    setRoster((prev) => ({ ...prev, [heroId]: { tier: prev[heroId]?.tier ?? null, si } }))
  }, [])

  return {
    roster,
    isOwned,
    entry,
    ownedTier,
    ownedSi,
    toggleOwned,
    setOwned,
    setOwnedTier,
    setOwnedSi,
    ownedCount: Object.keys(roster).length,
  }
}

export type RosterStore = ReturnType<typeof useRoster>

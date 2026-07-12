import { useCallback, useEffect, useState } from 'react'
import { createInitialState, loadState, type BuilderState } from '../lib/teamBuilder'
import { sanitizeRoster } from '../lib/shareCodes'
import type { Roster } from './useRoster'

// A profile bundles a player's roster and team builds under a name + hero-icon
// avatar. Multiple profiles live side by side; switching never discards data
// because every profile keeps its own copy. Everything persists locally.

export interface Profile {
  id: string
  name: string
  avatarHeroId: string | null
  roster: Roster
  builds: BuilderState
}

export interface ProfileData {
  roster: Roster
  builds: BuilderState
}

interface ProfilesState {
  profiles: Profile[]
  activeId: string
}

const KEY = 'afk-profiles-v1'
const LEGACY_ROSTER_KEY = 'afk-roster-v1'

function newId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function loadLegacyRoster(): Roster {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(LEGACY_ROSTER_KEY)
    return raw ? sanitizeRoster(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

function makeProfile(name: string, data?: Partial<ProfileData>, avatarHeroId: string | null = null): Profile {
  return {
    id: newId(),
    name,
    avatarHeroId,
    roster: data?.roster ?? {},
    builds: data?.builds ?? createInitialState(),
  }
}

function sanitizeState(parsed: unknown): ProfilesState | null {
  if (!parsed || typeof parsed !== 'object') return null
  const p = parsed as Partial<ProfilesState>
  if (!Array.isArray(p.profiles) || p.profiles.length === 0) return null
  const profiles = p.profiles.map((pr) => ({
    id: typeof pr.id === 'string' ? pr.id : newId(),
    name: typeof pr.name === 'string' && pr.name.trim() ? pr.name : 'Profile',
    avatarHeroId: typeof pr.avatarHeroId === 'string' ? pr.avatarHeroId : null,
    roster: sanitizeRoster(pr.roster),
    builds: (pr.builds as BuilderState) ?? createInitialState(),
  }))
  const activeId = profiles.some((pr) => pr.id === p.activeId) ? (p.activeId as string) : profiles[0].id
  return { profiles, activeId }
}

function loadProfiles(): ProfilesState {
  if (typeof window === 'undefined') {
    const fresh = makeProfile('Profile 1')
    return { profiles: [fresh], activeId: fresh.id }
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = sanitizeState(JSON.parse(raw))
      if (parsed) return parsed
    }
  } catch {
    /* fall through to migration */
  }
  // First run: fold the pre-profiles single roster + builds into a default profile.
  const migrated = makeProfile('Profile 1', { roster: loadLegacyRoster(), builds: loadState() })
  return { profiles: [migrated], activeId: migrated.id }
}

export function useProfiles() {
  const [state, setState] = useState<ProfilesState>(loadProfiles)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const active = state.profiles.find((p) => p.id === state.activeId) ?? state.profiles[0]

  // Persist the live working roster + builds into the active profile.
  const saveActive = useCallback((roster: Roster, builds: BuilderState) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === prev.activeId ? { ...p, roster, builds } : p)),
    }))
  }, [])

  const dataOf = useCallback(
    (id: string): ProfileData => {
      const p = state.profiles.find((pr) => pr.id === id) ?? active
      return { roster: p.roster, builds: p.builds }
    },
    [state.profiles, active],
  )

  const switchTo = useCallback(
    (id: string): ProfileData | null => {
      if (id === state.activeId) return null
      const target = state.profiles.find((p) => p.id === id)
      if (!target) return null
      setState((prev) => ({ ...prev, activeId: id }))
      return { roster: target.roster, builds: target.builds }
    },
    [state.activeId, state.profiles],
  )

  // Creates a fresh empty profile and switches to it; returns its (empty) data.
  const createAndSwitch = useCallback((name: string): ProfileData => {
    const profile = makeProfile(name.trim() || 'New profile')
    setState((prev) => ({ profiles: [...prev.profiles, profile], activeId: profile.id }))
    return { roster: profile.roster, builds: profile.builds }
  }, [])

  // Imports a full profile as a new entry and switches to it.
  const importProfile = useCallback(
    (name: string, avatarHeroId: string | null, roster: Roster, builds: BuilderState): ProfileData => {
      const profile: Profile = { id: newId(), name: name.trim() || 'Imported profile', avatarHeroId, roster, builds }
      setState((prev) => ({ profiles: [...prev.profiles, profile], activeId: profile.id }))
      return { roster, builds }
    },
    [],
  )

  const rename = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, name: name.slice(0, 40) } : p)),
    }))
  }, [])

  const setAvatar = useCallback((id: string, heroId: string | null) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, avatarHeroId: heroId } : p)),
    }))
  }, [])

  // Removes a profile. If the active one is removed, returns the data of the
  // profile that becomes active so the caller can load it into the live state.
  const remove = useCallback(
    (id: string): ProfileData | null => {
      let nextData: ProfileData | null = null
      setState((prev) => {
        if (prev.profiles.length <= 1) return prev
        const remaining = prev.profiles.filter((p) => p.id !== id)
        let activeId = prev.activeId
        if (id === prev.activeId) {
          activeId = remaining[0].id
          nextData = { roster: remaining[0].roster, builds: remaining[0].builds }
        }
        return { profiles: remaining, activeId }
      })
      return nextData
    },
    [],
  )

  return {
    profiles: state.profiles,
    activeId: state.activeId,
    active,
    saveActive,
    dataOf,
    switchTo,
    createAndSwitch,
    importProfile,
    rename,
    setAvatar,
    remove,
  }
}

export type ProfilesStore = ReturnType<typeof useProfiles>

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { heroById } from '../data/heroes'
import {
  type BuilderState,
  type ContentMode,
  type InvestmentLevel,
  type ModeTeams,
  type Side,
  buildSummary,
  clearModeTeams,
  decodeBuild,
  decodeShare,
  encodeBuild,
  loadState,
  resizeTeams,
  saveState,
} from '../lib/teamBuilder'

const MAX_HISTORY = 50

function readInitialState(): { state: BuilderState; mode: ContentMode } {
  const stored = loadState()
  if (typeof window === 'undefined') return { state: stored, mode: 'arena' }

  const params = new URLSearchParams(window.location.search)

  // Full-build link (all modes at once).
  const buildCode = params.get('build')
  if (buildCode) {
    const decoded = decodeBuild(buildCode)
    if (decoded) return { state: decoded, mode: 'arena' }
  }

  // Legacy single-mode link.
  const shareCode = params.get('team')
  if (shareCode) {
    const shared = decodeShare(shareCode)
    if (shared) {
      const next: BuilderState = {
        ...stored,
        [shared.mode]: { ours: shared.ours, opponent: shared.opponent, bossId: shared.bossId },
      }
      return { state: next, mode: shared.mode }
    }
  }

  return { state: stored, mode: 'arena' }
}

export function useTeamBuilderState() {
  const [{ state: initialState, mode: initialMode }] = useState(readInitialState)
  const [state, setState] = useState<BuilderState>(initialState)
  const [mode, setMode] = useState<ContentMode>(initialMode)
  const [investmentLevel, setInvestmentLevel] = useState<InvestmentLevel>('optimal')
  const [past, setPast] = useState<BuilderState[]>([])

  // Mirror the committed state so history snapshots read the latest value
  // without being taken inside a setState updater (which Strict Mode double-runs).
  const presentRef = useRef(state)
  presentRef.current = state

  const snapshot = useCallback(() => {
    setPast((prev) => [...prev, presentRef.current].slice(-MAX_HISTORY))
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    let changed = false
    for (const param of ['team', 'build']) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param)
        changed = true
      }
    }
    if (changed) window.history.replaceState({}, '', url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const teams = state[mode]

  const setTeamCount = useCallback(
    (count: number) => {
      snapshot()
      setState((prev) => {
        const current = prev[mode]
        const next: ModeTeams = {
          ours: resizeTeams(current.ours, count),
          opponent: current.opponent.length > 0 ? resizeTeams(current.opponent, count) : current.opponent,
          bossId: current.bossId,
        }
        return { ...prev, [mode]: next }
      })
    },
    [mode, snapshot],
  )

  const setBoss = useCallback(
    (bossId: string | null) => {
      snapshot()
      setState((prev) => ({ ...prev, [mode]: { ...prev[mode], bossId } }))
    },
    [mode, snapshot],
  )

  const assignHero = useCallback(
    (side: Side, teamIndex: number, slotIndex: number, heroId: string) => {
      snapshot()
      setState((prev) => {
        const current = prev[mode]
        const targetTeams = side === 'ours' ? current.ours : current.opponent
        const updatedTeams = targetTeams.map((team, i) => {
          if (i !== teamIndex) return team
          const nextTeam = [...team]
          nextTeam[slotIndex] = heroId
          return nextTeam
        })
        const next: ModeTeams =
          side === 'ours' ? { ...current, ours: updatedTeams } : { ...current, opponent: updatedTeams }
        return { ...prev, [mode]: next }
      })
    },
    [mode, snapshot],
  )

  const clearSlot = useCallback(
    (side: Side, teamIndex: number, slotIndex: number) => {
      snapshot()
      setState((prev) => {
        const current = prev[mode]
        const targetTeams = side === 'ours' ? current.ours : current.opponent
        const updatedTeams = targetTeams.map((team, i) => {
          if (i !== teamIndex) return team
          const nextTeam = [...team]
          nextTeam[slotIndex] = null
          return nextTeam
        })
        const next: ModeTeams =
          side === 'ours' ? { ...current, ours: updatedTeams } : { ...current, opponent: updatedTeams }
        return { ...prev, [mode]: next }
      })
    },
    [mode, snapshot],
  )

  const clearTeams = useCallback(() => {
    snapshot()
    setState((prev) => ({ ...prev, [mode]: clearModeTeams(prev[mode]) }))
  }, [mode, snapshot])

  const undo = useCallback(() => {
    setPast((prev) => {
      if (!prev.length) return prev
      const previous = prev[prev.length - 1]
      setState(previous)
      return prev.slice(0, -1)
    })
  }, [])

  // Loads a full-build share code into every mode. Returns false if invalid.
  const importBuild = useCallback(
    (code: string): boolean => {
      const decoded = decodeBuild(code.trim())
      if (!decoded) return false
      snapshot()
      setState(decoded)
      return true
    },
    [snapshot],
  )

  // Loads an already-decoded build state (from a profile import).
  const importBuildState = useCallback(
    (next: BuilderState) => {
      snapshot()
      setState(next)
    },
    [snapshot],
  )

  const usedHeroIds = useMemo(() => {
    const used = new Set<string>()
    teams.ours.forEach((team) => team.forEach((id) => id && used.add(id)))
    teams.opponent.forEach((team) => team.forEach((id) => id && used.add(id)))
    return used
  }, [teams])

  const hasTeams = useMemo(
    () => teams.ours.some((team) => team.some(Boolean)) || teams.opponent.some((team) => team.some(Boolean)),
    [teams],
  )

  const shareCode = useCallback(() => encodeBuild(state), [state])

  const shareUrl = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('team')
    url.searchParams.set('build', encodeBuild(state))
    return url.toString()
  }, [state])

  const summary = useCallback(() => buildSummary(state, (id) => heroById.get(id)?.name ?? id), [state])

  return {
    mode,
    setMode,
    investmentLevel,
    setInvestmentLevel,
    teams,
    setTeamCount,
    assignHero,
    clearSlot,
    clearTeams,
    setBoss,
    undo,
    importBuild,
    importBuildState,
    builds: state,
    canUndo: past.length > 0,
    hasTeams,
    usedHeroIds,
    shareUrl,
    shareCode,
    summary,
  }
}

export type TeamBuilderStore = ReturnType<typeof useTeamBuilderState>

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type BuilderState,
  type ContentMode,
  type InvestmentLevel,
  type ModeTeams,
  type Side,
  decodeShare,
  encodeShare,
  loadState,
  resizeBossIds,
  resizeTeams,
  saveState,
} from '../lib/teamBuilder'

function readInitialState(): { state: BuilderState; mode: ContentMode } {
  const stored = loadState()
  if (typeof window === 'undefined') return { state: stored, mode: 'arena' }

  const params = new URLSearchParams(window.location.search)
  const shareCode = params.get('team')
  if (!shareCode) return { state: stored, mode: 'arena' }

  const shared = decodeShare(shareCode)
  if (!shared) return { state: stored, mode: 'arena' }

  const next: BuilderState = {
    ...stored,
    [shared.mode]: { ours: shared.ours, opponent: shared.opponent, bossIds: shared.bossIds },
  }
  return { state: next, mode: shared.mode }
}

export function useTeamBuilderState() {
  const [{ state: initialState, mode: initialMode }] = useState(readInitialState)
  const [state, setState] = useState<BuilderState>(initialState)
  const [mode, setMode] = useState<ContentMode>(initialMode)
  const [investmentLevel, setInvestmentLevel] = useState<InvestmentLevel>('optimal')

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    // Once loaded, drop the share param so the URL reflects live edits rather than the imported snapshot.
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.has('team')) {
      url.searchParams.delete('team')
      window.history.replaceState({}, '', url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const teams = state[mode]

  const setTeamCount = useCallback(
    (count: number) => {
      setState((prev) => {
        const current = prev[mode]
        const next: ModeTeams = {
          ours: resizeTeams(current.ours, count),
          opponent: current.opponent.length > 0 ? resizeTeams(current.opponent, count) : current.opponent,
          bossIds: current.bossIds.length > 0 ? resizeBossIds(current.bossIds, count) : current.bossIds,
        }
        return { ...prev, [mode]: next }
      })
    },
    [mode],
  )

  const setBoss = useCallback(
    (teamIndex: number, bossId: string | null) => {
      setState((prev) => {
        const current = prev[mode]
        const padded = resizeBossIds(current.bossIds, Math.max(current.bossIds.length, teamIndex + 1))
        const bossIds = padded.map((id, i) => (i === teamIndex ? bossId : id))
        return { ...prev, [mode]: { ...current, bossIds } }
      })
    },
    [mode],
  )

  const assignHero = useCallback(
    (side: Side, teamIndex: number, slotIndex: number, heroId: string) => {
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
    [mode],
  )

  const clearSlot = useCallback(
    (side: Side, teamIndex: number, slotIndex: number) => {
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
    [mode],
  )

  const usedHeroIds = useMemo(() => {
    const used = new Set<string>()
    teams.ours.forEach((team) => team.forEach((id) => id && used.add(id)))
    teams.opponent.forEach((team) => team.forEach((id) => id && used.add(id)))
    return used
  }, [teams])

  const shareUrl = useCallback(() => {
    const code = encodeShare(mode, teams)
    const url = new URL(window.location.href)
    url.searchParams.set('team', code)
    return url.toString()
  }, [mode, teams])

  return {
    mode,
    setMode,
    investmentLevel,
    setInvestmentLevel,
    teams,
    setTeamCount,
    assignHero,
    clearSlot,
    setBoss,
    usedHeroIds,
    shareUrl,
  }
}

export type TeamBuilderStore = ReturnType<typeof useTeamBuilderState>

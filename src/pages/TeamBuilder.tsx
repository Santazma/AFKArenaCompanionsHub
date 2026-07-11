import { useEffect, useState } from 'react'
import HeroBrowser from '../components/teambuilder/HeroBrowser'
import InvestmentTabs from '../components/teambuilder/InvestmentTabs'
import ModeTabs from '../components/teambuilder/ModeTabs'
import ShareButton from '../components/teambuilder/ShareButton'
import TeamCountControl from '../components/teambuilder/TeamCountControl'
import TeamsBoard from '../components/teambuilder/TeamsBoard'
import { useTeamBuilderState } from '../hooks/useTeamBuilderState'
import { parseSlotKey, type ModeTeams, type SlotRef, type Team } from '../lib/teamBuilder'

type Pending = { type: 'hero'; heroId: string } | { type: 'slot'; ref: SlotRef } | null

function sameSlot(a: SlotRef, b: SlotRef) {
  return a.side === b.side && a.teamIndex === b.teamIndex && a.slotIndex === b.slotIndex
}

function getTeam(teams: ModeTeams, ref: SlotRef): Team | undefined {
  return ref.side === 'ours' ? teams.ours[ref.teamIndex] : teams.opponent[ref.teamIndex]
}

export default function TeamBuilder() {
  const store = useTeamBuilderState()
  const [pending, setPending] = useState<Pending>(null)

  useEffect(() => {
    setPending(null)
  }, [store.mode])

  const placeHero = (ref: SlotRef, heroId: string) => {
    const team = getTeam(store.teams, ref)
    if (team?.includes(heroId)) return
    store.assignHero(ref.side, ref.teamIndex, ref.slotIndex, heroId)
  }

  const moveOrSwap = (sourceRef: SlotRef, targetRef: SlotRef) => {
    if (sameSlot(sourceRef, targetRef)) return
    const sourceTeam = getTeam(store.teams, sourceRef)
    const targetTeam = getTeam(store.teams, targetRef)
    const sourceHero = sourceTeam?.[sourceRef.slotIndex] ?? null
    const targetHero = targetTeam?.[targetRef.slotIndex] ?? null
    if (!sourceHero) return

    const sameTeam = sourceRef.side === targetRef.side && sourceRef.teamIndex === targetRef.teamIndex
    if (!sameTeam) {
      if (targetTeam?.includes(sourceHero)) return
      if (targetHero && sourceTeam?.includes(targetHero)) return
    }

    store.assignHero(targetRef.side, targetRef.teamIndex, targetRef.slotIndex, sourceHero)
    if (targetHero) {
      store.assignHero(sourceRef.side, sourceRef.teamIndex, sourceRef.slotIndex, targetHero)
    } else {
      store.clearSlot(sourceRef.side, sourceRef.teamIndex, sourceRef.slotIndex)
    }
  }

  const handleSlotClick = (ref: SlotRef) => {
    if (pending?.type === 'hero') {
      placeHero(ref, pending.heroId)
      setPending(null)
      return
    }

    if (pending?.type === 'slot') {
      if (sameSlot(pending.ref, ref)) {
        setPending(null)
        return
      }
      moveOrSwap(pending.ref, ref)
      setPending(null)
      return
    }

    setPending({ type: 'slot', ref })
  }

  const handleSelectHero = (heroId: string) => {
    if (pending?.type === 'slot') {
      placeHero(pending.ref, heroId)
      setPending(null)
      return
    }
    setPending((prev) => (prev?.type === 'hero' && prev.heroId === heroId ? null : { type: 'hero', heroId }))
  }

  const handleDropHero = (targetRef: SlotRef, heroId: string, sourceSlotKey: string | null) => {
    const sourceRef = sourceSlotKey ? parseSlotKey(sourceSlotKey) : null
    if (sourceRef) {
      moveOrSwap(sourceRef, targetRef)
    } else {
      placeHero(targetRef, heroId)
    }
    setPending(null)
  }

  const handleRemoveHero = (ref: SlotRef) => {
    store.clearSlot(ref.side, ref.teamIndex, ref.slotIndex)
    setPending((prev) => (prev?.type === 'slot' && sameSlot(prev.ref, ref) ? null : prev))
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-12 pb-24 sm:px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <span className="mb-2 block font-body text-xs tracking-[0.3em] text-gold-300/70 uppercase">
            Team Builder
          </span>
          <h1 className="font-display text-3xl font-bold text-gold-300 sm:text-4xl">Build Your Comps</h1>
        </div>

        <ModeTabs mode={store.mode} onChange={store.setMode} />
        <InvestmentTabs level={store.investmentLevel} onChange={store.setInvestmentLevel} />

        <ShareButton getUrl={store.shareUrl} />
      </div>

      <TeamsBoard
        mode={store.mode}
        teams={store.teams}
        investmentLevel={store.investmentLevel}
        selectedSlot={pending?.type === 'slot' ? pending.ref : null}
        onSlotClick={handleSlotClick}
        onRemoveHero={handleRemoveHero}
        onDropHero={handleDropHero}
        onSelectBoss={store.setBoss}
      />

      <TeamCountControl count={store.teams.ours.length} onChange={store.setTeamCount} />

      <HeroBrowser
        mode={store.mode}
        investmentLevel={store.investmentLevel}
        selectedHeroId={pending?.type === 'hero' ? pending.heroId : null}
        onSelectHero={handleSelectHero}
      />
    </div>
  )
}

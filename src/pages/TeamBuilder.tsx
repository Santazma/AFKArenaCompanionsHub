import { useEffect, useState } from 'react'
import HeroBrowser from '../components/teambuilder/HeroBrowser'
import InvestmentTabs from '../components/teambuilder/InvestmentTabs'
import ModeTabs from '../components/teambuilder/ModeTabs'
import ShareButton from '../components/teambuilder/ShareButton'
import TeamCountControl from '../components/teambuilder/TeamCountControl'
import TeamsBoard from '../components/teambuilder/TeamsBoard'
import { useTeamBuilderState } from '../hooks/useTeamBuilderState'
import type { SlotRef } from '../lib/teamBuilder'

type Pending = { type: 'hero'; heroId: string } | { type: 'slot'; ref: SlotRef } | null

function sameSlot(a: SlotRef, b: SlotRef) {
  return a.side === b.side && a.teamIndex === b.teamIndex && a.slotIndex === b.slotIndex
}

export default function TeamBuilder() {
  const store = useTeamBuilderState()
  const [pending, setPending] = useState<Pending>(null)

  useEffect(() => {
    setPending(null)
  }, [store.mode])

  const placeHero = (ref: SlotRef, heroId: string) => {
    const team = ref.side === 'ours' ? store.teams.ours[ref.teamIndex] : store.teams.opponent[ref.teamIndex]
    if (team?.includes(heroId)) return
    store.assignHero(ref.side, ref.teamIndex, ref.slotIndex, heroId)
  }

  const handleSlotClick = (ref: SlotRef) => {
    const team = ref.side === 'ours' ? store.teams.ours[ref.teamIndex] : store.teams.opponent[ref.teamIndex]
    const heroId = team?.[ref.slotIndex]

    if (heroId) {
      store.clearSlot(ref.side, ref.teamIndex, ref.slotIndex)
      setPending(null)
      return
    }

    if (pending?.type === 'hero') {
      placeHero(ref, pending.heroId)
      setPending(null)
      return
    }

    setPending((prev) => (prev?.type === 'slot' && sameSlot(prev.ref, ref) ? null : { type: 'slot', ref }))
  }

  const handleSelectHero = (heroId: string) => {
    if (pending?.type === 'slot') {
      placeHero(pending.ref, heroId)
      setPending(null)
      return
    }
    setPending((prev) => (prev?.type === 'hero' && prev.heroId === heroId ? null : { type: 'hero', heroId }))
  }

  const handleDropHero = (ref: SlotRef, heroId: string) => {
    placeHero(ref, heroId)
    setPending(null)
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
        selectedSlot={pending?.type === 'slot' ? pending.ref : null}
        onSlotClick={handleSlotClick}
        onDropHero={handleDropHero}
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

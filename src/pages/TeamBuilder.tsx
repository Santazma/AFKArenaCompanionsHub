import { useEffect, useState } from 'react'
import HeroBrowser from '../components/teambuilder/HeroBrowser'
import InvestmentTabs from '../components/teambuilder/InvestmentTabs'
import ModeTabs from '../components/teambuilder/ModeTabs'
import ShareButton from '../components/teambuilder/ShareButton'
import TeamCountControl from '../components/teambuilder/TeamCountControl'
import TeamsBoard from '../components/teambuilder/TeamsBoard'
import { useTeamBuilderState } from '../hooks/useTeamBuilderState'
import type { SlotRef, Team, Side } from '../lib/teamBuilder'

function findFirstEmptySlot(team: Team | undefined, side: Side, teamIndex: number): SlotRef | null {
  if (!team) return null
  const slotIndex = team.findIndex((heroId) => heroId === null)
  return slotIndex === -1 ? null : { side, teamIndex, slotIndex }
}

export default function TeamBuilder() {
  const store = useTeamBuilderState()
  const [selectedSlot, setSelectedSlot] = useState<SlotRef | null>(null)

  useEffect(() => {
    setSelectedSlot(null)
  }, [store.mode])

  const handleSlotClick = (ref: SlotRef) => {
    const team = ref.side === 'ours' ? store.teams.ours[ref.teamIndex] : store.teams.opponent[ref.teamIndex]
    const heroId = team?.[ref.slotIndex]

    if (heroId) {
      store.clearSlot(ref.side, ref.teamIndex, ref.slotIndex)
      setSelectedSlot(null)
      return
    }

    setSelectedSlot((prev) =>
      prev && prev.side === ref.side && prev.teamIndex === ref.teamIndex && prev.slotIndex === ref.slotIndex
        ? null
        : ref,
    )
  }

  const handlePick = (heroId: string) => {
    const target = selectedSlot ?? findFirstEmptySlot(store.teams.ours[0], 'ours', 0)
    if (!target) return

    const targetTeam = target.side === 'ours' ? store.teams.ours[target.teamIndex] : store.teams.opponent[target.teamIndex]
    if (targetTeam?.includes(heroId)) return

    store.assignHero(target.side, target.teamIndex, target.slotIndex, heroId)

    const updatedTeam = targetTeam ? [...targetTeam] : []
    updatedTeam[target.slotIndex] = heroId
    setSelectedSlot(findFirstEmptySlot(updatedTeam, target.side, target.teamIndex))
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

      <TeamsBoard mode={store.mode} teams={store.teams} selectedSlot={selectedSlot} onSlotClick={handleSlotClick} />

      <TeamCountControl count={store.teams.ours.length} onChange={store.setTeamCount} />

      <HeroBrowser mode={store.mode} investmentLevel={store.investmentLevel} onPick={handlePick} />
    </div>
  )
}

import type { Ref } from 'react'
import { bossById } from '../../data/bosses'
import { heroById } from '../../data/heroes'
import {
  slotKey,
  type ContentMode,
  type InvestmentLevel,
  type ModeTeams,
  type SlotRef,
  type Team,
} from '../../lib/teamBuilder'
import type { RosterStore } from '../../hooks/useRoster'
import { resolveFrameUrl, investmentLabel } from '../../lib/heroFrame'
import BossSlot from './BossSlot'
import HeroSlot from './HeroSlot'

const FRONT_ROW_INDICES = [0, 1]
const BACK_ROW_INDICES = [2, 3, 4]

interface TeamsBoardProps {
  mode: ContentMode
  teams: ModeTeams
  investmentLevel: InvestmentLevel
  selectedSlot: SlotRef | null
  roster: RosterStore
  boardRef?: Ref<HTMLDivElement>
  onSlotClick: (ref: SlotRef) => void
  onRemoveHero: (ref: SlotRef) => void
  onDropHero: (ref: SlotRef, heroId: string, sourceSlotKey: string | null) => void
  onSelectBoss: (bossId: string) => void
}

function TeamPanel({
  label,
  team,
  side,
  teamIndex,
  mirrored = false,
  investmentLevel,
  selectedSlot,
  roster,
  onSlotClick,
  onRemoveHero,
  onDropHero,
}: {
  label: string
  team: Team
  side: SlotRef['side']
  teamIndex: number
  mirrored?: boolean
  investmentLevel: InvestmentLevel
  selectedSlot: SlotRef | null
  roster: RosterStore
  onSlotClick: (ref: SlotRef) => void
  onRemoveHero: (ref: SlotRef) => void
  onDropHero: (ref: SlotRef, heroId: string, sourceSlotKey: string | null) => void
}) {
  const renderColumn = (indices: number[]) => (
    <div className="flex flex-col justify-center gap-2">
      {indices.map((slotIndex) => {
        const ref: SlotRef = { side, teamIndex, slotIndex }
        const isSelected =
          selectedSlot?.side === side && selectedSlot.teamIndex === teamIndex && selectedSlot.slotIndex === slotIndex
        const heroId = team[slotIndex]
        const hero = heroId ? (heroById.get(heroId) ?? null) : null
        const ownership = hero ? roster.entry(hero.id) : null
        return (
          <HeroSlot
            key={slotIndex}
            hero={hero}
            selected={isSelected}
            slotKey={slotKey(ref)}
            frameUrl={hero ? resolveFrameUrl(hero, investmentLevel, ownership) : null}
            caption={hero ? investmentLabel(hero, investmentLevel, ownership) : undefined}
            owned={heroId ? roster.isOwned(heroId) : false}
            onClick={() => onSlotClick(ref)}
            onRemove={() => onRemoveHero(ref)}
            onDropHero={(droppedId, sourceSlotKey) => onDropHero(ref, droppedId, sourceSlotKey)}
          />
        )
      })}
    </div>
  )

  return (
    <div className="flex-1 rounded-2xl border border-border bg-surface/70 p-4">
      <h3 className="mb-3 text-center font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">
        {label}
      </h3>
      <div className={`flex items-center justify-center gap-3 ${mirrored ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col items-center gap-2">
          <span className="font-body text-[10px] tracking-[0.2em] text-gold-100/30 uppercase">Back</span>
          {renderColumn(BACK_ROW_INDICES)}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-body text-[10px] tracking-[0.2em] text-gold-100/30 uppercase">Front</span>
          {renderColumn(FRONT_ROW_INDICES)}
        </div>
      </div>
    </div>
  )
}

function VersusDivider() {
  return (
    <div className="flex items-center justify-center sm:flex-col">
      <div className="hidden h-10 w-px bg-gradient-to-b from-transparent to-red-500/40 sm:block" />
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/50 bg-red-950/40 font-display text-xs font-bold text-red-300 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
        VS
      </span>
      <div className="hidden h-10 w-px bg-gradient-to-t from-transparent to-red-500/40 sm:block" />
    </div>
  )
}

export default function TeamsBoard({
  mode,
  teams,
  investmentLevel,
  selectedSlot,
  roster,
  boardRef,
  onSlotClick,
  onRemoveHero,
  onDropHero,
  onSelectBoss,
}: TeamsBoardProps) {
  const isBossMode = mode !== 'arena'
  const boss = teams.bossId ? (bossById.get(teams.bossId) ?? null) : null

  return (
    <div ref={boardRef} className="flex flex-col gap-6 rounded-2xl bg-void/20 p-1">
      {teams.ours.map((team, teamIndex) => (
        <div key={teamIndex} className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <TeamPanel
            label={`Team ${teamIndex + 1} — Our Team`}
            team={team}
            side="ours"
            teamIndex={teamIndex}
            investmentLevel={investmentLevel}
            selectedSlot={selectedSlot}
            roster={roster}
            onSlotClick={onSlotClick}
            onRemoveHero={onRemoveHero}
            onDropHero={onDropHero}
          />

          {isBossMode ? (
            <>
              <VersusDivider />
              <BossSlot mode={mode} boss={boss} onSelectBoss={onSelectBoss} />
            </>
          ) : (
            <>
              <VersusDivider />
              <TeamPanel
                label={`Team ${teamIndex + 1} — Opponent`}
                team={teams.opponent[teamIndex] ?? []}
                side="opponent"
                teamIndex={teamIndex}
                mirrored
                investmentLevel={investmentLevel}
                selectedSlot={selectedSlot}
                roster={roster}
                onSlotClick={onSlotClick}
                onRemoveHero={onRemoveHero}
                onDropHero={onDropHero}
              />
            </>
          )}
        </div>
      ))}
    </div>
  )
}

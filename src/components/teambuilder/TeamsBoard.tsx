import { heroById } from '../../data/heroes'
import { bossLabelFor, slotKey, type ContentMode, type ModeTeams, type SlotRef, type Team } from '../../lib/teamBuilder'
import HeroSlot from './HeroSlot'

const FRONT_ROW_INDICES = [0, 1]
const BACK_ROW_INDICES = [2, 3, 4]

interface TeamsBoardProps {
  mode: ContentMode
  teams: ModeTeams
  selectedSlot: SlotRef | null
  onSlotClick: (ref: SlotRef) => void
  onRemoveHero: (ref: SlotRef) => void
  onDropHero: (ref: SlotRef, heroId: string, sourceSlotKey: string | null) => void
}

function TeamPanel({
  label,
  team,
  side,
  teamIndex,
  mirrored = false,
  selectedSlot,
  onSlotClick,
  onRemoveHero,
  onDropHero,
}: {
  label: string
  team: Team
  side: SlotRef['side']
  teamIndex: number
  mirrored?: boolean
  selectedSlot: SlotRef | null
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
        return (
          <HeroSlot
            key={slotIndex}
            hero={heroId ? (heroById.get(heroId) ?? null) : null}
            selected={isSelected}
            slotKey={slotKey(ref)}
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

function BossCard({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-arcane-700/50 bg-void/40 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-arcane-500 bg-arcane-700/20 font-body text-3xl font-bold text-arcane-300">
        !
      </div>
      <span className="font-body text-sm font-medium text-gold-100/70">{label}</span>
    </div>
  )
}

export default function TeamsBoard({ mode, teams, selectedSlot, onSlotClick, onRemoveHero, onDropHero }: TeamsBoardProps) {
  const bossLabel = bossLabelFor(mode)

  return (
    <div className="flex flex-col gap-6">
      {teams.ours.map((team, teamIndex) => (
        <div key={teamIndex} className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start">
          <TeamPanel
            label={`Team ${teamIndex + 1} — Our Team`}
            team={team}
            side="ours"
            teamIndex={teamIndex}
            selectedSlot={selectedSlot}
            onSlotClick={onSlotClick}
            onRemoveHero={onRemoveHero}
            onDropHero={onDropHero}
          />

          {bossLabel ? (
            <BossCard label={bossLabel} />
          ) : (
            <TeamPanel
              label={`Team ${teamIndex + 1} — Opponent`}
              team={teams.opponent[teamIndex] ?? []}
              side="opponent"
              teamIndex={teamIndex}
              mirrored
              selectedSlot={selectedSlot}
              onSlotClick={onSlotClick}
              onRemoveHero={onRemoveHero}
              onDropHero={onDropHero}
            />
          )}
        </div>
      ))}
    </div>
  )
}

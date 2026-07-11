import { heroById } from '../../data/heroes'
import { bossLabelFor, type ContentMode, type ModeTeams, type SlotRef, type Team } from '../../lib/teamBuilder'
import HeroSlot from './HeroSlot'

interface TeamsBoardProps {
  mode: ContentMode
  teams: ModeTeams
  selectedSlot: SlotRef | null
  onSlotClick: (ref: SlotRef) => void
}

function TeamPanel({
  label,
  team,
  side,
  teamIndex,
  selectedSlot,
  onSlotClick,
}: {
  label: string
  team: Team
  side: SlotRef['side']
  teamIndex: number
  selectedSlot: SlotRef | null
  onSlotClick: (ref: SlotRef) => void
}) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-surface/70 p-4">
      <h3 className="mb-3 font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">{label}</h3>
      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {team.map((heroId, slotIndex) => {
          const ref: SlotRef = { side, teamIndex, slotIndex }
          const isSelected =
            selectedSlot?.side === side && selectedSlot.teamIndex === teamIndex && selectedSlot.slotIndex === slotIndex
          return (
            <HeroSlot
              key={slotIndex}
              hero={heroId ? (heroById.get(heroId) ?? null) : null}
              selected={isSelected}
              onClick={() => onSlotClick(ref)}
            />
          )
        })}
      </div>
    </div>
  )
}

function BossCard({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-arcane-700/50 bg-void/40 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-arcane-500 bg-arcane-700/20 font-display text-3xl text-arcane-300">
        !
      </div>
      <span className="font-body text-sm font-medium text-gold-100/70">{label}</span>
    </div>
  )
}

export default function TeamsBoard({ mode, teams, selectedSlot, onSlotClick }: TeamsBoardProps) {
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
          />

          {bossLabel ? (
            <BossCard label={bossLabel} />
          ) : (
            <TeamPanel
              label={`Team ${teamIndex + 1} — Opponent`}
              team={teams.opponent[teamIndex] ?? []}
              side="opponent"
              teamIndex={teamIndex}
              selectedSlot={selectedSlot}
              onSlotClick={onSlotClick}
            />
          )}
        </div>
      ))}
    </div>
  )
}

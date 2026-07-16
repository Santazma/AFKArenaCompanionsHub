import type { Ref } from 'react'
import { bossById } from '../../data/bosses'
import { heroById } from '../../data/heroes'
import type { RosterStore } from '../../hooks/useRoster'
import { investmentLabel, resolveFrameUrl } from '../../lib/heroFrame'
import { CONTENT_MODES, type ContentMode, type InvestmentLevel, type ModeTeams, type Team } from '../../lib/teamBuilder'
import { CONTENT_AUTHOR } from '../../lib/externalLinks'
import FactionBadge from './FactionBadge'
import HeroAvatar from './HeroAvatar'

// Off-screen, fixed-width, read-only rendering of the current mode's teams,
// captured to PNG. It exists so the exported image is high-resolution and
// nicely laid out (teams in a 2-up grid) regardless of the on-screen viewport —
// on a phone the live board is a cramped single column, which made shared
// screenshots look tiny and low-res.

// In-game formation, top to bottom: 3 back, then 2 front.
const BACK_ROW = [2, 3, 4]
const FRONT_ROW = [0, 1]

function ExportSlot({
  heroId,
  investmentLevel,
  roster,
}: {
  heroId: string | null
  investmentLevel: InvestmentLevel
  roster: RosterStore
}) {
  const hero = heroId ? (heroById.get(heroId) ?? null) : null
  if (!hero) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-border/50 font-body text-2xl text-gold-100/20">
        +
      </div>
    )
  }
  const ownership = roster.entry(hero.id)
  const frameUrl = resolveFrameUrl(hero, investmentLevel, ownership)
  const caption = investmentLabel(hero, investmentLevel, ownership)
  return (
    <div className="flex w-24 flex-col items-center gap-1">
      <div className="relative">
        <HeroAvatar hero={hero} size="lg" frameUrl={frameUrl} hideRemoteImage />
        <FactionBadge faction={hero.faction} size="xs" className="absolute -top-1 -left-1" />
      </div>
      <span className="w-full truncate text-center font-body text-[11px] text-gold-100/85">{hero.name}</span>
      <span className="w-full truncate text-center font-body text-[10px] text-gold-100/45">{caption || '—'}</span>
    </div>
  )
}

function ExportTeamPanel({
  label,
  team,
  investmentLevel,
  roster,
}: {
  label: string
  team: Team
  investmentLevel: InvestmentLevel
  roster: RosterStore
}) {
  const row = (indices: number[]) => (
    <div className="flex justify-center gap-3">
      {indices.map((i) => (
        <ExportSlot key={i} heroId={team[i] ?? null} investmentLevel={investmentLevel} roster={roster} />
      ))}
    </div>
  )
  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-4">
      <h4 className="mb-3 text-center font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">
        {label}
      </h4>
      <div className="flex flex-col items-center gap-3">
        {row(BACK_ROW)}
        {row(FRONT_ROW)}
      </div>
    </div>
  )
}

interface ExportBoardProps {
  mode: ContentMode
  teams: ModeTeams
  investmentLevel: InvestmentLevel
  roster: RosterStore
  profileName: string
  boardRef?: Ref<HTMLDivElement>
}

export default function ExportBoard({ mode, teams, investmentLevel, roster, profileName, boardRef }: ExportBoardProps) {
  const isArena = mode === 'arena'
  const modeLabel = CONTENT_MODES.find((m) => m.id === mode)?.label ?? mode
  const boss = teams.bossId ? (bossById.get(teams.bossId) ?? null) : null

  // Only render teams that actually have heroes, so the image stays tidy. Fall
  // back to all teams if somehow none qualify (shouldn't happen — export is
  // gated on hasTeams).
  const indices = teams.ours.map((_, i) => i)
  const filled = indices.filter((i) => teams.ours[i].some(Boolean) || teams.opponent[i]?.some(Boolean))
  const shown = filled.length ? filled : indices

  return (
    <div ref={boardRef} className="w-[900px] bg-void p-8 text-gold-100">
      <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-4">
        <div>
          <div className="font-body text-[11px] tracking-[0.3em] text-gold-300/70 uppercase">
            AFK Arena Companions Hub
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-gold-300">{modeLabel}</div>
          <div className="mt-0.5 font-body text-sm text-gold-100/60">{profileName}</div>
        </div>
        {boss && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-body text-[10px] tracking-[0.2em] text-red-300/60 uppercase">Boss</div>
              <div className="font-display text-xl font-bold text-gold-100">{boss.name}</div>
            </div>
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-red-500/50">
              {boss.image ? (
                <img
                  src={boss.image}
                  alt={boss.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl text-red-300">
                  ☠
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {shown.map((i) =>
          isArena ? (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-void/30 p-2">
              <ExportTeamPanel
                label={`Team ${i + 1} — Ours`}
                team={teams.ours[i]}
                investmentLevel={investmentLevel}
                roster={roster}
              />
              <div className="flex items-center justify-center">
                <span className="rounded-full border border-red-500/50 bg-red-950/40 px-3 py-0.5 font-display text-[11px] font-bold text-red-300">
                  VS
                </span>
              </div>
              <ExportTeamPanel
                label={`Team ${i + 1} — Opponent`}
                team={teams.opponent[i] ?? []}
                investmentLevel={investmentLevel}
                roster={roster}
              />
            </div>
          ) : (
            <ExportTeamPanel
              key={i}
              label={`Team ${i + 1}`}
              team={teams.ours[i]}
              investmentLevel={investmentLevel}
              roster={roster}
            />
          ),
        )}
      </div>

      <div className="mt-6 text-center font-body text-[10px] text-gold-100/35">
        Made with AFK Arena Companions Hub · Tier list &amp; guides by {CONTENT_AUTHOR}
      </div>
    </div>
  )
}

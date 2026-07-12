import { useState } from 'react'
import { bossesForMode, type Boss } from '../../data/bosses'
import type { ContentMode } from '../../lib/teamBuilder'

interface BossSlotProps {
  mode: ContentMode
  boss: Boss | null
  onSelectBoss: (bossId: string) => void
}

function BossThumb({ boss }: { boss: Boss }) {
  return boss.image ? (
    <img
      src={boss.image}
      alt={boss.name}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center font-display text-2xl text-arcane-300">?</div>
  )
}

const MODE_LABEL: Record<string, string> = {
  dreamRealm: 'Dream Realm',
  guildHunt: 'Guild Hunt',
}

export default function BossSlot({ mode, boss, onSelectBoss }: BossSlotProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const options = bossesForMode(mode)

  if (pickerOpen) {
    return (
      <div className="flex h-[22.5rem] flex-1 flex-col rounded-2xl border border-red-500/30 bg-void/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-body text-xs font-semibold tracking-[0.15em] text-red-300/70 uppercase">
            Choose a boss
          </span>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            aria-label="Close"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-gold-100/60 hover:border-red-400 hover:text-red-400"
          >
            ×
          </button>
        </div>
        <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onSelectBoss(option.id)
                setPickerOpen(false)
              }}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors ${
                boss?.id === option.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-border bg-surface/60 hover:border-red-500/50'
              }`}
            >
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-red-500/40">
                <BossThumb boss={option} />
              </div>
              <span className="font-body text-[11px] text-gold-100/80">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPickerOpen(true)}
      title={boss ? `${boss.name} — click to change` : 'Click to choose a boss'}
      className="group relative flex h-[22.5rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/30 via-void/60 to-void transition-colors hover:border-red-500/60"
    >
      {/* battlefield glow */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/20 blur-3xl" />
      </div>

      <span className="relative mb-1 font-body text-[10px] font-semibold tracking-[0.25em] text-red-300/60 uppercase">
        {MODE_LABEL[mode] ?? 'Boss'} · Enemy
      </span>

      {boss ? (
        <>
          <div className="relative flex items-center justify-center">
            {/* rotating arcane ring */}
            <div className="absolute h-40 w-40 rounded-full border border-red-500/20" />
            <div className="absolute h-44 w-44 rounded-full border border-red-500/10" />
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-red-500/50 shadow-[0_0_35px_rgba(220,38,38,0.35)] transition-transform duration-300 group-hover:scale-105">
              <BossThumb boss={boss} />
            </div>
          </div>
          {/* name plate */}
          <div className="relative mt-5 flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/40 px-5 py-1.5">
            <span className="text-red-400">☠</span>
            <span className="font-display text-lg font-bold text-gold-100">{boss.name}</span>
          </div>
          <span className="relative mt-2 font-body text-[11px] text-gold-100/40">Tap to change boss</span>
        </>
      ) : (
        <div className="relative flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-red-500/40 bg-red-950/20 font-display text-4xl font-bold text-red-300/70">
            ☠
          </div>
          <span className="font-body text-sm font-medium text-gold-100/70">Select a boss</span>
        </div>
      )}
    </button>
  )
}

import { useState } from 'react'
import { bossesForMode, type Boss } from '../../data/bosses'
import type { ContentMode } from '../../lib/teamBuilder'

interface BossSlotProps {
  mode: ContentMode
  boss: Boss | null
  onSelectBoss: (bossId: string) => void
}

function BossThumb({ boss, fit = 'cover' }: { boss: Boss; fit?: 'cover' | 'contain' }) {
  return boss.image ? (
    <img
      src={boss.image}
      alt={boss.name}
      referrerPolicy="no-referrer"
      className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center font-display text-2xl text-arcane-300">?</div>
  )
}

export default function BossSlot({ mode, boss, onSelectBoss }: BossSlotProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const options = bossesForMode(mode)

  if (pickerOpen) {
    return (
      <div className="flex h-[22.5rem] flex-1 flex-col rounded-2xl border border-arcane-700/50 bg-void/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-body text-xs font-semibold tracking-[0.15em] text-gold-100/60 uppercase">
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
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-border bg-surface/60 hover:border-gold-500/50'
              }`}
            >
              <div className="h-16 w-16 overflow-hidden rounded-md border-2 border-arcane-500/60">
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
      className="flex h-[22.5rem] flex-1 flex-col overflow-hidden rounded-2xl border border-arcane-700/50 bg-void/40 transition-colors hover:border-arcane-500"
    >
      {boss ? (
        <>
          <div className="min-h-0 flex-1">
            <BossThumb boss={boss} fit="contain" />
          </div>
          <span className="py-2 font-body text-sm font-medium text-gold-100/80">{boss.name}</span>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-arcane-500 bg-arcane-700/20 font-body text-3xl font-bold text-arcane-300">
            !
          </div>
          <span className="font-body text-sm font-medium text-gold-100/70">Select a boss</span>
        </div>
      )}
    </button>
  )
}

import { CONTENT_MODES, type ContentMode } from '../../lib/teamBuilder'

interface ModeTabsProps {
  mode: ContentMode
  onChange: (mode: ContentMode) => void
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Content mode">
      {CONTENT_MODES.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={mode === option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-full border px-5 py-2 font-body text-sm font-medium transition-colors ${
            mode === option.id
              ? 'border-gold-500 bg-gold-500/15 text-gold-300'
              : 'border-border text-gold-100/70 hover:border-gold-500/50 hover:text-gold-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

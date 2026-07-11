import { INVESTMENT_LEVELS, type InvestmentLevel } from '../../lib/teamBuilder'

interface InvestmentTabsProps {
  level: InvestmentLevel
  onChange: (level: InvestmentLevel) => void
}

export default function InvestmentTabs({ level, onChange }: InvestmentTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="font-body text-xs tracking-[0.2em] text-gold-100/50 uppercase">Investment</span>
      <div className="flex gap-1 rounded-full border border-border/60 bg-surface/60 p-1">
        {INVESTMENT_LEVELS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full px-3 py-1 font-body text-xs font-medium transition-colors ${
              level === option.id ? 'bg-arcane-500/25 text-arcane-300' : 'text-gold-100/60 hover:text-gold-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

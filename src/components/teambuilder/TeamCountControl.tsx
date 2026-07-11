import { MAX_TEAMS, MIN_TEAMS } from '../../lib/teamBuilder'

interface TeamCountControlProps {
  count: number
  onChange: (count: number) => void
}

export default function TeamCountControl({ count, onChange }: TeamCountControlProps) {
  const options = Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, i) => MIN_TEAMS + i)

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-body text-xs tracking-[0.2em] text-gold-100/50 uppercase">Number of teams</span>
      <div className="flex gap-1 rounded-full border border-border/60 bg-surface/60 p-1">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-full font-body text-sm font-medium transition-colors ${
              count === n ? 'bg-gold-500/20 text-gold-300' : 'text-gold-100/60 hover:text-gold-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

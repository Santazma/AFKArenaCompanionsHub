import { useState } from 'react'
import type { Hero } from '../../data/heroes'
import { FACTION_COLORS } from '../../data/heroes'
import type { InvestmentLevel } from '../../lib/teamBuilder'
import { heroFrameUrl } from '../../lib/heroFrame'

function initials(name: string): string {
  const words = name.split(/[\s&]+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// Slightly larger than before, per request — the framed art also needs the
// extra room since the decorative border eats into the perimeter.
const SIZE_CLASSES = {
  sm: 'h-14 w-14 text-xs',
  md: 'h-20 w-20 text-sm',
  lg: 'h-24 w-24 text-base',
}

interface HeroAvatarProps {
  hero: Hero
  size?: keyof typeof SIZE_CLASSES
  className?: string
  // When provided, the avatar renders floofpire's pre-framed icon matching the
  // hero's recommended investment at this level (ascension tier + stars + SI).
  investmentLevel?: InvestmentLevel
}

export default function HeroAvatar({ hero, size = 'md', className = '', investmentLevel }: HeroAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const [frameFailed, setFrameFailed] = useState(false)

  const frameUrl = investmentLevel && !frameFailed ? heroFrameUrl(hero, investmentLevel) : null

  // Framed icons are self-contained (art + border baked in) and sit on a
  // transparent field, so we drop the faction ring/background and just contain.
  if (frameUrl) {
    return (
      <div className={`flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]} ${className}`} title={hero.name}>
        <img
          src={frameUrl}
          alt={hero.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full scale-110 object-contain"
          onError={() => setFrameFailed(true)}
        />
      </div>
    )
  }

  const color = FACTION_COLORS[hero.faction]
  const showImage = hero.image && !imageFailed

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border-2 font-body font-bold ${SIZE_CLASSES[size]} ${className}`}
      style={{
        borderColor: color,
        background: `radial-gradient(circle at 30% 20%, ${color}55, ${color}1a)`,
        color,
      }}
      title={hero.name}
    >
      {showImage ? (
        <img
          src={hero.image!}
          alt={hero.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials(hero.name)
      )}
    </div>
  )
}

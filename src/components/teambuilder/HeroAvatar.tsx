import { useState } from 'react'
import type { Hero } from '../../data/heroes'
import { FACTION_COLORS } from '../../data/heroes'

function initials(name: string): string {
  const words = name.split(/[\s&]+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

const SIZE_CLASSES = {
  sm: 'h-12 w-12 text-xs',
  md: 'h-16 w-16 text-sm',
  lg: 'h-20 w-20 text-base',
}

interface HeroAvatarProps {
  hero: Hero
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export default function HeroAvatar({ hero, size = 'md', className = '' }: HeroAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
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
          className="h-full w-full object-cover object-top"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials(hero.name)
      )}
    </div>
  )
}

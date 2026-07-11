import { Link } from 'react-router-dom'
import GradientText from '../reactbits/GradientText/GradientText'
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard'
import { GUIDE_URL, TIER_LIST_URL } from '../lib/externalLinks'

interface Section {
  title: string
  description: string
  cta: string
  spotlightColor: string
  to?: string
  href?: string
}

const sections: Section[] = [
  {
    href: TIER_LIST_URL,
    title: 'Tier List',
    description: 'Ranked heroes for Arena, Dream Realm, Guild Hunt and more, updated for the current meta.',
    cta: 'View rankings',
    spotlightColor: 'rgba(226, 181, 60, 0.25)',
  },
  {
    href: GUIDE_URL,
    title: 'Guide',
    description: 'Beginner to advanced strategy: hero progression, resonating hall priorities, and game-mode tips.',
    cta: 'Read guides',
    spotlightColor: 'rgba(157, 92, 255, 0.25)',
  },
  {
    to: '/team-builder',
    title: 'Team Builder',
    description: 'Put together and share comps for Arena, Dream Realm, and Guild Hunt.',
    cta: 'Build a team',
    spotlightColor: 'rgba(82, 39, 255, 0.25)',
  },
]

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-20 pb-24 text-center">
      <span className="mb-4 font-body text-xs tracking-[0.3em] text-gold-300/70 uppercase">
        Companion Hub
      </span>

      <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
        <GradientText colors={['#e2b53c', '#f4d67f', '#c9a8ff', '#e2b53c']} animationSpeed={10}>
          AFK Arena Companions Hub
        </GradientText>
      </h1>

      <p className="mt-6 max-w-2xl font-body text-base text-gold-100/70 sm:text-lg">
        Everything you need to build stronger teams: hero tier lists, in-depth guides, and an
        interactive team builder for every game mode.
      </p>

      <div className="mt-16 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const card = (
            <SpotlightCard
              spotlightColor={section.spotlightColor}
              className="flex h-full flex-col gap-4 !border-border !bg-surface/80 transition-transform duration-300 group-hover:-translate-y-1"
            >
              <h2 className="font-display text-2xl font-bold text-gold-300">
                {section.title}
              </h2>
              <p className="flex-1 font-body text-sm text-gold-100/70">{section.description}</p>
              <span className="font-body text-sm font-medium text-arcane-300 transition-colors group-hover:text-gold-300">
                {section.cta} &rarr;
              </span>
            </SpotlightCard>
          )

          return section.href ? (
            <a
              key={section.title}
              href={section.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block text-left"
            >
              {card}
            </a>
          ) : (
            <Link key={section.title} to={section.to!} className="group block text-left">
              {card}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard'

interface PlaceholderPageProps {
  eyebrow: string
  title: string
  description: string
}

export default function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-24 text-center">
      <span className="mb-4 font-body text-xs tracking-[0.3em] text-gold-300/70 uppercase">
        {eyebrow}
      </span>
      <h1 className="font-display text-3xl font-bold text-gold-300 sm:text-4xl">{title}</h1>

      <SpotlightCard className="mt-10 w-full !border-border !bg-surface/80">
        <p className="font-body text-base text-gold-100/70">{description}</p>
        <p className="mt-4 font-body text-sm text-arcane-300">Under construction &mdash; check back soon.</p>
      </SpotlightCard>

      <Link
        to="/"
        className="mt-10 font-body text-sm text-gold-100/60 transition-colors hover:text-gold-300"
      >
        &larr; Back to home
      </Link>
    </div>
  )
}

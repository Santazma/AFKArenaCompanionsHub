import { Link } from 'react-router-dom'
import GradientText from '../reactbits/GradientText/GradientText'
import {
  AUTHOR_LEGAL_URL,
  AUTHOR_SITE_URL,
  CONTENT_AUTHOR,
  GUIDE_URL,
  TIER_LIST_URL,
} from '../lib/externalLinks'

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-arcane-300 underline-offset-2 hover:underline"
    >
      {children}
    </a>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold text-gold-300">{title}</h2>
      <div className="mt-3 space-y-3 font-body text-sm leading-relaxed text-gold-100/70">{children}</div>
    </section>
  )
}

export default function Legal() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 pb-24">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        <GradientText colors={['#e2b53c', '#f4d67f', '#c9a8ff', '#e2b53c']} animationSpeed={10}>
          Legal &amp; Credits
        </GradientText>
      </h1>
      <p className="mt-4 font-body text-sm text-gold-100/60">
        A fan-made, non-profit companion hub for AFK Arena: Companions players. Please read how content and
        ownership work here.
      </p>

      <Section title="Unofficial fan project">
        <p>
          This site is an unofficial, fan-made project. It is <strong>not</strong> operated by, endorsed by,
          sponsored by, or affiliated with Lilith Games in any way. &ldquo;AFK Arena&rdquo;, &ldquo;AFK Arena:
          Companions&rdquo;, Lilith Games, and all related names, logos, characters, artwork, screenshots, and
          trademarks are the property of their respective owners.
        </p>
      </Section>

      <Section title="Non-commercial">
        <p>
          This hub exists purely for personal use and to share with a small circle of guildmates. It is
          non-commercial: there are no ads, no paywalls, nothing is sold, and it generates no revenue. Game
          visuals are used in a limited way for informational and community purposes only.
        </p>
      </Section>

      <Section title="Tier List &amp; Guides — created by SaiLus">
        <p>
          The <strong>Tier List</strong> and the <strong>Guide</strong> are <strong>not</strong> our content.
          They are created, maintained, and hosted by <strong>{CONTENT_AUTHOR}</strong>. This hub does not copy,
          mirror, or reproduce them — it only <strong>links out</strong> to the original sources:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Tier List → <ExternalLink href={TIER_LIST_URL}>{CONTENT_AUTHOR}&rsquo;s tier list spreadsheet</ExternalLink>
          </li>
          <li>
            Guide → <ExternalLink href={GUIDE_URL}>{CONTENT_AUTHOR}&rsquo;s guide site</ExternalLink> (
            <ExternalLink href={AUTHOR_SITE_URL}>{AUTHOR_SITE_URL.replace('https://', '')}</ExternalLink>)
          </li>
        </ul>
        <p>
          All credit for that work belongs to {CONTENT_AUTHOR}. You can read their own terms on their{' '}
          <ExternalLink href={AUTHOR_LEGAL_URL}>legal page</ExternalLink>. If {CONTENT_AUTHOR} would prefer these
          links be removed, they will be taken down promptly on request.
        </p>
      </Section>

      <Section title="Team Builder — original work">
        <p>
          The <strong>Team Builder</strong> is the only tool built for this hub. It uses hero and mode data
          derived from the community tier list, but the tool itself is original to this project.
        </p>
      </Section>

      <Section title="Game assets">
        <p>
          Hero icons, boss art, and faction emblems are property of Lilith Games and are used in a limited,
          transformative way for a non-commercial fan project. Framed hero icons are served from a
          community-maintained image CDN; other imagery is sourced from community wikis. No attempt is made to
          replicate or replace the official game or any official service.
        </p>
      </Section>

      <Section title="Your data &amp; privacy">
        <p>
          There are no accounts and no backend server. Everything you create — your roster, saved teams, and
          profiles — is stored <strong>locally in your own browser</strong> (localStorage) and never sent to us
          or anyone else. Share codes are generated on your device and only leave your browser if you choose to
          share them. Clearing your browser data clears everything.
        </p>
      </Section>

      <Section title="External links">
        <p>
          This site links to third-party sites (the tier list, guides, and image sources). We are not
          responsible for the content, availability, or privacy practices of those external sites.
        </p>
      </Section>

      <Section title="Contact &amp; takedown">
        <p>
          This is a small hobby project made in good faith. If you are a content owner and want an attribution
          corrected or a link removed, that will be honored promptly.
        </p>
      </Section>

      <div className="mt-12 border-t border-border/60 pt-6">
        <Link to="/" className="font-body text-sm text-arcane-300 underline-offset-2 hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}

import { Link, Outlet } from 'react-router-dom'
import Aurora from '../reactbits/Aurora/Aurora'
import NavBar from './NavBar'
import { CONTENT_AUTHOR } from '../lib/externalLinks'

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void text-gold-100">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
        <Aurora colorStops={['#5227FF', '#e2b53c', '#9d5cff']} amplitude={0.9} blend={0.55} speed={0.6} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border/60 px-6 py-8 text-center text-xs text-gold-100/50">
          <p>Fan-made, non-profit hub for AFK Arena players. Not affiliated with Lilith Games.</p>
          <p className="mt-2">
            Tier List &amp; Guides by <span className="text-gold-100/70">{CONTENT_AUTHOR}</span>
            <span className="mx-2 text-gold-100/30">·</span>
            <Link to="/legal" className="text-arcane-300 underline-offset-2 hover:underline">
              Credits &amp; Legal
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}

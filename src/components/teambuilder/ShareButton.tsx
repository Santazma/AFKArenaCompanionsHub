import { useState } from 'react'

interface ShareButtonProps {
  getUrl: () => string
}

export default function ShareButton({ getUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = getUrl()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url)
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 rounded-full border border-gold-500/60 bg-gold-500/10 px-5 py-2 font-body text-sm font-medium text-gold-300 transition-colors hover:bg-gold-500/20"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path strokeLinecap="round" d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
      </svg>
      {copied ? 'Link copied!' : 'Share'}
    </button>
  )
}

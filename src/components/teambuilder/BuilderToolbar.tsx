import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface BuilderToolbarProps {
  canUndo: boolean
  hasTeams: boolean
  exporting: boolean
  onUndo: () => void
  onClear: () => void
  onExport: () => void
  shareUrl: () => string
  shareCode: () => string
  summary: () => string
  onImport: (code: string) => boolean
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    window.prompt('Copy this:', text)
    return false
  }
}

const btnBase =
  'flex items-center gap-1.5 rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

export default function BuilderToolbar({
  canUndo,
  hasTeams,
  exporting,
  onUndo,
  onClear,
  onExport,
  shareUrl,
  shareCode,
  summary,
  onImport,
}: BuilderToolbarProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState(false)

  const flashMsg = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 1800)
  }

  const handleImport = () => {
    if (!importText.trim()) return
    const ok = onImport(importText)
    if (ok) {
      setImportText('')
      setImportError(false)
      setImportOpen(false)
      flashMsg('Build imported!')
    } else {
      setImportError(true)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`${btnBase} border-border bg-void/60 text-gold-100/70 enabled:hover:border-gold-500/50`}
        title="Undo last change"
      >
        <span aria-hidden>↶</span> Undo
      </button>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasTeams}
        className={`${btnBase} border-border bg-void/60 text-gold-100/70 enabled:hover:border-red-400 enabled:hover:text-red-300`}
        title="Clear every slot in this mode"
      >
        <span aria-hidden>🗑</span> Clear
      </button>

      <button
        type="button"
        onClick={onExport}
        disabled={!hasTeams || exporting}
        className={`${btnBase} border-arcane-500/50 bg-arcane-500/10 text-arcane-300 enabled:hover:bg-arcane-500/20`}
        title="Download this board as a PNG image"
      >
        <span aria-hidden>{exporting ? '⏳' : '🖼'}</span> {exporting ? 'Exporting…' : 'Export PNG'}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          className={`${btnBase} border-gold-500/60 bg-gold-500/10 text-gold-300 hover:bg-gold-500/20`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path strokeLinecap="round" d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
          </svg>
          Share
        </button>

        <AnimatePresence>
          {shareOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShareOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 z-40 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-border bg-surface p-4 text-left shadow-2xl"
              >
                <p className="mb-2 font-body text-[11px] font-semibold tracking-[0.15em] text-gold-100/50 uppercase">
                  Share your build
                </p>
                <p className="mb-3 font-body text-[11px] text-gold-100/50">
                  One link carries all three modes. Anyone who opens it loads your exact teams.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={async () => flashMsg((await copy(shareUrl())) ? 'Link copied!' : 'Copy failed')}
                    className="rounded-lg border border-gold-500/50 bg-gold-500/10 px-3 py-2 font-body text-sm font-medium text-gold-300 hover:bg-gold-500/20"
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={async () => flashMsg((await copy(shareCode())) ? 'Code copied!' : 'Copy failed')}
                    className="rounded-lg border border-border bg-void/60 px-3 py-2 font-body text-sm font-medium text-gold-100/80 hover:border-gold-500/50"
                  >
                    Copy code
                  </button>
                  <button
                    type="button"
                    onClick={async () => flashMsg((await copy(summary())) ? 'Summary copied!' : 'Copy failed')}
                    className="rounded-lg border border-border bg-void/60 px-3 py-2 font-body text-sm font-medium text-gold-100/80 hover:border-gold-500/50"
                  >
                    Copy text summary
                  </button>
                </div>
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-border/60 bg-void/50 p-2 font-body text-[10px] whitespace-pre-wrap text-gold-100/60">
                  {summary()}
                </pre>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className={`${btnBase} border-border bg-void/60 text-gold-100/70 hover:border-arcane-500/50 hover:text-arcane-300`}
          title="Load a build from a code"
        >
          <span aria-hidden>↧</span> Import Team
        </button>

        <AnimatePresence>
          {importOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setImportOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 z-40 mt-2 w-72 -translate-x-1/2 rounded-2xl border border-border bg-surface p-4 text-left shadow-2xl"
              >
                <p className="mb-2 font-body text-[11px] font-semibold tracking-[0.15em] text-gold-100/50 uppercase">
                  Import a build
                </p>
                <p className="mb-3 font-body text-[11px] text-gold-100/50">
                  Paste a build code to load someone's teams across all three modes.
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value)
                    setImportError(false)
                  }}
                  placeholder="Paste a build code here…"
                  rows={3}
                  className={`w-full resize-none rounded-lg border bg-void/60 px-3 py-2 font-body text-xs text-gold-100 placeholder:text-gold-100/40 focus:outline-none ${
                    importError ? 'border-red-500' : 'border-border focus:border-gold-500'
                  }`}
                />
                {importError && <p className="mt-1 font-body text-[11px] text-red-400">That code isn't valid.</p>}
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="mt-2 w-full rounded-lg border border-arcane-500/50 bg-arcane-500/10 px-3 py-2 font-body text-sm font-medium text-arcane-300 hover:bg-arcane-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Load build
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-body text-xs text-emerald-400"
          >
            {flash}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

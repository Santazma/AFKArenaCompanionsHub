import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { heroById } from '../../data/heroes'
import { heroFrameUrl } from '../../lib/heroFrame'
import type { Profile } from '../../hooks/useProfiles'
import HeroAvatar from './HeroAvatar'

interface ProfileManagerProps {
  open: boolean
  profiles: Profile[]
  activeId: string
  onClose: () => void
  onSwitch: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onPickAvatar: (id: string) => void
  onDelete: (id: string) => void
  profileCode: () => string
  profileLink: () => string
  teamCode: () => string
  rosterCode: () => string
  onImportTeam: (code: string) => boolean
  onImportRoster: (code: string) => boolean
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

function ProfileAvatar({ heroId }: { heroId: string | null }) {
  const hero = heroId ? heroById.get(heroId) : undefined
  if (hero) return <HeroAvatar hero={hero} size="sm" frameUrl={heroFrameUrl(hero, 'optimal')} />
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-border bg-void/60 text-2xl text-gold-100/40">
      👤
    </div>
  )
}

function ImportBox({
  label,
  hint,
  placeholder,
  onImport,
}: {
  label: string
  hint: string
  placeholder: string
  onImport: (code: string) => boolean
}) {
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')

  const submit = () => {
    if (!text.trim()) return
    if (onImport(text)) {
      setText('')
      setState('ok')
      setTimeout(() => setState('idle'), 1800)
    } else {
      setState('error')
    }
  }

  return (
    <div className="rounded-lg border border-border/60 bg-void/30 p-3">
      <p className="font-body text-xs font-semibold text-gold-100/80">{label}</p>
      <p className="mb-2 font-body text-[11px] text-gold-100/45">{hint}</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setState('idle')
        }}
        placeholder={placeholder}
        rows={2}
        className={`w-full resize-none rounded-lg border bg-void/60 px-3 py-2 font-body text-[11px] text-gold-100 placeholder:text-gold-100/40 focus:outline-none ${
          state === 'error' ? 'border-red-500' : 'border-border focus:border-gold-500'
        }`}
      />
      {state === 'error' && <p className="mt-1 font-body text-[11px] text-red-400">Wrong code for this box.</p>}
      {state === 'ok' && <p className="mt-1 font-body text-[11px] text-emerald-400">Imported into active profile!</p>}
      <button
        type="button"
        onClick={submit}
        disabled={!text.trim()}
        className="mt-2 w-full rounded-lg border border-arcane-500/50 bg-arcane-500/10 px-3 py-1.5 font-body text-xs font-medium text-arcane-300 hover:bg-arcane-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Load
      </button>
    </div>
  )
}

export default function ProfileManager({
  open,
  profiles,
  activeId,
  onClose,
  onSwitch,
  onCreate,
  onRename,
  onPickAvatar,
  onDelete,
  profileCode,
  profileLink,
  teamCode,
  rosterCode,
  onImportTeam,
  onImportRoster,
}: ProfileManagerProps) {
  const [newName, setNewName] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const flashMsg = async (label: string, value: string) => {
    const ok = await copy(value)
    setFlash(ok ? `${label} copied!` : 'Copy failed')
    setTimeout(() => setFlash(null), 1800)
  }

  const create = () => {
    onCreate(newName)
    setNewName('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-xl font-bold text-gold-300">Profiles</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-gold-100/60 hover:border-red-400 hover:text-red-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5">
              {/* Profile list */}
              <section className="space-y-2">
                {profiles.map((profile) => {
                  const isActive = profile.id === activeId
                  return (
                    <div
                      key={profile.id}
                      className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${
                        isActive ? 'border-gold-500/60 bg-gold-500/10' : 'border-border bg-void/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onPickAvatar(profile.id)}
                        title="Change profile picture"
                        className="relative shrink-0"
                      >
                        <ProfileAvatar heroId={profile.avatarHeroId} />
                        <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-void text-[9px] text-gold-100/70">
                          ✎
                        </span>
                      </button>
                      <input
                        value={profile.name}
                        onChange={(e) => onRename(profile.id, e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 font-body text-sm font-medium text-gold-100 hover:border-border focus:border-gold-500 focus:bg-void/60 focus:outline-none"
                      />
                      {isActive ? (
                        <span className="shrink-0 rounded-full bg-gold-500/20 px-2.5 py-1 font-body text-[10px] font-semibold tracking-wide text-gold-300 uppercase">
                          Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSwitch(profile.id)}
                          className="shrink-0 rounded-full border border-arcane-500/50 bg-arcane-500/10 px-3 py-1 font-body text-xs font-medium text-arcane-300 hover:bg-arcane-500/20"
                        >
                          Switch
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(profile.id)}
                        disabled={profiles.length <= 1}
                        aria-label={`Delete ${profile.name}`}
                        title={profiles.length <= 1 ? 'Keep at least one profile' : 'Delete profile'}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-gold-100/50 enabled:hover:border-red-400 enabled:hover:text-red-400 disabled:opacity-30"
                      >
                        🗑
                      </button>
                    </div>
                  )
                })}

                <div className="flex gap-2 pt-1">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && create()}
                    placeholder="New profile name…"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-void/60 px-3 py-2 font-body text-sm text-gold-100 placeholder:text-gold-100/40 focus:border-gold-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={create}
                    className="shrink-0 rounded-lg border border-gold-500/50 bg-gold-500/10 px-4 py-2 font-body text-sm font-medium text-gold-300 hover:bg-gold-500/20"
                  >
                    + New
                  </button>
                </div>
              </section>

              {/* Share active profile */}
              <section className="border-t border-border/60 pt-4">
                <p className="mb-2 font-body text-[11px] font-semibold tracking-[0.15em] text-gold-100/50 uppercase">
                  Share active profile
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => flashMsg('Profile link', profileLink())}
                    className="rounded-lg border border-gold-500/50 bg-gold-500/10 px-3 py-2 font-body text-xs font-medium text-gold-300 hover:bg-gold-500/20"
                  >
                    Copy profile link
                  </button>
                  <button
                    type="button"
                    onClick={() => flashMsg('Profile code', profileCode())}
                    className="rounded-lg border border-border bg-void/60 px-3 py-2 font-body text-xs font-medium text-gold-100/80 hover:border-gold-500/50"
                  >
                    Copy profile code
                  </button>
                  <button
                    type="button"
                    onClick={() => flashMsg('Team code', teamCode())}
                    className="rounded-lg border border-border bg-void/60 px-3 py-2 font-body text-xs font-medium text-gold-100/80 hover:border-gold-500/50"
                  >
                    Copy team code
                  </button>
                  <button
                    type="button"
                    onClick={() => flashMsg('Roster code', rosterCode())}
                    className="rounded-lg border border-border bg-void/60 px-3 py-2 font-body text-xs font-medium text-gold-100/80 hover:border-gold-500/50"
                  >
                    Copy roster code
                  </button>
                </div>
                <AnimatePresence>
                  {flash && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-center font-body text-xs text-emerald-400"
                    >
                      {flash}
                    </motion.p>
                  )}
                </AnimatePresence>
              </section>

              {/* Import (two type-safe boxes) */}
              <section className="border-t border-border/60 pt-4">
                <p className="mb-2 font-body text-[11px] font-semibold tracking-[0.15em] text-gold-100/50 uppercase">
                  Import into active profile
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ImportBox
                    label="Import Team"
                    hint="Loads teams only. Paste a team code."
                    placeholder="Team code…"
                    onImport={onImportTeam}
                  />
                  <ImportBox
                    label="Import Roster"
                    hint="Loads roster only. Paste a roster code."
                    placeholder="Roster code…"
                    onImport={onImportRoster}
                  />
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

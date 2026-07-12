import { useEffect, useRef, useState } from 'react'
import type { Hero } from '../data/heroes'
import HeroBrowser from '../components/teambuilder/HeroBrowser'
import HeroDetailModal from '../components/teambuilder/HeroDetailModal'
import HeroPickerModal from '../components/teambuilder/HeroPickerModal'
import InvestmentTabs from '../components/teambuilder/InvestmentTabs'
import ModeTabs from '../components/teambuilder/ModeTabs'
import BuilderToolbar from '../components/teambuilder/BuilderToolbar'
import ProfileManager from '../components/teambuilder/ProfileManager'
import TeamCountControl from '../components/teambuilder/TeamCountControl'
import TeamsBoard from '../components/teambuilder/TeamsBoard'
import { useTeamBuilderState } from '../hooks/useTeamBuilderState'
import { useRoster } from '../hooks/useRoster'
import { useProfiles, type ProfileData } from '../hooks/useProfiles'
import { heroById } from '../data/heroes'
import { heroFrameUrl } from '../lib/heroFrame'
import { downloadNodeAsPng } from '../lib/exportImage'
import {
  encodeProfileCode,
  encodeTeamCode,
  encodeRosterCode,
  decodeProfileCode,
  decodeTeamCode,
  decodeRosterCode,
} from '../lib/shareCodes'
import { parseSlotKey, type ModeTeams, type SlotRef, type Team } from '../lib/teamBuilder'
import HeroAvatar from '../components/teambuilder/HeroAvatar'

type Pending = { type: 'hero'; heroId: string } | { type: 'slot'; ref: SlotRef } | null

function sameSlot(a: SlotRef, b: SlotRef) {
  return a.side === b.side && a.teamIndex === b.teamIndex && a.slotIndex === b.slotIndex
}

function getTeam(teams: ModeTeams, ref: SlotRef): Team | undefined {
  return ref.side === 'ours' ? teams.ours[ref.teamIndex] : teams.opponent[ref.teamIndex]
}

function slotTitle(ref: SlotRef): string {
  const side = ref.side === 'ours' ? 'Our Team' : 'Opponent'
  const row = ref.slotIndex <= 1 ? 'Front' : 'Back'
  return `Team ${ref.teamIndex + 1} · ${side} · ${row}`
}

export default function TeamBuilder() {
  const store = useTeamBuilderState()
  const roster = useRoster()
  const profiles = useProfiles()
  const [pending, setPending] = useState<Pending>(null)
  const [detailHero, setDetailHero] = useState<Hero | null>(null)
  const [pickerSlot, setPickerSlot] = useState<SlotRef | null>(null)
  const [managerOpen, setManagerOpen] = useState(false)
  const [avatarFor, setAvatarFor] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPending(null)
    setPickerSlot(null)
  }, [store.mode])

  // Mirror the live roster + teams into the active profile so switching away
  // never loses edits (and switching back restores them). Safe on first run
  // because the live state already equals the active profile after migration.
  const { saveActive } = profiles
  useEffect(() => {
    saveActive(roster.roster, store.builds)
  }, [roster.roster, store.builds, saveActive])

  const loadData = (data: ProfileData | null) => {
    if (!data) return
    roster.replaceRoster(data.roster)
    store.importBuildState(data.builds)
  }

  // Apply a shared profile link (?profile=…) once on mount, then clean the URL.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const code = new URLSearchParams(window.location.search).get('profile')
    if (code) {
      const decoded = decodeProfileCode(code)
      if (decoded) {
        loadData(profiles.importProfile(decoded.name, decoded.avatarHeroId, decoded.roster, decoded.builds))
      }
      const url = new URL(window.location.href)
      url.searchParams.delete('profile')
      window.history.replaceState({}, '', url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImportTeam = (code: string): boolean => {
    const builds = decodeTeamCode(code)
    if (!builds) return false
    store.importBuildState(builds)
    return true
  }

  const handleImportRoster = (code: string): boolean => {
    const parsed = decodeRosterCode(code)
    if (!parsed) return false
    roster.replaceRoster(parsed)
    return true
  }

  const profileCode = () =>
    encodeProfileCode({
      name: profiles.active.name,
      avatarHeroId: profiles.active.avatarHeroId,
      roster: roster.roster,
      builds: store.builds,
    })

  const profileLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('build')
    url.searchParams.delete('team')
    url.searchParams.set('profile', profileCode())
    return url.toString()
  }

  const handleExport = async () => {
    if (!boardRef.current) return
    setExporting(true)
    try {
      await downloadNodeAsPng(boardRef.current, `afk-${store.mode}-comp.png`)
    } catch (err) {
      console.error('Export failed', err)
      window.alert('Sorry, exporting the image failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const placeHero = (ref: SlotRef, heroId: string) => {
    const team = getTeam(store.teams, ref)
    if (team?.includes(heroId)) return
    store.assignHero(ref.side, ref.teamIndex, ref.slotIndex, heroId)
  }

  const moveOrSwap = (sourceRef: SlotRef, targetRef: SlotRef) => {
    if (sameSlot(sourceRef, targetRef)) return
    const sourceTeam = getTeam(store.teams, sourceRef)
    const targetTeam = getTeam(store.teams, targetRef)
    const sourceHero = sourceTeam?.[sourceRef.slotIndex] ?? null
    const targetHero = targetTeam?.[targetRef.slotIndex] ?? null
    if (!sourceHero) return

    const sameTeam = sourceRef.side === targetRef.side && sourceRef.teamIndex === targetRef.teamIndex
    if (!sameTeam) {
      if (targetTeam?.includes(sourceHero)) return
      if (targetHero && sourceTeam?.includes(targetHero)) return
    }

    store.assignHero(targetRef.side, targetRef.teamIndex, targetRef.slotIndex, sourceHero)
    if (targetHero) {
      store.assignHero(sourceRef.side, sourceRef.teamIndex, sourceRef.slotIndex, targetHero)
    } else {
      store.clearSlot(sourceRef.side, sourceRef.teamIndex, sourceRef.slotIndex)
    }
  }

  const handleSlotClick = (ref: SlotRef) => {
    if (pending?.type === 'hero') {
      placeHero(ref, pending.heroId)
      setPending(null)
      return
    }

    if (pending?.type === 'slot') {
      if (sameSlot(pending.ref, ref)) {
        setPending(null)
        return
      }
      moveOrSwap(pending.ref, ref)
      setPending(null)
      return
    }

    // No pending action: an occupied slot is selected for a move/swap, while an
    // empty slot opens the in-place picker so you never scroll to the browser.
    const occupied = getTeam(store.teams, ref)?.[ref.slotIndex]
    if (occupied) {
      setPending({ type: 'slot', ref })
    } else {
      setPickerSlot(ref)
    }
  }

  const handlePick = (heroId: string) => {
    if (pickerSlot) placeHero(pickerSlot, heroId)
    setPickerSlot(null)
  }

  const handleSelectHero = (heroId: string) => {
    if (pending?.type === 'slot') {
      placeHero(pending.ref, heroId)
      setPending(null)
      return
    }
    setPending((prev) => (prev?.type === 'hero' && prev.heroId === heroId ? null : { type: 'hero', heroId }))
  }

  const handleDropHero = (targetRef: SlotRef, heroId: string, sourceSlotKey: string | null) => {
    const sourceRef = sourceSlotKey ? parseSlotKey(sourceSlotKey) : null
    if (sourceRef) {
      moveOrSwap(sourceRef, targetRef)
    } else {
      placeHero(targetRef, heroId)
    }
    setPending(null)
  }

  const handleRemoveHero = (ref: SlotRef) => {
    store.clearSlot(ref.side, ref.teamIndex, ref.slotIndex)
    setPending((prev) => (prev?.type === 'slot' && sameSlot(prev.ref, ref) ? null : prev))
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-12 pb-24 sm:px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <span className="mb-2 block font-body text-xs tracking-[0.3em] text-gold-300/70 uppercase">
            Team Builder
          </span>
          <h1 className="font-display text-3xl font-bold text-gold-300 sm:text-4xl">Build Your Comps</h1>
        </div>

        <button
          type="button"
          onClick={() => setManagerOpen(true)}
          title="Manage profiles"
          className="flex items-center gap-2 rounded-full border border-arcane-500/50 bg-arcane-500/10 py-1.5 pr-4 pl-1.5 transition-colors hover:bg-arcane-500/20"
        >
          {profiles.active.avatarHeroId && heroById.get(profiles.active.avatarHeroId) ? (
            <HeroAvatar
              hero={heroById.get(profiles.active.avatarHeroId)!}
              size="sm"
              frameUrl={heroFrameUrl(heroById.get(profiles.active.avatarHeroId)!, 'optimal')}
              className="!h-9 !w-9"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-void/60 text-lg">👤</span>
          )}
          <span className="max-w-[10rem] truncate font-body text-sm font-medium text-arcane-200">
            {profiles.active.name}
          </span>
          <span className="font-body text-xs text-arcane-300/60">▾</span>
        </button>

        <ModeTabs mode={store.mode} onChange={store.setMode} />
        <InvestmentTabs level={store.investmentLevel} onChange={store.setInvestmentLevel} />

        <BuilderToolbar
          canUndo={store.canUndo}
          hasTeams={store.hasTeams}
          exporting={exporting}
          onUndo={store.undo}
          onClear={store.clearTeams}
          onExport={handleExport}
          shareUrl={store.shareUrl}
          shareCode={store.shareCode}
          summary={store.summary}
        />
      </div>

      <TeamsBoard
        mode={store.mode}
        teams={store.teams}
        investmentLevel={store.investmentLevel}
        selectedSlot={pending?.type === 'slot' ? pending.ref : null}
        roster={roster}
        boardRef={boardRef}
        onSlotClick={handleSlotClick}
        onRemoveHero={handleRemoveHero}
        onDropHero={handleDropHero}
        onSelectBoss={store.setBoss}
      />

      <TeamCountControl count={store.teams.ours.length} onChange={store.setTeamCount} />

      <HeroBrowser
        mode={store.mode}
        investmentLevel={store.investmentLevel}
        selectedHeroId={pending?.type === 'hero' ? pending.heroId : null}
        roster={roster}
        onSelectHero={handleSelectHero}
        onOpenDetail={setDetailHero}
      />

      <HeroPickerModal
        open={pickerSlot !== null}
        title={pickerSlot ? slotTitle(pickerSlot) : ''}
        mode={store.mode}
        investmentLevel={store.investmentLevel}
        roster={roster}
        onPick={handlePick}
        onOpenDetail={setDetailHero}
        onClose={() => setPickerSlot(null)}
      />

      <HeroDetailModal hero={detailHero} roster={roster} onClose={() => setDetailHero(null)} />

      <ProfileManager
        open={managerOpen}
        profiles={profiles.profiles}
        activeId={profiles.activeId}
        onClose={() => setManagerOpen(false)}
        onSwitch={(id) => loadData(profiles.switchTo(id))}
        onCreate={(name) => loadData(profiles.createAndSwitch(name))}
        onRename={profiles.rename}
        onPickAvatar={(id) => {
          setAvatarFor(id)
          setManagerOpen(false)
        }}
        onDelete={(id) => loadData(profiles.remove(id))}
        profileCode={profileCode}
        profileLink={profileLink}
        teamCode={() => encodeTeamCode(store.builds)}
        rosterCode={() => encodeRosterCode(roster.roster)}
        onImportTeam={handleImportTeam}
        onImportRoster={handleImportRoster}
      />

      <HeroPickerModal
        open={avatarFor !== null}
        title="Choose profile picture"
        mode={store.mode}
        investmentLevel={store.investmentLevel}
        roster={roster}
        onPick={(heroId) => {
          if (avatarFor) profiles.setAvatar(avatarFor, heroId)
          setAvatarFor(null)
          setManagerOpen(true)
        }}
        onOpenDetail={setDetailHero}
        onClose={() => {
          setAvatarFor(null)
          setManagerOpen(true)
        }}
      />
    </div>
  )
}

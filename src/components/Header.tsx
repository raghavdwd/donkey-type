import { useState, useEffect } from 'react'
import {
  Keyboard,
  History,
  Languages,
  Settings,
  Volume2,
  VolumeX,
  Ghost,
  Flame,
  Hourglass,
  Github,
} from 'lucide-react'
import clsx from 'clsx'
import useStore from '../store'
import ModePill from './ModePill'
import SegmentedDifficulty from './SegmentedDifficulty'
import LiveStatus from './LiveStatus'
import SettingsMenu from './SettingsMenu'
import ThemeDropdown from './ThemeDropdown'

/*
 * Header
 *
 * New layout: 2 zones stacked in a single column.
 *
 *   Zone 1 — Top bar (always visible when not typing)
 *     [logo]  [mode pill]  [language] [settings]
 *
 *   Zone 2 — Mode strip (fades out as user starts typing)
 *     [difficulty] · · · [ghost] [sound] [history]
 *
 * The live WPM/acc/time-left readout slides into the top bar (replacing the
 * mode pill) once typing starts, so the chrome stays present-but-quiet
 * instead of going fully empty.
 */
export default function Header() {
  const {
    config,
    toggleSound,
    toggleGhostMode,
    toggleHistory,
    stats,
    streak,
  } = useStore()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const isTyping = stats.secElapsed > 0
  const showLive = isTyping && config.showRealtimeStats

  return (
    <header className="w-full flex flex-col gap-3 sm:gap-4 py-4 sm:py-6">
      {/* Zone 1 — Top bar (fades when typing) */}
      <div
        className={clsx(
          'flex items-center justify-between gap-3 transition-all duration-500',
          isTyping
            ? 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden'
            : 'opacity-100',
        )}
      >
        <div className="flex items-center gap-2 shrink-0">
          <Keyboard className="w-7 h-7 sm:w-8 sm:h-8 text-brand" />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight font-mono">
            <span className="text-brand">donkey</span>
            <span className="text-text">type</span>
          </h1>
        </div>
        
        <div className="flex-1 flex justify-center min-w-0">
          <ModePill />
        </div>
        
        <a
            href="https://github.com/raghavdwd/donkey-type"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <IconToggle
            label={config.language === 'english' ? 'en' : 'hi'}
            active={config.language === 'hindi'}
            activeClass="text-success bg-success/10"
            onClick={() => {}}
            disabled
            title="Hindi mode coming in a future version"
            icon={<Languages className="w-4 h-4" />}
            showLabel
          />

          <ThemeDropdown />

          <IconToggle
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            icon={<Settings className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Zone 2 — Mode strip */}
      <div
        className={clsx(
          'flex items-center justify-between gap-2 transition-all duration-500',
          isTyping
            ? 'opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden'
            : 'opacity-100',
        )}
      >
        <SegmentedDifficulty />

        <div className="flex items-center gap-1">
          <StreakBadge count={streak.count} lastDate={streak.lastDate} />
          <IconToggle
            onClick={() => toggleHistory()}
            title="History"
            icon={<History className="w-4 h-4" />}
          />
          <IconToggle
            onClick={() => toggleGhostMode()}
            active={config.ghostMode}
            activeClass="text-blue-400 bg-blue-400/10"
            title="Ghost Mode"
            icon={<Ghost className="w-4 h-4" />}
          />
          <IconToggle
            onClick={() => toggleSound()}
            title="Sound"
            icon={
              config.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )
            }
          />
        </div>
      </div>

      {/* Zone 3 — Live status (appears when typing) */}
      <div
        className={clsx(
          'flex items-center justify-center min-h-6 transition-all duration-500',
          showLive
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden',
        )}
      >
        <LiveStatus />
      </div>

      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  )
}

function StreakBadge({
  count,
  lastDate,
}: {
  count: number
  lastDate: string | null
}) {
  // 60s tick to catch the 10pm hourglass threshold while idle.
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(i)
  }, [])

  if (count === 0) return null
  const todayKey = new Date().toLocaleDateString()
  const doneToday = lastDate === todayKey
  const late = new Date().getHours() >= 22
  const warning = !doneToday && late

  return (
    <div
      title={
        warning ? `Streak ${count} — expires at midnight!` : `Streak ${count}`
      }
      className={clsx(
        'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-mono text-xs font-bold transition-all',
        warning
          ? 'text-amber-400 bg-amber-400/10 animate-pulse'
          : 'text-brand bg-brand/10',
      )}
    >
      {warning ? (
        <Hourglass className="w-4 h-4" />
      ) : (
        <Flame className="w-4 h-4" color="orange" />
      )}
      <span className="tabular-nums">{count}</span>
    </div>
  )
}

function IconToggle({
  onClick,
  title,
  icon,
  label,
  active,
  activeClass = 'text-brand bg-brand/10',
  showLabel,
  disabled,
}: {
  onClick: () => void
  title: string
  icon?: React.ReactNode
  label?: React.ReactNode
  active?: boolean
  activeClass?: string
  showLabel?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : active
            ? activeClass
            : 'text-text-muted hover:text-text hover:bg-bg-secondary/60',
      )}
    >
      {icon}
      {showLabel && label}
    </button>
  )
}

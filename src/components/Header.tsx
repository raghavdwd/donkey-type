import { useState } from 'react'
import {
  Keyboard,
  History,
  Languages,
  Palette,
  Gauge,
  Settings,
  Volume2,
  VolumeX,
  Ghost,
} from 'lucide-react'
import useStore from '../store'
import type { ThemeName } from '../store'
import clsx from 'clsx'
import TimeWordsConfigModal from './TimeWordsConfigModal'

const THEMES: ThemeName[] = [
  'default',
  'nord',
  'matcha',
  'cyberpunk',
  'midnight',
]
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export default function Header() {
  const {
    config,
    changeLanguage,
    changeTheme,
    changeDifficulty,
    toggleSound,
    toggleGhostMode,
    toggleHistory,
  } = useStore()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNextTheme = () => {
    const currentIndex = THEMES.indexOf(config.theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    changeTheme(THEMES[nextIndex])
  }

  const handleNextDifficulty = () => {
    const currentIndex = DIFFICULTIES.indexOf(config.difficulty)
    const nextIndex = (currentIndex + 1) % DIFFICULTIES.length
    changeDifficulty(DIFFICULTIES[nextIndex])
  }

  return (
    <header className="w-full flex items-center justify-between py-8">
      {/* Logo */}
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="relative">
          <Keyboard className="w-9 h-9 text-brand transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand rounded-full border-2 border-bg animate-pulse" />
        </div>
        <div className="flex flex-col -gap-1">
          <h1 className="text-3xl font-black tracking-tight text-brand font-mono hidden md:block">
            donkey<span className="text-text">type</span>
          </h1>
          <div className="h-0.5 w-0 group-hover:w-full bg-brand transition-all duration-300 rounded-full" />
        </div>
      </div>

      {/* Navigation / Modes & Options */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px] hover:bg-bg/60 text-text-muted hover:text-brand"
          title="Configure Time/Words"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden lg:inline uppercase font-bold tracking-wider">
            Configure Time/Words
          </span>
        </button>
      </div>

      <TimeWordsConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Settings / Toggles */}
      <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-neutral-800/50 shadow-md">
        <div className="flex items-center gap-0.5">
          {/* Difficulty Toggle */}
          <button
            onClick={handleNextDifficulty}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px] hover:bg-bg/60 text-text-muted hover:text-brand"
            title={`Difficulty: ${config.difficulty}`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden lg:inline uppercase font-bold tracking-wider">
              {config.difficulty}
            </span>
          </button>

          <div className="w-px h-4 bg-neutral-800 hidden sm:block mx-1" />

          {/* Theme Toggle */}
          <button
            onClick={handleNextTheme}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px] hover:bg-bg/60 text-text-muted hover:text-brand"
            title={`Theme: ${config.theme}`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden lg:inline uppercase font-bold tracking-wider">
              {config.theme}
            </span>
          </button>

          <div className="w-px h-4 bg-neutral-800 hidden sm:block mx-1" />

          {/* Language Toggle */}
          <button
            onClick={() =>
              changeLanguage(
                config.language === 'english' ? 'hindi' : 'english',
              )
            }
            className={clsx(
              'group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px]',
              config.language === 'hindi'
                ? 'text-success bg-success/5'
                : 'text-text-muted hover:bg-bg/60 hover:text-brand',
            )}
            title="Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden lg:inline uppercase font-bold tracking-wider">
              {config.language === 'english' ? 'en' : 'hi'}
            </span>
          </button>
        </div>

        <div className="w-px h-6 bg-neutral-800 mx-2" />

        <div className="flex items-center gap-1 pr-1">
          <button
            onClick={() => toggleHistory()}
            className="p-2 text-text-muted hover:text-brand hover:bg-bg/60 rounded-lg transition-all"
            title="History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleGhostMode()}
            className={clsx(
              'p-2 rounded-lg transition-all',
              config.ghostMode
                ? 'text-blue-400 bg-blue-400/5'
                : 'text-text-muted hover:text-brand hover:bg-bg/60',
            )}
            title="Ghost Mode"
          >
            <Ghost className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleSound()}
            className="p-2 text-text-muted hover:text-brand hover:bg-bg/60 rounded-lg transition-all"
            title="Sound"
          >
            {config.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

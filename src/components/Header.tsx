import { Keyboard, Timer, AlignLeft, Volume2, VolumeX, Ghost, History, Languages, Palette, Gauge } from 'lucide-react'
import useStore from '../store'
import type { ThemeName } from '../store'
import clsx from 'clsx'

const THEMES: ThemeName[] = ['default', 'nord', 'matcha', 'cyberpunk', 'midnight']
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export default function Header() {
  const { config, changeMode, changeLanguage, changeTheme, changeDifficulty, toggleSound, toggleGhostMode, toggleHistory } = useStore()

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
    <header className="w-full flex items-center justify-between py-12">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Keyboard className="w-8 h-8 text-brand" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-brand font-mono">
          donkey<span className="text-text">type</span>
        </h1>
      </div>

      {/* Navigation / Modes */}
      <nav className="flex items-center gap-2 bg-bg-secondary p-1.5 rounded-xl border border-neutral-800/50 shadow-xl font-mono text-sm">
        <button 
          onClick={() => changeMode('time')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            config.mode === 'time' ? "bg-bg text-brand shadow-sm" : "text-text-muted hover:text-text hover:bg-bg/50"
          )}
        >
          <Timer className="w-4 h-4" /> time
        </button>
        <button 
          onClick={() => changeMode('words')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            config.mode === 'words' ? "bg-bg text-brand shadow-sm" : "text-text-muted hover:text-text hover:bg-bg/50"
          )}
        >
          <AlignLeft className="w-4 h-4" /> words
        </button>
      </nav>

      {/* Settings / Toggles */}
      <div className="flex items-center gap-4 text-text-muted">
        
        {/* Difficulty Toggle */}
        <button 
          onClick={handleNextDifficulty}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-mono text-sm hover:text-brand hover:bg-bg-secondary"
          title={`Current Difficulty: ${config.difficulty} (Click to change)`}
        >
          <Gauge className="w-4 h-4" />
          <span className="hidden sm:inline capitalize">{config.difficulty}</span>
        </button>

        <div className="w-px h-6 bg-neutral-800/50" />

        {/* Theme Toggle */}
        <button 
          onClick={handleNextTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-mono text-sm hover:text-brand hover:bg-bg-secondary"
          title={`Current Theme: ${config.theme} (Click to change)`}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline capitalize">{config.theme}</span>
        </button>

        <div className="w-px h-6 bg-neutral-800/50" />

        <button 
          onClick={() => changeLanguage(config.language === 'english' ? 'hindi' : 'english')}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-mono text-sm border border-transparent",
            config.language === 'hindi' ? "text-success bg-success/10 border-success/20" : "hover:text-brand hover:bg-bg-secondary"
          )}
          title="Toggle Language"
        >
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline">{config.language === 'english' ? 'en' : 'hi'}</span>
        </button>

        <div className="w-px h-6 bg-neutral-800/50" />

        <button 
          onClick={() => toggleHistory()}
          className="p-2 hover:text-brand hover:bg-bg-secondary rounded-lg transition-colors"
          title="View History & Stats"
        >
          <History className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => toggleGhostMode()}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            config.ghostMode ? "text-blue-400 bg-blue-400/10 shadow-[0_0_15px_rgba(96,165,250,0.2)]" : "hover:text-brand hover:bg-bg-secondary"
          )}
          title="Toggle Ghost Mode (race your best time)"
        >
          <Ghost className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => toggleSound()}
          className="p-2 hover:text-brand hover:bg-bg-secondary rounded-lg transition-colors"
          title="Toggle typing sounds"
        >
          {config.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}
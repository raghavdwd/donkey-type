import { Keyboard, Timer, AlignLeft, Volume2, VolumeX } from 'lucide-react'
import useStore from '../store'
import clsx from 'clsx'

export default function Header() {
  const { config, changeMode, toggleSound } = useStore()

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
      <nav className="flex items-center gap-2 bg-bg-secondary p-1.5 rounded-xl border border-neutral-800 shadow-xl font-mono text-sm">
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

      {/* Settings / Sound */}
      <div className="flex items-center gap-4 text-text-muted">
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
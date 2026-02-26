import { useState, useEffect } from 'react'
import {
  Keyboard,
  Timer,
  AlignLeft,
  Volume2,
  VolumeX,
  Ghost,
  History,
  Languages,
  Palette,
  Gauge,
  Wind,
} from 'lucide-react'
import useStore from '../store'
import type { ThemeName } from '../store'
import clsx from 'clsx'

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
    changeMode,
    changeLanguage,
    changeTheme,
    changeDifficulty,
    setTimeAmount,
    setTimeUnit,
    setWordsAmount,
    setWordUnit,
    toggleSound,
    toggleGhostMode,
    toggleHistory,
  } = useStore()

  const [localTimeAmount, setLocalTimeAmount] = useState(
    config.timeAmount.toString(),
  )
  const [localWordsAmount, setLocalWordsAmount] = useState(
    config.wordsAmount.toString(),
  )

  useEffect(() => {
    setLocalTimeAmount(config.timeAmount.toString())
  }, [config.timeAmount])

  useEffect(() => {
    setLocalWordsAmount(config.wordsAmount.toString())
  }, [config.wordsAmount])

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

  const handleCustomTimeSubmit = () => {
    const val = parseInt(localTimeAmount)
    if (!isNaN(val) && val > 0) {
      setTimeAmount(val)
    } else {
      setLocalTimeAmount(config.timeAmount.toString())
    }
  }

  const handleCustomWordsSubmit = () => {
    const val = parseInt(localWordsAmount)
    if (!isNaN(val) && val > 0) {
      setWordsAmount(val)
    } else {
      setLocalWordsAmount(config.wordsAmount.toString())
    }
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
      <div className="flex items-center gap-1 bg-bg-secondary p-0.5 rounded-xl border border-neutral-800/50 shadow-xl font-mono text-[13px]">
        {/* Modes */}
        <div className="flex items-center px-1">
          <button
            onClick={() => changeMode('time')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer',
              config.mode === 'time'
                ? 'bg-brand text-bg shadow-sm font-bold'
                : 'text-text-muted hover:text-text hover:bg-bg/40',
            )}
          >
            <Timer className="w-3.5 h-3.5" /> time
          </button>
          <button
            onClick={() => changeMode('words')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer',
              config.mode === 'words'
                ? 'bg-brand text-bg shadow-sm font-bold'
                : 'text-text-muted hover:text-text hover:bg-bg/40',
            )}
          >
            <AlignLeft className="w-3.5 h-3.5" /> words
          </button>
          <button
            onClick={() => changeMode('zen')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer',
              config.mode === 'zen'
                ? 'bg-brand text-bg shadow-sm font-bold'
                : 'text-text-muted hover:text-text hover:bg-bg/40',
            )}
          >
            <Wind className="w-3.5 h-3.5" /> zen
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-800/80 mx-1" />

        {/* Dynamic Controls based on selected Mode */}
        <div className="flex items-center gap-1.5 px-2">
          {config.mode === 'time' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center bg-bg/40 rounded-md p-0.5 border border-neutral-800/50">
                {[5, 10, 15].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setTimeAmount(amount)
                      setLocalTimeAmount(amount.toString())
                    }}
                    className={clsx(
                      'px-2 py-0.5 rounded transition-all duration-200 text-[11px] font-bold',
                      config.timeAmount === amount
                        ? 'bg-brand text-bg shadow-sm scale-110'
                        : 'text-text-muted hover:text-text hover:bg-bg/50',
                    )}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-neutral-800/50" />
              <div className="flex items-center gap-1">
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="custom"
                    value={localTimeAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setLocalTimeAmount(val)
                    }}
                    onBlur={handleCustomTimeSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomTimeSubmit()
                        ;(e.target as HTMLInputElement).blur()
                      }
                    }}
                    className="w-10 bg-bg/50 text-text px-1 py-1 rounded-md border border-neutral-800/50 outline-none focus:border-brand/50 transition-all text-center group-hover:bg-bg text-[11px] placeholder:text-text-muted/40"
                  />
                </div>
                <div className="flex items-center bg-bg/40 rounded-md p-0.5 border border-neutral-800/50">
                  {(['s', 'm', 'h'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTimeUnit(unit)}
                      className={clsx(
                        'px-1.5 py-0.5 rounded transition-all duration-200 uppercase text-[10px] font-bold',
                        config.timeUnit === unit
                          ? 'bg-neutral-600 text-text shadow-sm'
                          : 'text-text-muted/60 hover:text-text hover:bg-bg/50',
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {config.mode === 'words' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center bg-bg/40 rounded-md p-0.5 border border-neutral-800/50">
                {[400, 600].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setWordsAmount(amount)
                      setLocalWordsAmount(amount.toString())
                    }}
                    className={clsx(
                      'px-2 py-0.5 rounded transition-all duration-200 text-[11px] font-bold',
                      config.wordsAmount === amount
                        ? 'bg-brand text-bg shadow-sm scale-110'
                        : 'text-text-muted hover:text-text hover:bg-bg/50',
                    )}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-neutral-800/50" />
              <div className="flex items-center gap-1">
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="custom"
                    value={localWordsAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setLocalWordsAmount(val)
                    }}
                    onBlur={handleCustomWordsSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomWordsSubmit()
                        ;(e.target as HTMLInputElement).blur()
                      }
                    }}
                    className="w-10 bg-bg/50 text-text px-1 py-1 rounded-md border border-neutral-800/50 outline-none focus:border-brand/50 transition-all text-center group-hover:bg-bg text-[11px] placeholder:text-text-muted/40"
                  />
                </div>
                <div className="flex items-center bg-bg/40 rounded-md p-0.5 border border-neutral-800/50">
                  {(['words', 'chars'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setWordUnit(unit)}
                      className={clsx(
                        'px-1.5 py-0.5 rounded transition-all duration-200 capitalize text-[10px] font-bold',
                        config.wordUnit === unit
                          ? 'bg-neutral-600 text-text shadow-sm'
                          : 'text-text-muted/60 hover:text-text hover:bg-bg/50',
                      )}
                    >
                      {unit === 'words' ? 'w' : 'c'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

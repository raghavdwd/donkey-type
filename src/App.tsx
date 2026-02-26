import { useEffect, useState, useCallback, useRef } from 'react'
import TypingArea from './components/TypingArea'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import { getRandomText } from './data'
import useStore from './store'

function App() {
  const [practiceText, setPracticeText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  
  const { config, stats, reset, incrStat } = useStore()
  
  const timerRef = useRef<number | null>(null)

  // Initialize game
  const initGame = useCallback(() => {
    setPracticeText(getRandomText(config.mode === 'words' ? 25 : 50))
    reset()
    setIsTyping(false)
    setIsFinished(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [config.mode, reset])

  // Initial load & mode change
  useEffect(() => {
    initGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [initGame])

  // Handle typing start
  const handleStartTyping = useCallback(() => {
    if (!isTyping && !isFinished) {
      setIsTyping(true)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        useStore.setState(state => {
          // If time mode and time's up, finish game
          if (state.config.mode === 'time' && state.stats.secElapsed >= 30) {
            clearInterval(timerRef.current!)
            setIsFinished(true)
            setIsTyping(false)
            return state
          }
          return {
            stats: { ...state.stats, secElapsed: state.stats.secElapsed + 1 }
          }
        })
      }, 1000)
    }
  }, [isTyping, isFinished])

  // Global restart shortcut (Tab + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        initGame()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [initGame])

  return (
    <main className={`h-screen w-full flex flex-col items-center bg-bg text-text selection:bg-brand/30 transition-colors duration-300 ${isTyping ? 'typing-active' : ''}`}>
      
      {/* Dynamic wrapper to fade out distracting elements while typing */}
      <div className={`w-full max-w-5xl px-8 flex flex-col h-full transition-opacity duration-500 ${isTyping ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        <Header />
      </div>

      {/* Main interaction area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-8 flex flex-col items-center gap-12">
        
        {isFinished ? (
          <StatsPanel onRestart={initGame} />
        ) : (
          <>
            {/* Realtime mini-stats */}
            {config.showRealtimeStats && isTyping && (
              <div className="absolute -top-16 left-8 font-mono text-xl text-brand flex gap-6 animate-in fade-in">
                <span>{useStore.getState().calcWPM()} wpm</span>
                {config.mode === 'time' && (
                  <span>{Math.max(0, 30 - stats.secElapsed)}s</span>
                )}
              </div>
            )}
            
            <TypingArea 
              text={practiceText} 
              onStart={handleStartTyping}
              onFinish={() => {
                if (timerRef.current) clearInterval(timerRef.current)
                setIsTyping(false)
                setIsFinished(true)
              }}
            />
          </>
        )}
      </div>

      {/* Footer shortcut hints */}
      <div className={`absolute bottom-8 text-text-muted text-sm font-mono transition-opacity duration-500 ${isTyping && !isFinished ? 'opacity-0' : 'opacity-100'}`}>
        <span className="bg-bg-secondary px-2 py-1 rounded border border-neutral-800">tab</span> + <span className="bg-bg-secondary px-2 py-1 rounded border border-neutral-800">enter</span> to restart
      </div>
      
    </main>
  )
}

export default App
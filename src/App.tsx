import { useEffect, useState, useCallback, useRef } from 'react'
import TypingArea from './components/TypingArea'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import HistoryModal from './components/HistoryModal'
import { getRandomText } from './data'
import useStore from './store'

function App() {
  const [isTyping, setIsTyping] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  
  const { config, stats, currentText, setCurrentText, reset, isHistoryOpen, getBestGhostRun } = useStore()
  
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme);
  }, [config.theme])

  const initGame = useCallback(() => {
    // If ghost mode is ON and we have a valid ghost run for this config, USE THAT EXACT TEXT.
    // Otherwise, generate new random text based on current difficulty/language.
    if (config.ghostMode) {
      const bestRun = getBestGhostRun();
      if (bestRun && bestRun.textUsed) {
        setCurrentText(bestRun.textUsed);
      } else {
        setCurrentText(getRandomText(config.mode === 'words' ? 25 : 80, config.language, config.difficulty));
      }
    } else {
      setCurrentText(getRandomText(config.mode === 'words' ? 25 : 80, config.language, config.difficulty));
    }
    
    reset()
    setIsTyping(false)
    setIsFinished(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [config.mode, config.language, config.difficulty, config.ghostMode, reset, setCurrentText, getBestGhostRun])

  // Re-init when core settings change that would invalidate the current text
  useEffect(() => {
    initGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [config.mode, config.language, config.difficulty, config.ghostMode]) 

  // Initial load
  useEffect(() => {
    initGame()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsTyping(false)
    setIsFinished(true)
    
    // Explicitly call the store method to save the result.
    // Zustand's persist middleware will automatically sync the updated state array to localStorage.
    useStore.getState().saveTestResult()
  }, [])

  const handleStartTyping = useCallback(() => {
    if (!isTyping && !isFinished && !isHistoryOpen) {
      setIsTyping(true)
      
      timerRef.current = window.setInterval(() => {
        useStore.setState(state => {
          if (state.config.mode === 'time' && state.stats.secElapsed >= 30) {
            // Need to wrap finishTest in a timeout because we are inside setState
            setTimeout(() => {
               finishTest()
            }, 0)
            return state
          }
          return {
            stats: { ...state.stats, secElapsed: state.stats.secElapsed + 1 }
          }
        })
      }, 1000)
    }
  }, [isTyping, isFinished, finishTest, isHistoryOpen])

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
      
      <div className={`w-full max-w-6xl px-8 flex flex-col h-full transition-opacity duration-500 ${isTyping ? 'opacity-10 hover:opacity-100' : 'opacity-100'}`}>
        <Header />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-8 flex flex-col items-center gap-12">
        
        {isFinished ? (
          <StatsPanel onRestart={initGame} />
        ) : (
          <>
            <div className={`absolute -top-16 left-8 font-mono text-2xl text-brand flex gap-6 transition-all duration-300 ${config.showRealtimeStats && isTyping ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span>{useStore.getState().calcWPM()} wpm</span>
              {config.mode === 'time' && (
                <span>{Math.max(0, 30 - stats.secElapsed)}s</span>
              )}
            </div>
            
            {/* Only render TypingArea if we have text (prevents flash of empty box) */}
            {currentText && (
              <TypingArea 
                text={currentText} 
                onStart={handleStartTyping}
                onFinish={finishTest}
              />
            )}
          </>
        )}
      </div>

      <div className={`absolute bottom-8 text-text-muted text-sm font-mono transition-opacity duration-500 ${isTyping && !isFinished ? 'opacity-0' : 'opacity-100'}`}>
        <span className="bg-bg-secondary px-2 py-1 rounded border border-neutral-800 text-brand">tab</span> to restart
      </div>
      
      <HistoryModal />
    </main>
  )
}

export default App
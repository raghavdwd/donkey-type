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
    // Determine how many words to generate based on mode and options
    // For time mode, generate plenty of words to avoid running out
    const generateWordCount = config.mode === 'words' ? config.wordsAmount : 200;

    if (config.ghostMode) {
      const bestRun = getBestGhostRun();
      if (bestRun && bestRun.textUsed) {
        setCurrentText(bestRun.textUsed);
      } else {
        setCurrentText(getRandomText(generateWordCount, config.language, config.difficulty));
      }
    } else {
      setCurrentText(getRandomText(generateWordCount, config.language, config.difficulty));
    }
    
    reset()
    setIsTyping(false)
    setIsFinished(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [config.mode, config.language, config.difficulty, config.ghostMode, config.timeAmount, config.wordsAmount, reset, setCurrentText, getBestGhostRun])

  useEffect(() => {
    initGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [config.mode, config.language, config.difficulty, config.ghostMode, config.timeAmount, config.wordsAmount]) 

  useEffect(() => {
    initGame()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsTyping(false)
    setIsFinished(true)
    useStore.getState().saveTestResult()
  }, [])

  const handleStartTyping = useCallback(() => {
    if (!isTyping && !isFinished && !isHistoryOpen) {
      setIsTyping(true)
      
      timerRef.current = window.setInterval(() => {
        useStore.setState(state => {
          // Check if time mode reached its target limit
          if (state.config.mode === 'time' && state.stats.secElapsed >= state.config.timeAmount) {
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
      
      <div className={`w-full max-w-6xl px-8 flex flex-col h-full transition-opacity duration-500 ${isTyping ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
                <span>{Math.max(0, config.timeAmount - stats.secElapsed)}s</span>
              )}
            </div>
            
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
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
    let generateWordCount = 200; // Default buffer for time mode
    if (config.mode === 'words') {
        if (config.wordUnit === 'words') {
            generateWordCount = config.wordsAmount;
        } else {
            // If they chose 'chars', we guess how many words that is (~5 chars per word)
            generateWordCount = Math.ceil(config.wordsAmount / 5) + 5; 
        }
    }

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
  }, [config.mode, config.language, config.difficulty, config.ghostMode, config.timeAmount, config.timeUnit, config.wordsAmount, config.wordUnit, reset, setCurrentText, getBestGhostRun])

  useEffect(() => {
    initGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [config.mode, config.language, config.difficulty, config.ghostMode, config.timeAmount, config.timeUnit, config.wordsAmount, config.wordUnit]) 

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
          // Time mode logic
          if (state.config.mode === 'time') {
              const multiplier = state.config.timeUnit === 'h' ? 3600 : state.config.timeUnit === 'm' ? 60 : 1;
              const targetSeconds = state.config.timeAmount * multiplier;
              
              if (state.stats.secElapsed >= targetSeconds) {
                setTimeout(() => {
                   finishTest()
                }, 0)
                return state
              }
          }
          return {
            stats: { ...state.stats, secElapsed: state.stats.secElapsed + 1 }
          }
        })
      }, 1000)
    }
  }, [isTyping, isFinished, finishTest, isHistoryOpen])

  // Subscribes to typing progress to end 'words' or 'chars' mode early if needed
  useEffect(() => {
      if (isTyping && config.mode === 'words') {
          if (config.wordUnit === 'chars' && stats.typedCharCount >= config.wordsAmount) {
              finishTest()
          } else if (config.wordUnit === 'words' && stats.wordCount >= config.wordsAmount) {
              finishTest()
          }
      }
  }, [stats.typedCharCount, stats.wordCount, isTyping, config.mode, config.wordUnit, config.wordsAmount, finishTest])


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

  const getTimeLeftDisplay = () => {
      const multiplier = config.timeUnit === 'h' ? 3600 : config.timeUnit === 'm' ? 60 : 1;
      const targetSeconds = config.timeAmount * multiplier;
      const left = Math.max(0, targetSeconds - stats.secElapsed);
      
      if (config.timeUnit === 's') return `${left}s`;
      const m = Math.floor(left / 60);
      const s = left % 60;
      if (config.timeUnit === 'm') return `${m}:${s.toString().padStart(2, '0')}`;
      const h = Math.floor(left / 3600);
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

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
                <span>{getTimeLeftDisplay()}</span>
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
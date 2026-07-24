import { useEffect, useState, useCallback, useRef } from 'react'
import TypingArea from './components/TypingArea'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import HistoryModal from './components/HistoryModal'
import useStore from './store'
import { getRandomWords, onWordsLoaded } from './lib/word-list'
import { getHindiText } from './lib/hindi-text'
import { getPunctuationText } from './lib/punctuation-text'
import {
  Keyboard,
  type KeyboardInteractionEvent,
} from './components/ui/keyboard'

function App() {
  const [isTyping, setIsTyping] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const {
    config,
    keyboard,
    stats,
    currentText,
    setCurrentText,
    reset,
    isHistoryOpen,
    getBestGhostRun,
  } = useStore()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme)
  }, [config.theme])

  const initGame = useCallback(async () => {
    let generateWordCount = 200
    if (config.mode === 'words' || config.mode === 'punctuation') {
      if (config.wordUnit === 'words') {
        generateWordCount = config.wordsAmount
      } else {
        generateWordCount = Math.ceil(config.wordsAmount / 5) + 5
      }
    }

    if (config.mode === 'punctuation') {
      const text = await getPunctuationText(config.punctuationDensity)
      setCurrentText(text)
    } else if (config.ghostMode) {
      const bestRun = getBestGhostRun()
      if (bestRun && bestRun.textUsed) {
        setCurrentText(bestRun.textUsed)
      } else if (config.language === 'hindi') {
        const text = await getHindiText()
        setCurrentText(text)
      } else {
        setCurrentText(
          getRandomWords(
            generateWordCount,
            config.difficulty,
            config.language,
          ).join(' '),
        )
      }
    } else if (config.language === 'hindi') {
      const text = await getHindiText()
      setCurrentText(text)
    } else {
      setCurrentText(
        getRandomWords(
          generateWordCount,
          config.difficulty,
          config.language,
        ).join(' '),
      )
    }

    reset()
    setIsTyping(false)
    setIsFinished(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [
    config.mode,
    config.language,
    config.difficulty,
    config.ghostMode,
    config.timeAmount,
    config.timeUnit,
    config.wordsAmount,
    config.wordUnit,
    config.punctuationDensity,
    config.punctuationEndMode,
    reset,
    setCurrentText,
    getBestGhostRun,
  ])

  useEffect(() => {
    initGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [
    config.mode,
    config.language,
    config.difficulty,
    config.ghostMode,
    config.timeAmount,
    config.timeUnit,
    config.wordsAmount,
    config.wordUnit,
    config.punctuationDensity,
    config.punctuationEndMode,
  ])

  useEffect(() => {
    onWordsLoaded(() => {
      initGame()
    })
  }, [initGame])

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsTyping(false)
    setIsFinished(true)
    const { saveTestResult } = useStore.getState()
    saveTestResult()
  }, [])

  const handleStartTyping = useCallback(() => {
    if (!isTyping && !isFinished && !isHistoryOpen) {
      setIsTyping(true)

      // The timer ticks once per second and owns the countdown for time mode.
      timerRef.current = window.setInterval(() => {
        useStore.setState((state) => {
          const shouldTimeOut =
            state.config.mode === 'time' ||
            (state.config.mode === 'punctuation' &&
              state.config.punctuationEndMode === 'time')

          if (shouldTimeOut) {
            const multiplier =
              state.config.timeUnit === 'h'
                ? 3600
                : state.config.timeUnit === 'm'
                  ? 60
                  : 1
            const targetSeconds = state.config.timeAmount * multiplier

            if (state.stats.secElapsed >= targetSeconds) {
              setTimeout(() => {
                finishTest()
              }, 0)
              return state
            }
          }
          return {
            stats: { ...state.stats, secElapsed: state.stats.secElapsed + 1 },
          }
        })
      }, 1000)
    }
  }, [isTyping, isFinished, finishTest, isHistoryOpen])

  // Subscribes to typing progress to end word/char-based modes early
  useEffect(() => {
    if (!isTyping) return

    if (
      (config.mode === 'words') ||
      (config.mode === 'punctuation' && config.punctuationEndMode === 'words')
    ) {
      if (
        config.wordUnit === 'chars' &&
        stats.typedCharCount >= config.wordsAmount
      ) {
        finishTest()
      } else if (
        config.wordUnit === 'words' &&
        stats.wordCount >= config.wordsAmount
      ) {
        finishTest()
      }
    }
  }, [
    stats.typedCharCount,
    stats.wordCount,
    isTyping,
    config.mode,
    config.wordUnit,
    config.wordsAmount,
    config.punctuationEndMode,
    finishTest,
  ])

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
    <main
      className={`h-screen w-full flex flex-col items-center bg-bg text-text selection:bg-brand/30 transition-colors duration-300 ${isTyping ? 'typing-active' : ''}`}
    >
      <div className="w-full max-w-6xl px-4 sm:px-8 flex flex-col h-full">
        <Header />
      </div>

      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-full max-w-5xl px-4 sm:px-8 flex flex-col items-center ${keyboard.display ? 'gap-25' : 'gap-18'}`}
      >
        {isFinished ? (
          <StatsPanel onRestart={initGame} />
        ) : (
          <>
            {currentText && (
              <TypingArea
                text={currentText}
                onStart={handleStartTyping}
                onFinish={finishTest}
              />
            )}
            {/* Keyboard is only shown when the test is active and not finished.
             * also user can disable it in the settings.
             */}
            {keyboard.display && (
              <Keyboard
                theme={keyboard.theme}
                language={config.language}
                enableHaptics={keyboard.enableHaptics}
                enableSound={keyboard.enableSound}
                onKeyEvent={(event: KeyboardInteractionEvent) => {
                  console.log(event.code, event.phase, event.source)
                }}
              />
            )}
          </>
        )}
      </div>

      <div
        className={`absolute bottom-8 text-text-muted text-sm font-mono transition-opacity duration-500 ${isTyping && !isFinished ? 'opacity-0' : 'opacity-100'}`}
      >
        <span className="bg-bg-secondary px-2 py-1 rounded border border-neutral-800 text-brand">
          tab
        </span>{' '}
        to restart
      </div>

      <HistoryModal />
    </main>
  )
}

export default App

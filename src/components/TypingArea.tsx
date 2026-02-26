import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import clsx from 'clsx'
import useStore from '../store'

interface IProps extends Omit<React.ComponentProps<'div'>, 'onFocus' | 'onBlur'> {
  text: string
  onStart: () => void
  onFinish: () => void
}

const TypingArea = ({ text, onStart, onFinish, ...props }: IProps) => {
  const [currWordIndex, setCurrWordIndex] = React.useState(0)
  const [currLetterIndex, setCurrLetterIndex] = React.useState(0)
  const [typos, setTypos] = React.useState(new Set<`${number},${number}`>())
  const [isFocused, setIsFocused] = React.useState(true) 
  
  // Ghost mode state
  const [ghostWordIndex, setGhostWordIndex] = useState(0)
  const [ghostLetterIndex, setGhostLetterIndex] = useState(0)
  const testStartTime = useRef<number>(0)
  const ghostTimerRef = useRef<number | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { config, incrStat, recordKeystroke, getBestGhostRun } = useStore()
  
  const ghostRun = useMemo(() => config.ghostMode ? getBestGhostRun() : null, [config.ghostMode, getBestGhostRun])
  const totalTypedChars = useRef(0)

  const playSound = useCallback((isError: boolean = false) => {
    if (!config.soundEnabled) return
    try {
      const audio = new Audio(isError 
        ? 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' 
        : 'https://actions.google.com/sounds/v1/foley/mechanical_keyboard_fast_typing.ogg')
      audio.volume = isError ? 0.1 : 0.2
      audio.play().catch(() => {})
    } catch (e) {}
  }, [config.soundEnabled])

  const words = text.split(' ')

  // Ghost Runner Logic
  useEffect(() => {
    if (testStartTime.current > 0 && ghostRun && ghostRun.keystrokes) {
      let currentIdx = 0
      
      const runGhost = () => {
        const now = Date.now() - testStartTime.current
        
        while (currentIdx < ghostRun.keystrokes.length && ghostRun.keystrokes[currentIdx].timestamp <= now) {
          const charPos = ghostRun.keystrokes[currentIdx].charIndex
          // Convert global charPos back to word/letter indices for rendering
          let count = 0
          let gWord = 0
          let gLet = 0
          
          for (let i = 0; i < words.length; i++) {
            if (count + words[i].length + 1 > charPos) {
              gWord = i
              gLet = charPos - count
              break
            }
            count += words[i].length + 1
          }
          
          setGhostWordIndex(gWord)
          setGhostLetterIndex(gLet)
          currentIdx++
        }
        
        if (currentIdx < ghostRun.keystrokes.length) {
          ghostTimerRef.current = requestAnimationFrame(runGhost)
        }
      }
      
      ghostTimerRef.current = requestAnimationFrame(runGhost)
      
      return () => {
        if (ghostTimerRef.current) cancelAnimationFrame(ghostTimerRef.current)
      }
    }
  }, [testStartTime.current, ghostRun, words])

  // Reset local state when text changes (new test)
  useEffect(() => {
    setCurrWordIndex(0)
    setCurrLetterIndex(0)
    setTypos(new Set())
    setGhostWordIndex(0)
    setGhostLetterIndex(0)
    testStartTime.current = 0
    totalTypedChars.current = 0
    if (ghostTimerRef.current) cancelAnimationFrame(ghostTimerRef.current)
    
    const focusTimer = setTimeout(() => {
      containerRef.current?.focus()
    }, 100)
    return () => clearTimeout(focusTimer)
  }, [text])

  useEffect(() => {
    const handleGlobalClick = () => containerRef.current?.focus()
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const currWord = words[currWordIndex] || ''
    
    if (e.key.length === 1 && currWordIndex === 0 && currLetterIndex === 0) {
      onStart()
      testStartTime.current = Date.now()
    }

    if (testStartTime.current > 0) {
        recordKeystroke(totalTypedChars.current, Date.now() - testStartTime.current)
    }

    if (e.key === 'Backspace') {
      playSound()
      if (currLetterIndex > 0) {
        setCurrLetterIndex((prev) => prev - 1)
        totalTypedChars.current = Math.max(0, totalTypedChars.current - 1)
        setTypos((prev) => {
          const newSet = new Set(prev)
          newSet.delete(`${currWordIndex},${currLetterIndex - 1}`)
          return newSet
        })
      } else if (currWordIndex > 0) {
        setCurrWordIndex(prev => prev - 1)
        const prevWordActual = words[currWordIndex - 1]
        setCurrLetterIndex(prevWordActual.length)
        totalTypedChars.current = Math.max(0, totalTypedChars.current - 1)
      }
      e.preventDefault()
      return
    }

    if (e.key === ' ') {
      playSound()
      if (currLetterIndex === 0) {
        e.preventDefault()
        return
      }
      
      if (currWordIndex === words.length - 1) {
        onFinish()
        return
      }

      setCurrWordIndex((prev) => prev + 1)
      setCurrLetterIndex(0)
      totalTypedChars.current += 1
      incrStat('wordCount')
      e.preventDefault()
      return
    }

    if (e.key.length === 1) {
      if (currLetterIndex < currWord.length + 5) {
        incrStat('typedCharCount')
        totalTypedChars.current += 1
        
        let isTypo = false
        if (currLetterIndex < currWord.length) {
          const expectedLetter = currWord[currLetterIndex]
          if (expectedLetter !== e.key) {
            isTypo = true
          }
        } else {
          isTypo = true
        }

        if (isTypo) {
          playSound(true)
          setTypos((prev) => new Set(prev).add(`${currWordIndex},${currLetterIndex}`))
          incrStat('typos')
        } else {
          playSound()
        }
        
        setCurrLetterIndex((prev) => prev + 1)
      }
      e.preventDefault()
    }
  }

  const translateY = Math.max(0, Math.floor(currWordIndex / 10)) * 48

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="textbox"
      tabIndex={0}
      className="flex flex-wrap focus:outline-none relative font-mono text-3xl leading-relaxed outline-none w-full max-h-[150px] overflow-hidden"
      {...props}
    >
      <div 
        className="flex flex-wrap transition-transform duration-300 ease-out w-full gap-x-4 gap-y-4"
        style={{ transform: `translateY(-${translateY}px)` }}
      >
        {words.map((word, widx) => {
          const isCurrWord = widx === currWordIndex
          const isPastWord = widx < currWordIndex
          const isGhostWord = config.ghostMode && widx === ghostWordIndex

          return (
            <div
              key={word + widx}
              className={clsx(
                'relative flex transition-all duration-200 rounded',
                isPastWord ? 'opacity-30' : 'opacity-100',
                isCurrWord && 'text-text'
              )}
            >
              {word.split('').map((letter, lidx) => {
                const isTypo = typos.has(`${widx},${lidx}`)
                const isTyped = isPastWord || (isCurrWord && lidx < currLetterIndex)
                
                return (
                  <span
                    key={letter + lidx}
                    className={clsx(
                      'transition-colors duration-100 relative',
                      !isTyped && 'text-text-muted', 
                      isTyped && !isTypo && 'text-text', 
                      isTypo && 'text-error border-b-2 border-error', 
                    )}
                  >
                    {letter}
                    
                    {/* User Caret */}
                    {isFocused && isCurrWord && lidx === currLetterIndex && (
                      <div className="absolute -left-[1px] top-1 bottom-1 w-[3px] bg-brand animate-blink rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
                    )}
                    
                    {/* Ghost Caret */}
                    {config.ghostMode && isGhostWord && lidx === ghostLetterIndex && (
                      <div className="absolute -left-[1px] top-1 bottom-1 w-[3px] bg-blue-500/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] z-20" />
                    )}
                  </span>
                )
              })}

              {isCurrWord && currLetterIndex >= word.length && Array.from({ length: currLetterIndex - word.length }).map((_, extraIdx) => (
                <span key={`extra-${extraIdx}`} className="text-error border-b-2 border-error opacity-70">
                  *
                </span>
              ))}

              {/* End of word carets */}
              {isFocused && isCurrWord && currLetterIndex >= word.length && (
                <div className="absolute -right-[2px] top-1 bottom-1 w-[3px] bg-brand animate-blink rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
              )}
              {config.ghostMode && isGhostWord && ghostLetterIndex >= word.length && (
                <div className="absolute -right-[2px] top-1 bottom-1 w-[3px] bg-blue-500/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] z-20" />
              )}
            </div>
          )
        })}
      </div>
      
      {!isFocused && (
        <div className="absolute inset-0 z-50 cursor-text flex items-center justify-center bg-bg/40 backdrop-blur-[2px] transition-all">
          <div className="bg-bg-secondary px-6 py-3 rounded-lg border border-neutral-700 shadow-xl text-text font-sans flex items-center gap-3">
            <span className="animate-pulse">Click here or press any key to focus</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TypingArea
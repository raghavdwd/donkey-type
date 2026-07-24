/*
 * Core typing test component. Handles: text display with color-coded chars,
 * keyboard input with typo detection, sound feedback, ghost mode replay,
 * smart scrolling, click-to-focus overlay, and Hindi grapheme support.
 */

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import clsx from 'clsx'
import useStore from '../store'
import { playKeySound } from '../lib/audio'

interface IProps extends Omit<
  React.ComponentProps<'div'>,
  'onFocus' | 'onBlur'
> {
  text: string
  onStart: () => void
  onFinish: () => void
}

const TypingArea = ({ text, onStart, onFinish, ...props }: IProps) => {
  const [currWordIndex, setCurrWordIndex] = React.useState(0)
  const [currLetterIndex, setCurrLetterIndex] = React.useState(0)
  const [typos, setTypos] = React.useState(new Set<`${number},${number}`>())
  const [isFocused, setIsFocused] = React.useState(true)
  const [ghostWordIndex, setGhostWordIndex] = useState(0)
  const [ghostLetterIndex, setGhostLetterIndex] = useState(0)

  const testStartTime = useRef<number>(0)
  const ghostTimerRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordsContainerRef = useRef<HTMLDivElement>(null)
  const [translateY, setTranslateY] = useState(0)
  const { config, incrStat, recordKeystroke, getBestGhostRun } = useStore()

  const ghostRun = useMemo(
    () => (config.ghostMode ? getBestGhostRun() : null),
    [config.ghostMode, getBestGhostRun],
  )

  const totalTypedChars = useRef(0)

  const audioCtx = useRef<AudioContext | null>(null)

  // Synthetic beep sounds via Web Audio API oscillators.
  // Error: sawtooth 150→100Hz, 100ms. Correct: sine 800→400Hz, 50ms.
  const playSyntheticSound = useCallback(
    (isError: boolean = false) => {
      if (!config.soundEnabled) return

      try {
         if (!audioCtx.current) {
          const AudioCtor =
            window.AudioContext || (window as any).webkitAudioContext
          audioCtx.current = new AudioCtor({ latencyHint: 'interactive' })
        }

        const ctx = audioCtx.current

        if (ctx.state === 'suspended') {
          void ctx.resume()
        }

        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        // Play immediately — no latency offset (that would add delay).
        const when = ctx.currentTime

        if (isError) {
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(150, when)
          osc.frequency.exponentialRampToValueAtTime(100, when + 0.1)

          gainNode.gain.setValueAtTime(0.2, when)
          gainNode.gain.exponentialRampToValueAtTime(0.01, when + 0.1)

          osc.start(when)
          osc.stop(when + 0.1)
        } else {
          osc.type = 'sine'
          osc.frequency.setValueAtTime(800, when)
          osc.frequency.exponentialRampToValueAtTime(400, when + 0.05)

          gainNode.gain.setValueAtTime(0.1, when)
          gainNode.gain.exponentialRampToValueAtTime(0.01, when + 0.05)

          osc.start(when)
          osc.stop(when + 0.05)
        }
      } catch (e) {
        console.error('Audio API error:', e)
      }
    },
    [config.soundEnabled],
  )

  const words = text.split(' ')

  // Intl.Segmenter for grapheme clusters (needed for Devanagari/Hindi support).
  const segmenter = useMemo(
    () =>
      new Intl.Segmenter(config.language === 'hindi' ? 'hi' : 'en', {
        granularity: 'grapheme',
      }),
    [config.language],
  )

  const wordGraphemes = useMemo(() => {
    return words.map((word) =>
      Array.from(segmenter.segment(word)).map((s) => s.segment),
    )
  }, [words, segmenter])

  // Ghost mode: animates a blue caret at the pace of the user's best previous run.
  useEffect(() => {
    if (testStartTime.current > 0 && ghostRun && ghostRun.keystrokes) {
      let currentIdx = 0

      const runGhost = () => {
        const now = Date.now() - testStartTime.current

        while (
          currentIdx < ghostRun.keystrokes.length &&
          ghostRun.keystrokes[currentIdx].timestamp <= now
        ) {
          const charPos = ghostRun.keystrokes[currentIdx].charIndex
          let count = 0
          let gWord = 0
          let gLet = 0

          for (let i = 0; i < wordGraphemes.length; i++) {
            if (count + wordGraphemes[i].length + 1 > charPos) {
              gWord = i
              gLet = charPos - count
              break
            }
            count += wordGraphemes[i].length + 1
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
  }, [testStartTime.current, ghostRun, wordGraphemes])

  // Reset all state when text changes (new test).
  useEffect(() => {
    setCurrWordIndex(0)
    setCurrLetterIndex(0)
    setTypos(new Set())
    setGhostWordIndex(0)
    setGhostLetterIndex(0)
    setTranslateY(0)
    testStartTime.current = 0
    totalTypedChars.current = 0
    if (ghostTimerRef.current) cancelAnimationFrame(ghostTimerRef.current)

    const focusTimer = setTimeout(() => {
      containerRef.current?.focus()
    }, 100)
    return () => clearTimeout(focusTimer)
  }, [text])

  // Global click handler: focus typing area unless clicking interactive elements.
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        ['INPUT', 'BUTTON', 'A', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('a')
      ) {
        return
      }
      containerRef.current?.focus()
    }
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  // Smart scroll: keeps current word near the top of the container.
  useEffect(() => {
    if (!wordsContainerRef.current) return

    const activeWordEl = wordsContainerRef.current.querySelector(
      '[data-active="true"]',
    ) as HTMLElement
    if (!activeWordEl) return

    const offsetTop = activeWordEl.offsetTop

    if (offsetTop > 60) {
      setTranslateY(offsetTop - 8)
    } else if (offsetTop < 10 && translateY > 0) {
      setTranslateY(Math.max(0, translateY - 48))
    }
  }, [currWordIndex, translateY])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ignore browser shortcut modifiers.
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const currWordChars = wordGraphemes[currWordIndex] || []

    // First keystroke starts the test.
    if (e.key.length === 1 && currWordIndex === 0 && currLetterIndex === 0) {
      onStart()
      testStartTime.current = Date.now()
    }

    // Record every keystroke for chart data and ghost mode replay.
    if (testStartTime.current > 0) {
      recordKeystroke(
        totalTypedChars.current,
        Date.now() - testStartTime.current,
      )
    }

    if (e.key === 'Backspace') {
      playKeySound(e.nativeEvent.code)
      if (currLetterIndex > 0) {
        setCurrLetterIndex((prev) => prev - 1)
        totalTypedChars.current = Math.max(0, totalTypedChars.current - 1)
        setTypos((prev) => {
          const newSet = new Set(prev)
          newSet.delete(`${currWordIndex},${currLetterIndex - 1}`)
          return newSet
        })
      } else if (currWordIndex > 0) {
        setCurrWordIndex((prev) => prev - 1)
        const prevWordActual = wordGraphemes[currWordIndex - 1]
        setCurrLetterIndex(prevWordActual.length)
        totalTypedChars.current = Math.max(0, totalTypedChars.current - 1)
      }
      e.preventDefault()
      return
    }

    if (e.key === ' ') {
      playKeySound(e.nativeEvent.code)

      if (currLetterIndex === 0) {
        e.preventDefault()
        return
      }

      if (currWordIndex === wordGraphemes.length - 1) {
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
      // Allow up to 5 extra characters past word end (for over-typing).
      if (currLetterIndex < currWordChars.length + 5) {
        incrStat('typedCharCount')
        totalTypedChars.current += 1

        let isTypo = false
        if (currLetterIndex < currWordChars.length) {
          const expectedChar = currWordChars[currLetterIndex]
          if (expectedChar !== e.key) {
            isTypo = true
          }
        } else {
          isTypo = true
        }

        if (isTypo) {
          playSyntheticSound(true)
          setTypos((prev) =>
            new Set(prev).add(`${currWordIndex},${currLetterIndex}`),
          )
          incrStat('typos')
        } else {
          playKeySound(e.nativeEvent.code)
        }

        setCurrLetterIndex((prev) => prev + 1)
      }
      e.preventDefault()
    }
  }
  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="textbox"
      tabIndex={0}
      className={clsx(
        'flex flex-wrap focus:outline-none relative font-mono text-3xl leading-relaxed outline-none w-full max-h-43 overflow-hidden',
        config.language === 'hindi' ? 'font-sans' : 'font-mono',
      )}
      {...props}
    >
      <div
        ref={wordsContainerRef}
        className="flex flex-wrap transition-transform duration-300 ease-out w-full gap-x-4 gap-y-4"
        style={{ transform: `translateY(-${translateY}px)` }}
      >
        {wordGraphemes.map((wordChars, widx) => {
          const isCurrWord = widx === currWordIndex
          const isPastWord = widx < currWordIndex
          const isGhostWord = config.ghostMode && widx === ghostWordIndex

          return (
            <div
              key={widx}
              data-active={isCurrWord}
              className={clsx(
                'relative flex transition-all duration-200 rounded',
                isPastWord ? 'opacity-30' : 'opacity-100',
                isCurrWord && 'text-text',
              )}
            >
              {wordChars.map((char, lidx) => {
                const isTypo = typos.has(`${widx},${lidx}`)
                const isTyped =
                  isPastWord || (isCurrWord && lidx < currLetterIndex)

                return (
                  <span
                    key={lidx}
                    className={clsx(
                      'transition-colors duration-100 relative',
                      !isTyped && 'text-text-muted',
                      isTyped && !isTypo && 'text-text',
                      isTypo && 'text-error border-b-2 border-error',
                    )}
                  >
                    {char}

                    {/* Yellow blinking user caret */}
                    {isFocused && isCurrWord && lidx === currLetterIndex && (
                      <div className="absolute -left-px top-1 bottom-1 w-0.75 bg-brand animate-blink rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
                    )}

                    {/* Semi-transparent blue ghost caret */}
                    {config.ghostMode &&
                      isGhostWord &&
                      lidx === ghostLetterIndex && (
                        <div className="absolute -left-px top-1 bottom-1 w-0.75 bg-blue-500/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] z-20" />
                      )}
                  </span>
                )
              })}

              {/* Overflow typo indicators (red asterisks) */}
              {isCurrWord &&
                currLetterIndex >= wordChars.length &&
                Array.from({ length: currLetterIndex - wordChars.length }).map(
                  (_, extraIdx) => (
                    <span
                      key={`extra-${extraIdx}`}
                      className="text-error border-b-2 border-error opacity-70"
                    >
                      *
                    </span>
                  ),
                )}

              {/* End-of-word caret (past all chars, waiting for space) */}
              {isFocused &&
                isCurrWord &&
                currLetterIndex >= wordChars.length && (
                  <div className="absolute -right-[2px] top-1 bottom-1 w-[3px] bg-brand animate-blink rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
                )}

              {/* Ghost end-of-word caret */}
              {config.ghostMode &&
                isGhostWord &&
                ghostLetterIndex >= wordChars.length && (
                  <div className="absolute -right-[2px] top-1 bottom-1 w-[3px] bg-blue-500/50 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] z-20" />
                )}
            </div>
          )
        })}
      </div>

      {/* Unfocused overlay */}
      {!isFocused && (
        <div className="absolute inset-0 z-50 cursor-text flex items-center justify-center bg-bg/40 backdrop-blur-[2px] transition-all">
          <div className="bg-bg-secondary px-6 py-3 rounded-lg border border-neutral-700 shadow-xl text-text font-sans flex items-center gap-3">
            <span className="animate-pulse">
              Click here or press any key to focus
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TypingArea

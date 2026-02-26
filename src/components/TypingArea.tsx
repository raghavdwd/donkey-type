import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import useStore from '../store'

interface IProps extends React.ComponentProps<'div'> {
  text: string
  onStart: () => void
  onFinish: () => void
}

const TypingArea = ({ text, onStart, onFinish, ...props }: IProps) => {
  const [currWordIndex, setCurrWordIndex] = React.useState(0)
  const [currLetterIndex, setCurrLetterIndex] = React.useState(0)
  const [typos, setTypos] = React.useState(new Set<`${number},${number}`>())
  const [history, setHistory] = React.useState<Record<string, string>>({})
  
  const containerRef = useRef<HTMLDivElement>(null)
  const { incrStat } = useStore()
  
  const words = text.split(' ')

  // Auto-focus on mount
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ignore modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const currWord = words[currWordIndex] || ''
    
    // Start game on first valid keypress
    if (e.key.length === 1 && currWordIndex === 0 && currLetterIndex === 0) {
      onStart()
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      if (currLetterIndex > 0) {
        setCurrLetterIndex((prev) => prev - 1)
        setTypos((prev) => {
          const newSet = new Set(prev)
          newSet.delete(`${currWordIndex},${currLetterIndex - 1}`)
          return newSet
        })
      } else if (currWordIndex > 0) {
        // Go back to previous word if we're at the start of current word
        setCurrWordIndex(prev => prev - 1)
        // Find where we were in the previous word (at the end of whatever was typed)
        const prevWordActual = words[currWordIndex - 1]
        // This is a simplified fallback - we just put caret at the end of the expected word
        setCurrLetterIndex(prevWordActual.length)
      }
      e.preventDefault()
      return
    }

    // Handle Space (next word)
    if (e.key === ' ') {
      // Prevent rapid spacing
      if (currLetterIndex === 0) {
        e.preventDefault()
        return
      }
      
      if (currWordIndex === words.length - 1) {
        // Last word finished
        onFinish()
        return
      }

      setCurrWordIndex((prev) => prev + 1)
      setCurrLetterIndex(0)
      incrStat('wordCount')
      e.preventDefault()
      return
    }

    // Handle printable characters
    if (e.key.length === 1) {
      // Don't allow typing infinitely past word length
      if (currLetterIndex < currWord.length + 5) {
        incrStat('typedCharCount')
        
        // Check for typo against expected letter
        if (currLetterIndex < currWord.length) {
          const expectedLetter = currWord[currLetterIndex]
          if (expectedLetter !== e.key) {
            setTypos((prev) => new Set(prev).add(`${currWordIndex},${currLetterIndex}`))
            incrStat('typos')
          }
        } else {
          // Extra characters typed are automatically typos
          setTypos((prev) => new Set(prev).add(`${currWordIndex},${currLetterIndex}`))
          incrStat('typos')
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
      role="textbox"
      tabIndex={0}
      className="flex flex-wrap focus:outline-none relative font-mono text-3xl leading-relaxed outline-none w-full max-h-[160px] overflow-hidden"
      {...props}
    >
      {/* Blurry vignette overlay to keep focus on current text */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-bg via-transparent to-bg z-20" />

      <div 
        className="flex flex-wrap transition-transform duration-300 ease-out w-full gap-x-3 gap-y-4"
        style={{ transform: `translateY(-${Math.max(0, Math.floor(currWordIndex / 15)) * 48}px)` }}
      >
        {words.map((word, widx) => {
          const isCurrWord = widx === currWordIndex
          const isPastWord = widx < currWordIndex

          return (
            <div
              key={word + widx}
              className={clsx(
                'relative flex transition-all duration-200 rounded',
                isPastWord ? 'opacity-50' : 'opacity-100',
                isCurrWord && 'text-text'
              )}
            >
              {/* Word characters */}
              {word.split('').map((letter, lidx) => {
                const isTypo = typos.has(`${widx},${lidx}`)
                const isTyped = isPastWord || (isCurrWord && lidx < currLetterIndex)
                
                return (
                  <span
                    key={letter + lidx}
                    className={clsx(
                      'transition-colors duration-100 relative',
                      !isTyped && 'text-text-muted', // Not typed yet
                      isTyped && !isTypo && 'text-text', // Typed correct
                      isTypo && 'text-error border-b-2 border-error', // Typed incorrect
                    )}
                  >
                    {letter}
                    
                    {/* Caret */}
                    {isCurrWord && lidx === currLetterIndex && (
                      <div className="absolute -left-[1px] bottom-0 w-[3px] h-full bg-brand animate-blink rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
                    )}
                  </span>
                )
              })}

              {/* Handle extra characters typed past word length */}
              {isCurrWord && currLetterIndex >= word.length && Array.from({ length: currLetterIndex - word.length }).map((_, extraIdx) => (
                <span key={`extra-${extraIdx}`} className="text-error border-b-2 border-error opacity-70">
                  {/* Using a dot or actual tracked extra char here if we mapped it, for now just generic error mark */}
                  *
                </span>
              ))}

              {/* Caret at end of word */}
              {isCurrWord && currLetterIndex >= word.length && (
                <div className="absolute -right-[2px] bottom-0 w-[3px] h-full bg-brand animate-blink rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)] z-30" />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Click to focus overlay */}
      <div className="absolute inset-0 z-50 cursor-text group flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-bg-secondary/90 px-4 py-2 rounded-lg border border-neutral-800 backdrop-blur-sm text-sm text-text-muted">
          Click to focus
        </div>
      </div>
    </div>
  )
}

export default TypingArea
import React from 'react'
import clsx from 'clsx'

interface IProps extends React.ComponentProps<'div'> {
  // Add any additional props if needed
  text: string
}

const TypingArea = ({ text, ...props }: IProps) => {
  const [currWordIndex, setCurrWordIndex] = React.useState(0)
  const [currLetterIndex, setCurrLetterIndex] = React.useState(0)
  const [typos, setTypos] = React.useState(new Set<`${number},${number}`>())
  const words = text.split(' ')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    //handle delete only until the beginning of the current word
    if (e.key === 'Backspace') {
      //agar current letter index is greater than 0, move back and remove typo if exists
      if (currLetterIndex > 0) {
        setCurrLetterIndex((prev) => prev - 1)
        setTypos((prev) => {
          const newSet = new Set(prev)
          newSet.delete(`${currWordIndex},${currLetterIndex - 1}`)
          return newSet
        })
      }
      e.preventDefault()
      return
    }
    const currWord = words[currWordIndex] || ''
    const typedLetter = e.key
    //word complete: handle space key
    if (e.key === ' ') {
      // Only move to next word if at the end of the current word
      if (currLetterIndex === currWord.length) {
        setCurrWordIndex((prev) => prev + 1)
        setCurrLetterIndex(0)
      }
      e.preventDefault()
      return
    }
    if (e.key.length === 1 && currLetterIndex < currWord.length) {
      setCurrLetterIndex((prev) => prev + 1)
    }
    //typos checking
    if (currWord[currLetterIndex] != typedLetter) {
      setTypos((prev) => prev.add(`${currWordIndex},${currLetterIndex}`))
    }

    //prevent default behavior for all keys to avoid unwanted side effects
    if (e.key.length === 1) {
      e.preventDefault()
    }
  }
  return (
    <div
      onKeyDown={handleKeyDown}
      role="textbox"
      tabIndex={0}
      className="flex flex-wrap focus:outline-none relative font-mono text-3xl"
      {...props}
    >
      {words.map((word, widx) => {
        const isCurrWord = widx === currWordIndex
        return (
          <div
            key={word + widx}
            className={clsx(
              'z-10 relative px-2.5 py-1 rounded-md transition-all',
              widx > currWordIndex && 'text-red-400',
              widx < currWordIndex && 'bg-orange-300 text-gray-800',
            )}
          >
            {word.split('').map((letter, lidx) => {
              const isTypo = typos.has(`${widx},${lidx}`)
              const isCorrect = isCurrWord && lidx < currLetterIndex && !isTypo
              return (
                <span
                  key={letter + lidx}
                  className={clsx(
                    isTypo && 'text-red-500',
                    isCorrect && 'text-sky-400',
                  )}
                >
                  {letter}
                </span>
              )
            })}
            {/* current word indicator */}
            <div
              className={clsx(
                'absolute transition-all inset-0 bg-neutral-800 rounded-md -z-10 origin-left',
                isCurrWord ? 'scale-x-100' : 'scale-x-0',
              )}
            />
            {/* cursor/ caret animation */}
            {isCurrWord && (
              <span
                className={clsx(
                  'transition-all duration-100 rounded ease-linear absolute h-9 left-1.5 w-0.5 bg-yellow-500 top-1',
                )}
                style={{ left: `${8 + currLetterIndex * 18.15}px` }}
              />
            )}
            {/* spacebar indicator */}
            {isCurrWord && word.length > 0 && (
              <div
                className={clsx(
                  'absolute top-0 -right-2 transition-opacity duration-500 bg-neutral-600 h-full px-2 rounded ',
                  currLetterIndex === word.length ? 'opacity-50' : 'opacity-0',
                )}
              ></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default TypingArea

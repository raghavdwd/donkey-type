import React from 'react'
import clsx from 'clsx'

interface IProps extends React.ComponentProps<'div'> {
  // Add any additional props if needed
  text: string
}

const TypingArea = ({ text, ...props }: IProps) => {
  const [currWordIndex, setCurrWordIndex] = React.useState(0)
  const [currLetterIndex, setCurrLetterIndex] = React.useState(0)
  const words = text.split('')
  return (
    <div
      className="flex flex-wrap focus:outline-none relative font-mono text-3xl"
      {...props}
    >
      {words.map((word, i) => (
        <div
          key={word + i}
          className={clsx(
            'z-10 relative px-2.5 py-1 rounded-md transition-all',
          )}
        >
          {word}
        </div>
      ))}
    </div>
  )
}

export default TypingArea

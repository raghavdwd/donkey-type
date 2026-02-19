import { useEffect, useState } from 'react'
import TypingArea from './components/TypingArea'
import { getRandomText } from './data'

function App() {
  const [practiceText, setPracticeText] = useState('')
  useEffect(() => {
    setPracticeText(getRandomText())
  }, [])
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center bg-neutral-900 text-white">
      <TypingArea text={practiceText} />
    </main>
  )
}

export default App

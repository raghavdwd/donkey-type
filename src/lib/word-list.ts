// Use a mutable array for internal storage
let words: string[] = []
let onLoadCallbacks: (() => void)[] = []

export const onWordsLoaded = (callback: () => void) => {
  if (words.length > 0) {
    callback()
  } else {
    onLoadCallbacks.push(callback)
  }
}

// Fetch words asynchronously
fetch('/words.txt')
  .then((response) => response.text())
  .then((text) => {
    words = text
      .split('\n')
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
    console.log('Words loaded:', words.length)
    onLoadCallbacks.forEach((cb) => cb())
    onLoadCallbacks = []
  })
  .catch((error) => {
    console.error('Error loading words:', error)
  })

export const getRandomWords = (
  count: number,
  difficulty: string,
  language: string,
): string[] => {
  language = language.toLowerCase()
  // For now, we only have English words, so if it's not English, we return an empty array
  if (language !== 'english' || words.length === 0) {
    return []
  }

  let filteredWords = words
  if (difficulty === 'easy') {
    filteredWords = words.filter((word) => word.length <= 4)
  } else if (difficulty === 'medium') {
    filteredWords = words.filter((word) => word.length > 4 && word.length <= 7)
  } else if (difficulty === 'hard') {
    filteredWords = words.filter((word) => word.length > 7)
  }

  // Fallback if no words match the difficulty criteria perfectly yet
  if (filteredWords.length === 0) {
    filteredWords = words
  }

  const randomWords = []
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * filteredWords.length)
    randomWords.push(filteredWords[randomIndex])
  }
  return randomWords
}

/*
 * Loads the master word list from /words.txt (~275k English words, one per line).
 * Uses fetch() on module load; other modules register callbacks via onWordsLoaded
 * to know when words are available.
 *
 * Difficulty is word-length based: easy ≤ 4, medium 5-7, hard ≥ 8 chars.
 * Only English is supported here; Hindi uses static pools in data.ts.
 */

let words: string[] = []
let onLoadCallbacks: (() => void)[] = []

/** Register a callback to run when the word list is ready (or immediately if already loaded). */
export const onWordsLoaded = (callback: () => void) => {
  if (words.length > 0) {
    callback()
  } else {
    onLoadCallbacks.push(callback)
  }
}

// Kick off the fetch immediately on module import.
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

/**
 * Returns an array of randomly selected words filtered by difficulty.
 * Falls back to the full word list if filtering yields nothing.
 */
export const getRandomWords = (
  count: number,
  difficulty: string,
  language: string,
): string[] => {
  language = language.toLowerCase()

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

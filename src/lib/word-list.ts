/*
 * word-list.ts
 * 
 * This file is responsible for loading the master word list from the server
 * and providing functions to get random words for the typing test based on
 * difficulty and language.
 * 
 * We load the word list from a text file (/words.txt) that contains over
 * 275,000 English words - one word per line. This gives us a much larger
 * and more diverse vocabulary than the static word arrays in data.ts.
 * 
 * The loading happens asynchronously using fetch(), which means the words
 * might not be available immediately when the app starts. To handle this,
 * we use a callback system - other parts of the app can register callbacks
 * that will run once the words are loaded.
 * 
 * IMPORTANT NOTE: Currently, this file only supports English words.
 * The Hindi word support comes from the static arrays in data.ts.
 * Filtering by difficulty is based on word length:
 *   - Easy: 1-4 characters
 *   - Medium: 5-7 characters
 *   - Hard: 8+ characters
 */

/*
 * We store the loaded words in a mutable array (let instead of const)
 * because the array starts empty and gets filled when the fetch completes.
 * Using 'let' allows us to reassign the entire array.
 */
let words: string[] = []

/*
 * This array stores callback functions that should be called when the
 * words finish loading. Multiple parts of the app can register callbacks,
 * and they will all be called in order when the data arrives.
 * After the callbacks are called, this array is cleared.
 */
let onLoadCallbacks: (() => void)[] = []

/*
 * onWordsLoaded
 * 
 * This function lets other parts of the app register a callback that
 * will run when the word list is ready.
 * 
 * If the words have already been loaded (the words array has items),
 * the callback runs immediately. Otherwise, it gets added to the queue
 * and will run later when the fetch completes.
 * 
 * This is important because the fetch in App.tsx needs to know when
 * the words are ready so it can initialize the game with real words.
 * 
 * @param callback - A function to call when words are available
 */
export const onWordsLoaded = (callback: () => void) => {
  /*
   * If words are already loaded (array length > 0), we can run the
   * callback right away. This handles the case where the fetch completed
   * before the component mounted.
   */
  if (words.length > 0) {
    callback()
  } else {
    /*
     * If words aren't loaded yet, we add the callback to the queue.
     * All queued callbacks will be executed once the fetch completes.
     */
    onLoadCallbacks.push(callback)
  }
}

/*
 * ASYNC WORD LOADING
 * 
 * We immediately start fetching the word list from the server.
 * This fetch happens as soon as this module is imported (which is when
 * the app starts), so the download begins right away rather than waiting
 * for the user to start a typing test.
 * 
 * The fetch() function is a browser API that makes HTTP requests.
 * It returns a Promise, which is JavaScript's way of handling asynchronous
 * operations. We chain .then() calls to handle the response.
 * 
 * Step 1: Fetch the file from the server
 * Step 2: Convert the response to text
 * Step 3: Split the text into individual words (one per line)
 * Step 4: Trim whitespace and filter out empty lines
 * Step 5: Call all the registered callbacks
 * 
 * If anything goes wrong (network error, file not found, etc.),
 * we catch the error and log it to the console.
 */
fetch('/words.txt')
  .then((response) => response.text())
  .then((text) => {
    /*
     * The file has one word per line, so we split by newline character.
     * We trim each word to remove any extra whitespace (spaces, tabs, etc.)
     * and filter out any empty strings that might result from blank lines.
     */
    words = text
      .split('\n')
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
    
    /*
     * Log how many words we loaded so we can verify the file is being
     * read correctly. With the full words.txt file, this should show
     * around 275,000 words.
     */
    console.log('Words loaded:', words.length)
    
    /*
     * Now that the words are loaded, we call all the registered callbacks.
     * This lets other parts of the app (like App.tsx) know that they can
     * start generating typing text from the real word list.
     * After calling all callbacks, we clear the array so they don't run again.
     */
    onLoadCallbacks.forEach((cb) => cb())
    onLoadCallbacks = []
  })
  .catch((error) => {
    /*
     * If the fetch fails (network issue, server problem, etc.),
     * we log the error. The app will continue to work using the
     * fallback word arrays from data.ts while the words are empty.
     */
    console.error('Error loading words:', error)
  })

/*
 * getRandomWords
 * 
 * This is the main function used by the app to generate typing text.
 * It returns an array of randomly selected words based on the requested
 * count, difficulty level, and language.
 * 
 * The function filters the master word list by word length to match
 * the difficulty level:
 *   - 'easy': words with 1-4 characters
 *   - 'medium': words with 5-7 characters
 *   - 'hard': words with 8+ characters
 * 
 * If the filtering results in an empty array (which can happen with
 * some difficulty/word list combinations), we fall back to the full
 * unfiltered word list so the user still gets words to type.
 * 
 * @param count - How many random words to return
 * @param difficulty - 'easy', 'medium', or 'hard'
 * @param language - The language (only 'english' is supported currently)
 * @returns An array of randomly selected words
 */
export const getRandomWords = (
  count: number,
  difficulty: string,
  language: string,
): string[] => {
  /*
   * Normalize the language to lowercase to handle any case variations.
   */
  language = language.toLowerCase()
  
  /*
   * Currently we only have English words from the server-side word list.
   * If the language is not English, or if the words haven't loaded yet
   * (words array is empty), we return an empty array. The caller in App.tsx
   * should handle this by falling back to data.ts's getRandomText().
   */
  if (language !== 'english' || words.length === 0) {
    return []
  }

  /*
   * Filter the word list based on difficulty (word length):
   * - Easy: Words that are 4 characters or shorter
   * - Medium: Words that are 5-7 characters long
   * - Hard: Words that are more than 7 characters long
   * 
   * This is a simplistic approach but works well enough for a typing test.
   * Shorter words are generally easier to type because they require
   * less finger movement and are more common.
   */
  let filteredWords = words
  if (difficulty === 'easy') {
    filteredWords = words.filter((word) => word.length <= 4)
  } else if (difficulty === 'medium') {
    filteredWords = words.filter((word) => word.length > 4 && word.length <= 7)
  } else if (difficulty === 'hard') {
    filteredWords = words.filter((word) => word.length > 7)
  }

  /*
   * If the filter resulted in an empty array (which can happen with certain
   * word lists or edge cases), we fall back to the full word list so the
   * test can still generate text. This prevents an infinite loop or crash.
   */
  if (filteredWords.length === 0) {
    filteredWords = words
  }

  /*
   * Now we randomly pick 'count' words from the filtered list.
   * We use Math.random() to generate random indices and Math.floor()
   * to convert them to valid array indices.
   * Each word is pushed into the result array one by one.
   */
  const randomWords = []
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * filteredWords.length)
    randomWords.push(filteredWords[randomIndex])
  }
  return randomWords
}

/*
 * data.ts
 * 
 * This file contains the static word pools that we use as a fallback when
 * the main word list hasn't finished loading from the server yet.
 * We have words for two languages (English and Hindi) and three difficulty
 * levels (easy, medium, hard) for each language.
 * 
 * The actual word list is loaded asynchronously from the /words.txt file
 * (see lib/word-list.ts for that), but until it finishes loading, we use
 * these built-in word arrays so the user can start typing right away.
 * These are also used when we're testing or when the network request fails.
 */

/*
 * ENGLISH WORDS - Easy difficulty
 * 
 * These are the most common English words. They are all very short (1-4 characters)
 * and are words that even beginners can type quickly.
 * Words like "the", "be", "of", "and", "a", "to" are among the most frequently
 * used words in the English language. This list was carefully chosen to include
 * 50 of the most common English words that are also easy to type.
 */
const enEasy = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
  "that", "for", "they", "I", "with", "as", "not", "on", "she", "at",
  "by", "this", "we", "you", "do", "but", "from", "or", "which", "one",
  "would", "all", "will", "there", "say", "who", "make", "when", "can", "more",
  "if", "no", "man", "out", "other", "so", "what", "time", "up", "go"
]

/*
 * ENGLISH WORDS - Medium difficulty
 * 
 * These are intermediate-length English words (5-7 characters).
 * They are common enough that most typists know them, but long enough
 * to require some finger movement. Words like "develop", "consider",
 * "without", "however" are everyday words that intermediate typists
 * should be comfortable with.
 */
const enMedium = [
  "develop", "consider", "without", "however", "system", "increase",
  "general", "because", "program", "problem", "present", "nation",
  "course", "against", "interest", "govern", "possible", "public",
  "school", "become", "through", "between", "another", "something",
  "business", "student", "country", "company", "provide", "service",
  "always", "number", "group", "family", "fact", "water"
]

/*
 * ENGLISH WORDS - Hard difficulty
 * 
 * These are long, complex, and often tricky English words.
 * They include words with unusual spellings (like "pneumonia" which starts
 * with a silent 'p'), double letters ("embarrass", "accommodate"),
 * and uncommon letter combinations ("rhythm" has no vowels!).
 * These words are designed to challenge even experienced typists.
 */
const enHard = [
  "pneumonia", "labyrinth", "miscellaneous", "chrysanthemum",
  "unprecedented", "rhythm", "embarrass", "fluorescent", "accommodate",
  "occurrence", "consensus", "pharaoh", "bourgeois", "camouflage",
  "conscientious", "ecstasy", "fascinating", "guarantee", "hypocrisy",
  "liaison", "millennium", "paraphernalia", "pronunciation", "questionnaire",
  "reminisce", "susceptible", "unanimous", "symmetrical", "maneuver",
  "mischievous", "nauseous", "hierarchy", "entrepreneur", "bureaucracy"
]

/*
 * HINDI WORDS - Easy difficulty
 * 
 * Hindi is an Indo-Aryan language spoken mainly in India.
 * These are common Hindi words that are short and commonly used in daily conversation.
 * Words like "और" (and), "है" (is), "का" (of), "कि" (that) are the Hindi equivalents
 * of the easy English words above.
 */
const hiEasy = [
  "और", "है", "का", "कि", "यह", "एक", "में", "को", "नहीं", "से",
  "लिए", "पर", "तो", "भी", "ही", "जो", "कर", "हो", "क्या", "था",
  "साथ", "हम", "आप", "मुझे", "जब", "अब", "वह", "दिन", "न", "काम",
  "आ", "आज", "यह", "वे", "गए", "गई"
]

/*
 * HINDI WORDS - Medium difficulty
 * 
 * Intermediate Hindi words that are longer and more specific.
 * These include conjunctions and common verbs/nouns that Hindi speakers
 * use regularly. Words like "लेकिन" (but), "अपने" (our/own), "किया" (did).
 */
const hiMedium = [
  "लेकिन", "अपने", "किया", "तथा", "वाले", "दिया", "कहा", "उन्हें",
  "कहना", "होने", "यहाँ", "वहाँ", "बहुत", "सकते", "अगर", "समय",
  "जैसे", "जाता", "सभी", "तरह", "उनके", "जाते", "करते", "कभी",
  "चाहिए", "कारण", "क्यों", "इसलिए", "क्योंकि", "जिससे", "हमेशा",
  "शायद", "केवल", "बल्कि", "चाहते"
]

/*
 * HINDI WORDS - Hard difficulty
 * 
 * These are complex, multi-syllable Hindi words that are challenging to type.
 * They include formal/technical terms like "अंतर्राष्ट्रीय" (international),
 * "विश्वविद्यालय" (university), "प्रौद्योगिकी" (technology).
 * These words have many characters and require precise typing.
 */
const hiHard = [
  "अंतर्राष्ट्रीय", "परिस्थिति", "महत्वपूर्ण", "जिम्मेदारी", "संभावना",
  "विश्वविद्यालय", "प्रौद्योगिकी", "आविष्कार", "निर्णय", "स्वतंत्रता",
  "प्रशासनिक", "दृष्टिकोण", "प्रतिस्पर्धा", "सकारात्मक", "निम्नलिखित",
  "विशेषता", "आवश्यकता", "आध्यात्मिक", "संस्थागत", "पारंपरिक",
  "आर्थिक", "संविधान", "अधिकार", "निष्कर्ष", "वैज्ञानिक", "विश्लेषण",
  "परिवर्तनशील", "उल्लेखनीय"
]

/*
 * getRandomText
 * 
 * This function generates a random string of words for the typing test.
 * It takes three parameters:
 *   count - How many words to generate (default: 50)
 *   language - Which language to use: 'english' or 'hindi' (default: 'english')
 *   difficulty - How hard the words should be: 'easy', 'medium', or 'hard' (default: 'medium')
 * 
 * It works by:
 * 1. Selecting the correct word pool based on language and difficulty
 * 2. Randomly picking words from that pool the specified number of times
 * 3. Joining them together with spaces into a single string
 * 
 * The function returns the text as a single string with words separated by spaces.
 * This is the text that the user will see and try to type.
 */
export const getRandomText = (
  count: number = 50,
  language: 'english' | 'hindi' = 'english',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) => {
  /*
   * First we decide which array of words to pick from based on the
   * language and difficulty settings. We use a series of ternary operators
   * (which are like shorthand if-else statements) to select the right pool.
   */
  let pool: string[] = [];
  if (language === 'english') {
    /*
     * If the language is English, we pick from one of the three
     * English word arrays based on the difficulty level.
     */
    pool =
      difficulty === 'easy'
        ? enEasy
        : difficulty === 'medium'
        ? enMedium
        : enHard;
  } else {
    /*
     * If the language is Hindi, we pick from one of the three
     * Hindi word arrays instead. The same difficulty levels apply.
     */
    pool =
      difficulty === 'easy'
        ? hiEasy
        : difficulty === 'medium'
        ? hiMedium
        : hiHard;
  }

  /*
   * Now we build the text string by randomly picking words from our selected pool.
   * We use a simple for loop that runs 'count' times.
   * Each iteration picks a random word using Math.random() and Math.floor().
   * Math.random() gives us a number between 0 and 1, and Math.floor() rounds down,
   * so Math.floor(Math.random() * pool.length) gives us a random array index.
   * We add a space after each word, and then trim the final result to remove
   * the trailing space.
   */
  let text = ''
  for (let i = 0; i < count; i++) {
    text += pool[Math.floor(Math.random() * pool.length)] + ' '
  }
  return text.trim()
}

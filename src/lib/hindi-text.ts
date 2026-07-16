/**
 * hindi-text.ts
 *
 * Provides Hindi sentences/paragraphs for typing practice.
 *
 * Strategy:
 * 1. Try fetching a random Hindi Wikipedia article summary via API
 * 2. If that fails (offline/rate-limited), fall back to a static corpus
 *
 * Wikipedia API returns clean plain text via `explaintext=true`,
 * which is ideal for typing practice — real Hindi prose with
 * proper punctuation and spacing.
 */

const WIKIPEDIA_API =
  'https://hi.wikipedia.org/w/api.php?action=query' +
  '&generator=random&grnnamespace=0&grnlimit=3' +
  '&prop=extracts&exintro=true&explaintext=true' +
  '&format=json&origin=*'

// ── Static fallback corpus ───────────────────────────────────────────────
// Used when the Wikipedia fetch fails or the user is offline.

const FALLBACK_PARAGRAPHS: string[] = [
  `भारत एक महान देश है। यहाँ विभिन्न संस्कृतियों और भाषाओं के लोग रहते हैं। भारत का इतिहास बहुत पुराना है। यह देश अपनी विविधता में एकता के लिए जाना जाता है। यहाँ अनेक त्योहार मनाए जाते हैं। दीवाली, होली, दशहरा और ईद जैसे त्योहार सभी लोग मिलकर मनाते हैं। भारत की राजधानी दिल्ली है और यहाँ की मुद्रा रुपया है। गंगा नदी को भारत की सबसे पवित्र नदी माना जाता है। ताजमहल विश्व के सात अजूबों में से एक है। भारतीय संस्कृति अपनी मेहमाननवाजी के लिए प्रसिद्ध है। यहाँ के लोग मेहमान को भगवान का रूप मानते हैं। भारत में अनेक भाषाएं बोली जाती हैं जिनमें हिंदी सबसे अधिक बोली जाने वाली भाषा है।`,

  `शिक्षा का हमारे जीवन में बहुत महत्व है। यह हमें सही और गलत में अंतर करना सिखाती है। शिक्षा से हमारा ज्ञान बढ़ता है और हम आत्मनिर्भर बनते हैं। प्रत्येक बच्चे को शिक्षा का अधिकार है। हमारे देश में शिक्षा को सबसे महत्वपूर्ण माना जाता है। माता-पिता अपने बच्चों को अच्छी शिक्षा दिलाने के लिए कड़ी मेहनत करते हैं। शिक्षा केवल किताबी ज्ञान तक सीमित नहीं है बल्कि यह जीवन के हर पहलू को समझने में मदद करती है। अच्छी शिक्षा हमें एक अच्छा नागरिक बनाती है।`,

  `प्रकृति हमें जीवन के लिए आवश्यक सभी चीजें देती है। हवा, पानी, भोजन और आश्रय सभी प्रकृति के उपहार हैं। हमें प्रकृति की रक्षा करनी चाहिए। पेड़ लगाना और उनकी देखभाल करना हमारा कर्तव्य है। प्रकृति के बिना मनुष्य का जीवन संभव नहीं है। पहाड़, नदियाँ, झीलें और जंगल प्रकृति की अद्भुत रचनाएं हैं। हमें अपने आसपास के वातावरण को स्वच्छ रखना चाहिए। प्रकृति के संतुलन को बनाए रखना बहुत जरूरी है क्योंकि यह हमारे जीवन का आधार है।`,

  `समय का सदुपयोग करना चाहिए। समय कभी किसी की प्रतीक्षा नहीं करता। जो व्यक्ति समय का सही उपयोग करता है वह जीवन में सफल होता है। समय का महत्व समझना हर किसी के लिए आवश्यक है। हमें अपने कार्यों को समय पर पूरा करने की आदत डालनी चाहिए। विलंब करने की आदत हमें हमारे लक्ष्यों से दूर ले जाती है। समय का सही प्रबंधन ही सफलता की कुंजी है। छोटी-छोटी बातों का ध्यान रखकर हम अपने समय का अधिकतम लाभ उठा सकते हैं। समय सबसे बहुमूल्य चीज है क्योंकि खोया हुआ समय कभी वापस नहीं आता।`,

  `मनुष्य एक सामाजिक प्राणी है। वह अकेला नहीं रह सकता। उसे दूसरों की सहायता की आवश्यकता होती है। परिवार और समाज हमारे जीवन का अभिन्न हिस्सा हैं। हमें दूसरों के साथ मिलकर रहना चाहिए और उनकी मदद करनी चाहिए। आपसी सहयोग और भाईचारा ही एक स्वस्थ समाज की नींव है। सभी धर्मों का सम्मान करना चाहिए। मनुष्य को सदैव सत्य और अहिंसा के मार्ग पर चलना चाहिए। दूसरों के साथ वैसा ही व्यवहार करना चाहिए जैसा हम अपने लिए चाहते हैं। यही मानवता का सबसे बड़ा संदेश है।`,

  `हमारा शरीर हमारी सबसे बड़ी पूंजी है। स्वस्थ शरीर में ही स्वस्थ मस्तिष्क निवास करता है। हमें नियमित व्यायाम करना चाहिए और संतुलित भोजन लेना चाहिए। अच्छी नींद हमारे स्वास्थ्य के लिए बहुत जरूरी है। तनाव से दूर रहना और सकारात्मक सोच रखना स्वस्थ जीवन के लिए आवश्यक है। योग और ध्यान हमारे शरीर और मन को स्वस्थ रखने में मदद करते हैं। स्वच्छता का ध्यान रखना भी बहुत जरूरी है क्योंकि गंदगी से कई बीमारियां फैलती हैं। अपने स्वास्थ्य का ध्यान रखना हमारी सबसे पहली जिम्मेदारी है।`,

  `विज्ञान ने मानव जीवन को बहुत सरल बना दिया है। आज हम बिजली, कंप्यूटर, मोबाइल फोन और इंटरनेट जैसी चीजों के बिना जीवन की कल्पना भी नहीं कर सकते। चिकित्सा विज्ञान ने अनेक बीमारियों का इलाज खोज लिया है। अंतरिक्ष विज्ञान ने चांद और मंगल तक पहुंचा दिया है। आधुनिक तकनीक ने संचार को बहुत आसान बना दिया है। हम दुनिया के किसी भी कोने में बैठे व्यक्ति से तुरंत बात कर सकते हैं। विज्ञान के कारण ही आज हम इतने सारे आरामदायक जीवन जी रहे हैं। हालांकि विज्ञान के दुरुपयोग से बचना भी उतना ही जरूरी है।`,

  `पुस्तकें हमारी सबसे अच्छी मित्र होती हैं। वे हमें ज्ञान देती हैं और हमारा मनोरंजन भी करती हैं। एक अच्छी पुस्तक हमारे जीवन को बदल सकती है। पढ़ने की आदत हर व्यक्ति को विकसित करनी चाहिए। पुस्तकें हमें विभिन्न विषयों पर जानकारी देती हैं। वे हमारी कल्पना शक्ति को बढ़ाती हैं और हमारी भाषा को सुधारती हैं। नियमित पढ़ने से हमारा ज्ञान बढ़ता है और हम अधिक बुद्धिमान बनते हैं। पुस्तकालय से किताबें लेकर पढ़ना एक अच्छी आदत है। सभी को अपने दिन का कुछ समय पढ़ने के लिए निकालना चाहिए। एक व्यक्ति जितना अधिक पढ़ता है उतना ही अधिक सीखता है।`,

  `सपने देखना अच्छी बात है लेकिन उन्हें पूरा करने के लिए कड़ी मेहनत भी जरूरी है। सफलता पाने के लिए धैर्य और लगन की आवश्यकता होती है। बड़े-बड़े वैज्ञानिकों और आविष्कारकों ने कड़ी मेहनत से ही सफलता पाई है। असफलता से घबराना नहीं चाहिए बल्कि उससे सीख लेनी चाहिए। असफलता ही सफलता की सीढ़ी है। हर गलती हमें कुछ न कुछ सिखाती है। जो व्यक्ति कड़ी मेहनत करता है वह एक दिन जरूर सफल होता है। इसलिए हमेशा आगे बढ़ने का प्रयास करते रहना चाहिए और कभी हार नहीं माननी चाहिए।`,

  `दोस्ती एक अनमोल रिश्ता है। सच्चा दोस्त हर मुश्किल घड़ी में काम आता है। दोस्ती में विश्वास और ईमानदारी का बहुत महत्व है। अच्छे दोस्त हमारे जीवन को खुशहाल बनाते हैं। हम अपने दोस्तों के साथ अपनी खुशियाँ और दुख बांटते हैं। दोस्त ही हैं जो हमें मुश्किल समय में संभालते हैं और सही रास्ता दिखाते हैं। सच्ची दोस्ती कभी पुरानी नहीं होती बल्कि समय के साथ और मजबूत होती जाती है। इसलिए अच्छे दोस्त बनाने चाहिए और उनकी कद्र करनी चाहिए। जीवन में सच्चे दोस्तों का होना बहुत बड़ा सौभाग्य है।`,
]

const FALLBACK_SENTENCES: string[] = [
  'कड़ी मेहनत का कोई विकल्प नहीं है।',
  'सफलता का रास्ता हमेशा कठिन होता है।',
  'धैर्य और लगन से हर काम संभव है।',
  'अपने सपनों का पीछा करना कभी मत छोड़ो।',
  'गलतियों से सीखो और आगे बढ़ो।',
  'जीवन में सकारात्मक सोच बहुत जरूरी है।',
  'दूसरों की मदद करना सबसे बड़ा पुण्य है।',
  'सच बोलना हमेशा अच्छा होता है चाहे वह कड़वा ही क्यों न हो।',
  'समय बहुत कीमती है इसलिए इसका सदुपयोग करो।',
  'अपने माता-पिता का सम्मान करो।',
  'नियमित पढ़ाई से ही सफलता मिलती है।',
  'स्वास्थ्य ही सबसे बड़ी संपत्ति है।',
  'प्रकृति का संरक्षण करना हमारा कर्तव्य है।',
  'एकता में ही ताकत है।',
  'सच्ची मित्रता अनमोल होती है।',
  'हार मानने वाले कभी जीत नहीं पाते।',
  'जीतने वाले कभी हार नहीं मानते।',
  'कल करो आज करो आज का काम आज ही करो।',
  'जैसा बोओगे वैसा काटोगे।',
  'करत करत अभ्यास के जड़मति होत सुजान।',
  'दूसरों के साथ वैसा व्यवहार करो जैसा तुम अपने लिए चाहते हो।',
  'शिक्षा ही सबसे शक्तिशाली हथियार है जिससे दुनिया बदली जा सकती है।',
  'जहाँ चाह वहाँ राह।',
  'उद्यमिन्न हि सिद्ध्यन्ति कार्याणि न मनोरथैः।',
  'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।',
  'वसुधैव कुटुम्बकम का अर्थ है पूरी दुनिया एक परिवार है।',
  'अहिंसा परमो धर्मः का अर्थ है अहिंसा सबसे बड़ा धर्म है।',
  'सत्यमेव जयते नानृतम का अर्थ है सत्य की ही जीत होती है झूठ की नहीं।',
  'पढ़ोगे लिखोगे तो बनोगे नवाब नहीं पढ़ोगे तो मिट जाओगे।',
  'संयम और अनुशासन सफलता की कुंजी है।',
]

// ── Wikipedia API ────────────────────────────────────────────────────────

async function fetchFromWikipedia(): Promise<string[]> {
  try {
    const response = await fetch(WIKIPEDIA_API)
    if (!response.ok) throw new Error(`Wikipedia API returned ${response.status}`)

    const data = await response.json()
    const pages: Record<string, { extract?: string }> = data?.query?.pages
    if (!pages) throw new Error('No pages returned from Wikipedia')

    const extracts: string[] = Object.values(pages)
      .map((p: { extract?: string }) => p.extract)
      .filter((e): e is string => !!e && e.length > 100)

    if (extracts.length === 0) throw new Error('No usable extracts')
    return extracts
  } catch (err) {
    console.warn('Failed to fetch Hindi Wikipedia content:', err)
    return []
  }
}

// ── Text processing ──────────────────────────────────────────────────────

/**
 * Splits text into sentences and builds paragraphs up to a target length.
 * Filters out unwanted content like section headers, URLs, and markup.
 */
function cleanAndChunk(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      // Skip empty lines, section headers, URLs
      if (!line) return false
      if (line.startsWith('=')) return false
      if (line.startsWith('http')) return false
      if (line.startsWith('{{')) return false
      if (line.startsWith('#')) return false
      if (line.startsWith('*')) return false
      if (line.startsWith(';')) return false
      if (line.startsWith(':')) return false
      // Must have at least 3 Devanagari characters to be useful
      const devanagari = line.match(/[\u0900-\u097F]/g)
      return devanagari && devanagari.length >= 3
    })
}

/**
 * Picks a random paragraph from the static fallback corpus.
 */
function pickRandomFallback(): string {
  const idx = Math.floor(Math.random() * FALLBACK_PARAGRAPHS.length)
  return FALLBACK_PARAGRAPHS[idx]
}

/**
 * Builds a typing text from Wikipedia extracts.
 * Combines multiple short extracts, or returns the full first one.
 */
function buildTextFromExtracts(extracts: string[]): string | null {
  if (extracts.length === 0) return null

  // Use all extracts combined
  const cleaned = extracts.flatMap(cleanAndChunk)
  if (cleaned.length === 0) return null

  // Join with double newline for paragraph breaks
  return cleaned.join('\n\n')
}

/**
 * Picks a random short sentence from the single-sentence fallback list.
 * These are short enough for a quick test or for word-mode practice.
 */
function pickRandomSentence(): string {
  const idx = Math.floor(Math.random() * FALLBACK_SENTENCES.length)
  return FALLBACK_SENTENCES[idx]
}

// ── Caching ──────────────────────────────────────────────────────────────
// Keep a cached text so the user doesn't hit the API every time they restart.
// Refreshes after 5 minutes.

let cachedText: string | null = null
let lastFetchTime = 0
const CACHE_TTL_MS = 5 * 60 * 1000

/**
 * getHindiText
 *
 * Main entry point. Returns a paragraph of Hindi text for typing practice.
 *
 * Strategy:
 * 1. Use cached text if fresh (< 5 min old)
 * 2. Try fetching from Wikipedia API
 * 3. Fall back to static corpus
 *
 * @param minLength - Minimum number of characters desired (default: 200)
 * @returns A Hindi text string
 */
export async function getHindiText(minLength = 200): Promise<string> {
  // 1. Check cache
  const now = Date.now()
  if (cachedText && now - lastFetchTime < CACHE_TTL_MS && cachedText.length >= minLength) {
    return cachedText
  }

  // 2. Try Wikipedia
  const extracts = await fetchFromWikipedia()
  const wikiText = extracts.length > 0 ? buildTextFromExtracts(extracts) : null

  if (wikiText && wikiText.length >= minLength) {
    cachedText = wikiText
    lastFetchTime = now
    return wikiText
  }

  // 3. Fallback — use static corpus, maybe combine with sentences
  const paragraph = pickRandomFallback()
  // If the paragraph is too short, pad with a sentence
  const result = paragraph.length >= minLength ? paragraph : paragraph + ' ' + pickRandomSentence()

  // Still cache it (don't spam Wikipedia on every restart)
  if (!cachedText) {
    cachedText = result
    lastFetchTime = now
  }

  return result
}

/**
 * getHindiSentences
 *
 * Returns an array of individual Hindi sentences (for word-mode style testing
 * where each "word" is actually a full sentence, though the app treats them
 * as continuous text).
 *
 * @param count - Number of sentences desired
 * @returns Array of Hindi sentences
 */
export function getHindiSentences(count: number): string[] {
  const shuffled = [...FALLBACK_SENTENCES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

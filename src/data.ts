const englishWords = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for",
  "they", "I", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you",
  "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say",
  "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so",
  "what", "time", "up", "go", "about", "than", "into", "could", "state", "only",
  "new", "year", "some", "take", "come", "these", "know", "see", "use", "get",
  "like", "then", "first", "any", "work", "now", "may", "such", "give", "over",
  "think", "most", "even", "find", "day", "also", "after", "way", "many", "must",
  "look", "before", "great", "back", "through", "long", "where", "much", "should",
  "well", "people", "down", "own", "just", "because", "good", "each", "those",
  "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still",
  "nation", "hand", "old", "life", "tell", "write", "become", "here", "show",
  "house", "both", "between", "need", "mean", "call", "develop", "under", "last",
  "right", "move", "thing", "general", "school", "never", "same", "another",
  "begin", "while", "number", "part", "turn", "real", "leave", "might", "want",
  "point", "form", "off", "child", "few", "small", "since", "against", "ask",
  "late", "home", "interest", "large", "person", "end", "open", "public", "follow",
  "during", "present", "without", "again", "hold", "govern", "around", "possible",
  "head", "consider", "word", "program", "problem", "however", "lead", "system",
  "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play",
  "stand", "increase", "early", "course", "change", "help", "line"
]

const hindiWords = [
  "और", "है", "का", "कि", "यह", "एक", "में", "को", "नहीं", "से", "लिए", "पर", "तो", "भी", "ही", 
  "जो", "कर", "हो", "क्या", "था", "साथ", "लेकिन", "अपने", "किया", "बात", "कुछ", "करना", "कोई", 
  "हुए", "गया", "तक", "होता", "हम", "आप", "तथा", "मुझे", "बाद", "वाले", "दिया", "कहा", "जब", "अब", 
  "उन", "उन्हें", "कहना", "होने", "दो", "यहाँ", "वहाँ", "बहुत", "गई", "थे", "वह", "लोग", "सकते", 
  "अगर", "समय", "उस", "उसी", "पास", "जैसे", "जाता", "गए", "कम", "सभी", "तरह", "उनके", "जा", 
  "जाते", "करते", "तय", "कभी", "इन", "उसकी", "उनका", "वाला", "वाली", "चाहिए", "कारण", "क्यों", 
  "होती", "बार", "दिन", "न", "काम", "आ", "आज", "जाती", "आदि", "कहते", "दे", "देने", "देता", "ले", 
  "लेने", "लेता", "फिर", "रहे", "रही", "रहा", "मेरा", "मेरी", "मेरे", "पहले", "ऐसे", "ऐसी", "ऐसा"
]

export const getRandomText = (count: number = 50, language: 'english' | 'hindi' = 'english') => {
  const wordList = language === 'hindi' ? hindiWords : englishWords;
  let text = ''
  for (let i = 0; i < count; i++) {
    text += wordList[Math.floor(Math.random() * wordList.length)] + ' '
  }
  return text.trim()
}
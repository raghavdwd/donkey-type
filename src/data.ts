const enEasy = ["the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go"]
const enMedium = ["develop", "consider", "without", "however", "system", "increase", "general", "because", "program", "problem", "present", "nation", "course", "against", "interest", "govern", "possible", "public", "school", "become", "through", "between", "another", "something", "business", "student", "country", "company", "provide", "service", "always", "number", "group", "family", "fact", "water"]
const enHard = ["pneumonia", "labyrinth", "miscellaneous", "chrysanthemum", "unprecedented", "rhythm", "embarrass", "fluorescent", "accommodate", "occurrence", "consensus", "pharaoh", "bourgeois", "camouflage", "conscientious", "ecstasy", "fascinating", "guarantee", "hypocrisy", "liaison", "millennium", "paraphernalia", "pronunciation", "questionnaire", "reminisce", "susceptible", "unanimous", "symmetrical", "maneuver", "mischievous", "nauseous", "hierarchy", "entrepreneur", "bureaucracy"]

const hiEasy = ["और", "है", "का", "कि", "यह", "एक", "में", "को", "नहीं", "से", "लिए", "पर", "तो", "भी", "ही", "जो", "कर", "हो", "क्या", "था", "साथ", "हम", "आप", "मुझे", "जब", "अब", "वह", "दिन", "न", "काम", "आ", "आज", "यह", "वे", "गए", "गई"]
const hiMedium = ["लेकिन", "अपने", "किया", "तथा", "वाले", "दिया", "कहा", "उन्हें", "कहना", "होने", "यहाँ", "वहाँ", "बहुत", "सकते", "अगर", "समय", "जैसे", "जाता", "सभी", "तरह", "उनके", "जाते", "करते", "कभी", "चाहिए", "कारण", "क्यों", "इसलिए", "क्योंकि", "जिससे", "हमेशा", "शायद", "केवल", "बल्कि", "चाहते"]
const hiHard = ["अंतर्राष्ट्रीय", "परिस्थिति", "महत्वपूर्ण", "जिम्मेदारी", "संभावना", "विश्वविद्यालय", "प्रौद्योगिकी", "आविष्कार", "निर्णय", "स्वतंत्रता", "प्रशासनिक", "दृष्टिकोण", "प्रतिस्पर्धा", "सकारात्मक", "निम्नलिखित", "विशेषता", "आवश्यकता", "आध्यात्मिक", "संस्थागत", "पारंपरिक", "आर्थिक", "संविधान", "अधिकार", "निष्कर्ष", "वैज्ञानिक", "विश्लेषण", "परिवर्तनशील", "उल्लेखनीय"]

export const getRandomText = (count: number = 50, language: 'english' | 'hindi' = 'english', difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
  let pool: string[] = [];
  if (language === 'english') {
      pool = difficulty === 'easy' ? enEasy : difficulty === 'medium' ? enMedium : enHard;
  } else {
      pool = difficulty === 'easy' ? hiEasy : difficulty === 'medium' ? hiMedium : hiHard;
  }

  let text = ''
  for (let i = 0; i < count; i++) {
    text += pool[Math.floor(Math.random() * pool.length)] + ' '
  }
  return text.trim()
}
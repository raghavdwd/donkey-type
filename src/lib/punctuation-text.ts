/*
 * punctuation-text.ts
 *
 * Static text pools for punctuation mode, organised by density.
 * Each pool contains ~6 long paragraphs with naturally appropriate punctuation
 * for that density — no fetching, no filtering needed.
 *
 * Easy:   mostly periods and commas, simple declarative sentences
 * Medium: periods, commas, exclamation marks, question marks, colons, semicolons
 * Hard:   full range including quotes, parentheses, em-dashes
 */

const EASY_TEXTS: string[] = [
  `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It is often used for typing practice. Typists enjoy testing their speed with this phrase. Many people find it surprisingly challenging. The key is to maintain a steady rhythm while typing. Practice makes perfect, and speed and accuracy both matter for good typing skills.`,

  `Reading is one of the most beneficial habits a person can develop. Books open doors to new worlds and new perspectives. They allow us to experience lives we have never lived. Reading strengthens our vocabulary, comprehension, and writing skills. It also improves our ability to focus and to concentrate. Studies show that regular reading reduces stress, increases empathy, and strengthens the mind. Children who read frequently perform better in school.`,

  `Regular exercise offers numerous health benefits. It strengthens the heart and improves circulation. Physical activity helps maintain a healthy weight. Exercise releases endorphins which boost mood and reduce stress. It also improves sleep quality and increases energy levels. Building muscle through resistance training protects against injury. Even moderate activity, like walking, has significant health benefits. Consistency matters more than intensity for lasting results.`,

  `Photography is a powerful medium for capturing moments in time. A great photograph tells a story without using words. Understanding composition rules, like the rule of thirds, improves image quality. Lighting is the single most important element of photography. The golden hour, just after sunrise or before sunset, provides beautiful natural light. Modern smartphones, tablets, and cameras have made photography accessible to everyone.`,

  `History provides valuable lessons for the present and future. Ancient civilizations, such as Rome and Greece, laid the foundation for modern society. The Industrial Revolution transformed economies, industries, and social structures. World wars reshaped international relations and national boundaries. The civil rights movement advanced equality and justice for millions. Studying history helps us understand the roots of current conflicts.`,

  `Learning a new language is a challenging but rewarding endeavor. It opens up opportunities for travel, work, and cultural exchange. Bilingual individuals often have better cognitive flexibility and problem solving skills. Language learning requires consistent practice, patience, and exposure. Immersion is widely considered the most effective approach. Modern apps and online resources have made language learning more accessible than ever.`,
]

const MEDIUM_TEXTS: string[] = [
  `Technology has transformed the way we live and work! Computers have become an essential part of modern life. The internet connects people across the globe in an instant. Artificial intelligence is reshaping entire industries: machine learning algorithms can now recognize faces and understand speech. Autonomous cars are being tested on public roads! The pace of technological change continues to accelerate. What will the next decade bring? We can only imagine what innovations await us.`,

  `Music has been an integral part of human culture for thousands of years. It can evoke powerful emotions, create lasting memories, and bring people together. Different genres appeal to different personalities and moods. Learning to play an instrument develops discipline and coordination. Music therapy is used to treat various mental health conditions. The rhythm and melody of music activate multiple areas of the brain. Live performances create a unique connection between artists and audiences!`,

  `Space exploration has expanded our understanding of the universe. The Apollo missions landed humans on the Moon for the first time. Robotic probes have visited every planet in our solar system. The Hubble Space Telescope has captured stunning images of distant galaxies. Private companies are now developing reusable rockets for commercial spaceflight. Mars remains the primary target for future human exploration. Are we alone in the universe? Scientists continue to search for signs of life beyond Earth.`,

  `Cooking is both an art and a science. Understanding basic techniques, like knife skills and heat control, is more important than following recipes. Fresh ingredients make a significant difference in the final dish. Seasoning food correctly requires practice, patience, and attention to detail. The best chefs understand how flavors complement and contrast with each other. Sharing a meal with friends and family brings people together. What is your favorite dish to cook?`,

  `Climate change is one of the most pressing issues facing humanity. Global temperatures have risen significantly over the past century. Extreme weather events are becoming more frequent and severe. Rising sea levels threaten coastal communities around the world. Scientists agree that human activities are the primary cause. Reducing carbon emissions requires changes in energy production and consumption. Renewable energy sources, like solar and wind, are becoming more affordable. We must act now; the future of our planet depends on it!`,

  `The human brain is an incredibly complex organ. It contains approximately eighty six billion neurons. Each neuron connects to thousands of others, forming vast networks that process information. The brain consumes about twenty percent of the energy of the body. It can process information at remarkable speeds. Neuroscientists are still discovering new things about how it works. Memory formation, recall, and learning remain active areas of research. How does consciousness emerge from neural activity? This question continues to fascinate researchers.`,
]

const HARD_TEXTS: string[] = [
  `Technology has transformed the way we live — computers, smartphones, and the internet are now essential parts of modern life. Artificial intelligence is reshaping entire industries: machine learning algorithms can recognize faces, understand speech, and even create art. "The pace of change is accelerating," says one expert, "and we must adapt quickly." Autonomous cars are being tested on public roads. What will the next decade bring? We can only imagine what innovations await us.`,

  `Music has been an integral part of human culture for thousands of years; it can evoke powerful emotions and create lasting memories. Different genres appeal to different personalities and moods. Learning to play an instrument develops discipline and coordination. Music therapy — a growing field — is used to treat various mental health conditions including depression and anxiety. The rhythm and melody of music activate multiple areas of the brain simultaneously.`,

  `Space exploration has expanded our understanding of the universe in profound ways. The Apollo missions landed humans on the Moon; robotic probes have visited every planet in our solar system. The Hubble Space Telescope has captured stunning images of distant galaxies. Private companies (SpaceX, Blue Origin, and others) are now developing reusable rockets for commercial spaceflight. Mars remains the primary target for future human exploration. Are we alone in the universe? Scientists continue to search for signs of life beyond Earth.`,

  `Cooking is both an art and a science: understanding basic techniques matters more than following recipes. Fresh ingredients make a significant difference in the final dish. Proper knife skills improve efficiency and safety in the kitchen. The best chefs understand how flavors complement and contrast with each other — sweet, salty, sour, bitter, and umami all play important roles. Cooking for others is a deeply rewarding experience.`,

  `Climate change remains one of the most pressing issues facing humanity today. Global temperatures have risen significantly over the past century; extreme weather events are becoming more frequent and severe. Rising sea levels threaten coastal communities around the world. Scientists agree that human activities — particularly the burning of fossil fuels — are the primary cause. "We must act now," activists urge, "for the future of our planet depends on it."`,

  `The human brain is an incredibly complex organ containing approximately eighty six billion neurons. Each neuron connects to thousands of others, forming vast networks that process information at remarkable speeds. The brain consumes about twenty percent of the energy of the body despite accounting for only two percent of its weight. Memory formation, emotional regulation, and consciousness (perhaps the greatest mystery of all) remain active areas of research.`,
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const TEXTS_BY_DENSITY: Record<string, string[]> = {
  easy: EASY_TEXTS,
  medium: MEDIUM_TEXTS,
  hard: HARD_TEXTS,
}

/**
 * Returns a randomly chosen paragraph for the given punctuation density.
 * The returned text already contains the appropriate punctuation for that
 * density — no filtering is performed.
 */
export function getPunctuationText(
  density: 'easy' | 'medium' | 'hard' = 'medium',
  _minLength?: number,
): string {
  const pool = TEXTS_BY_DENSITY[density]
  return pickRandom(pool)
}

import { describe, it, expect } from 'vitest'
import { getPunctuationText } from './punctuation-text'

// ---------------------------------------------------------------------------
// getPunctuationText returns text from the correct density pool
// ---------------------------------------------------------------------------
describe('getPunctuationText density pools', () => {
  it('returns a non-empty string for easy density', () => {
    const text = getPunctuationText('easy')
    expect(text).toBeTruthy()
    expect(text.length).toBeGreaterThan(50)
  })

  it('returns a non-empty string for medium density', () => {
    const text = getPunctuationText('medium')
    expect(text).toBeTruthy()
    expect(text.length).toBeGreaterThan(50)
  })

  it('returns a non-empty string for hard density', () => {
    const text = getPunctuationText('hard')
    expect(text).toBeTruthy()
    expect(text.length).toBeGreaterThan(50)
  })
})

// ---------------------------------------------------------------------------
// Easy text contains only . and , — no ! ? ; : ' " ( ) —
// ---------------------------------------------------------------------------
describe('easy density text quality', () => {
  it('contains only periods and commas as punctuation', () => {
    // Run multiple times to increase coverage across the pool
    for (let i = 0; i < 20; i++) {
      const text = getPunctuationText('easy')
      const disallowed = [...text].filter((ch) => /[!?;:'"()—\-]/.test(ch))
      expect(disallowed.length).toBe(0)
    }
  })

  it('contains periods', () => {
    const text = getPunctuationText('easy')
    expect(text).toContain('.')
  })

  it('contains commas', () => {
    const text = getPunctuationText('easy')
    expect(text).toContain(',')
  })
})

// ---------------------------------------------------------------------------
// Medium text contains . , ! ? ; : but not quotes, parens, or dashes
// ---------------------------------------------------------------------------
describe('medium density text quality', () => {
  it('contains only .,!?;: as punctuation', () => {
    for (let i = 0; i < 20; i++) {
      const text = getPunctuationText('medium')
      const hardOnly = [...text].filter((ch) => /['"()—\-]/.test(ch))
      expect(hardOnly.length).toBe(0)
    }
  })

  it('contains periods and commas', () => {
    const text = getPunctuationText('medium')
    expect(text).toContain('.')
    expect(text).toContain(',')
  })

  it('contains exclamation or question marks', () => {
    // At least some paragraphs in the medium pool have ! or ?
    const found = Array.from({ length: 30 }, () => {
      const t = getPunctuationText('medium')
      return /[!?]/.test(t)
    })
    expect(found.some(Boolean)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Hard text contains the full punctuation range
// ---------------------------------------------------------------------------
describe('hard density text quality', () => {
  it('contains quotes', () => {
    const found = Array.from({ length: 30 }, () => {
      const t = getPunctuationText('hard')
      return /['"]/.test(t)
    })
    expect(found.some(Boolean)).toBe(true)
  })

  it('contains em-dashes or parentheses', () => {
    const found = Array.from({ length: 30 }, () => {
      const t = getPunctuationText('hard')
      return /[()—]/.test(t)
    })
    expect(found.some(Boolean)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// All texts are substantial (300+ chars)
// ---------------------------------------------------------------------------
describe('all texts are long enough for typing tests', () => {
  it('easy texts are 300+ characters', () => {
    for (let i = 0; i < 30; i++) {
      const text = getPunctuationText('easy')
      expect(text.length).toBeGreaterThanOrEqual(300)
    }
  })

  it('medium texts are 300+ characters', () => {
    for (let i = 0; i < 30; i++) {
      const text = getPunctuationText('medium')
      expect(text.length).toBeGreaterThanOrEqual(300)
    }
  })

  it('hard texts are 300+ characters', () => {
    for (let i = 0; i < 30; i++) {
      const text = getPunctuationText('hard')
      expect(text.length).toBeGreaterThanOrEqual(300)
    }
  })
})

// ---------------------------------------------------------------------------
// getPunctuationText returns varied text across calls
// ---------------------------------------------------------------------------
describe('getPunctuationText provides variety', () => {
  it('returns different texts across multiple calls for the same density', () => {
    const texts = Array.from({ length: 10 }, () => getPunctuationText('medium'))
    const unique = new Set(texts)
    // With 6 texts in the pool, 10 calls should hit at least 2 different ones
    expect(unique.size).toBeGreaterThanOrEqual(2)
  })
})

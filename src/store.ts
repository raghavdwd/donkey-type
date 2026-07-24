/*
 * Global state management using Zustand with persist middleware.
 * Persists config, history, and streak to localStorage under 'donkey-type-storage'.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** A single keystroke recorded during a test for chart data and ghost mode replay. */
interface KeystrokeTiming {
  charIndex: number
  timestamp: number
}

export interface TestResult {
  id: string
  wpm: number
  rawWpm?: number
  accuracy: number
  mode: string
  date: string
  keystrokes: KeystrokeTiming[]
  language: 'english' | 'hindi'
  difficulty: 'easy' | 'medium' | 'hard'
  textUsed: string
  timeAmount?: number
  timeUnit?: 's' | 'm' | 'h'
  wordsAmount?: number
  wordUnit?: 'words' | 'chars'
  punctuationDensity?: 'easy' | 'medium' | 'hard'
  chartData?: { time: number; wpm: number; raw: number; errors: number }[]
}

export type ThemeName =
  | 'default'
  | 'nord'
  | 'matcha'
  | 'matcha-fresh'
  | 'light'
  | 'cyberpunk'
  | 'midnight'
  | 'rose'
  | 'sunset'
  | 'gruvbox'

interface State {
  config: {
    mode: 'time' | 'words' | 'zen' | 'punctuation'
    language: 'english' | 'hindi'
    difficulty: 'easy' | 'medium' | 'hard'
    theme: ThemeName
    timeAmount: number
    timeUnit: 's' | 'm' | 'h'
    wordsAmount: number
    wordUnit: 'words' | 'chars'
    showRealtimeStats: boolean
    caseSensitive: boolean
    soundEnabled: boolean
    ghostMode: boolean
    punctuationDensity: 'easy' | 'medium' | 'hard'
    punctuationEndMode: 'time' | 'words'
  }
  stats: {
    typos: number
    wordCount: number
    typedCharCount: number
    secElapsed: number
  }
  keyboard: {
    display: boolean
    theme: 'classic' | 'mint' | 'royal' | 'dolch' | 'sand' | 'scarlet'
    enableHaptics: boolean
    enableSound: boolean
  }
  currentKeystrokes: KeystrokeTiming[]
  currentText: string
  history: TestResult[]
  // Local-day streak. count bumps once per day on first completed test; gap resets to 1.
  streak: { count: number; lastDate: string | null; longest: number }
  isHistoryOpen: boolean
}

interface Mutation {
  changeMode: (mode: State['config']['mode']) => void
  changeLanguage: (language: State['config']['language']) => void
  changeDifficulty: (difficulty: State['config']['difficulty']) => void
  changeTheme: (theme: ThemeName) => void
  setTimeAmount: (amount: number) => void
  setTimeUnit: (unit: State['config']['timeUnit']) => void
  setWordsAmount: (amount: number) => void
  setWordUnit: (unit: State['config']['wordUnit']) => void
  toggleRealtimeStats: (bool?: boolean) => void
  toggleCaseSensitive: (bool?: boolean) => void
  toggleSound: (bool?: boolean) => void
  toggleGhostMode: (bool?: boolean) => void
  toggleHistory: (bool?: boolean) => void
  setPunctuationDensity: (density: 'easy' | 'medium' | 'hard') => void
  setPunctuationEndMode: (endMode: 'time' | 'words') => void
  incrStat: (stat: keyof State['stats']) => void
  recordKeystroke: (charIndex: number, timestamp: number) => void
  setCurrentText: (text: string) => void
  reset: () => void
  saveTestResult: () => void
}

interface Compute {
  calcWPM: (sec?: number, charCount?: number) => number
  calcAccuracy: (typos?: number, charCount?: number) => number
  getBestGhostRun: () => TestResult | null
}

const initialState = {
  config: {
    mode: 'time' as const,
    language: 'english' as const,
    difficulty: 'medium' as const,
    theme: 'matcha' as const,
    timeAmount: 30,
    timeUnit: 's' as const,
    wordsAmount: 25,
    wordUnit: 'words' as const,
    showRealtimeStats: true,
    caseSensitive: false,
    soundEnabled: true,
    ghostMode: false,
    punctuationDensity: 'medium' as const,
    punctuationEndMode: 'time' as const,
  },
  stats: {
    typos: 0,
    wordCount: 0,
    typedCharCount: 0,
    secElapsed: 0,
  },
  keyboard: {
    display: true,
    theme: 'dolch' as const,
    enableHaptics: true,
    enableSound: true,
  },
  currentKeystrokes: [],
  currentText: '',
  streak: { count: 0, lastDate: null, longest: 0 },
  isHistoryOpen: false,
}

const useStore = create<State & Mutation & Compute>()(
  persist(
    (set, get) => ({
      ...initialState,
      history: [],

      // Apply the default theme to the document on startup so CSS vars are active.
      ...(document.documentElement.setAttribute(
        'data-theme',
        initialState.config.theme,
      ),
      {}),

      changeMode: (mode) =>
        set((state) => ({ config: { ...state.config, mode } })),

      changeLanguage: (language) =>
        set((state) => ({ config: { ...state.config, language } })),

      changeDifficulty: (difficulty) =>
        set((state) => ({ config: { ...state.config, difficulty } })),

      changeTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set((state) => ({ config: { ...state.config, theme } }))
      },

      setTimeAmount: (amount) =>
        set((state) => ({ config: { ...state.config, timeAmount: amount } })),
      setTimeUnit: (unit) =>
        set((state) => ({ config: { ...state.config, timeUnit: unit } })),
      setWordsAmount: (amount) =>
        set((state) => ({ config: { ...state.config, wordsAmount: amount } })),
      setWordUnit: (unit) =>
        set((state) => ({ config: { ...state.config, wordUnit: unit } })),

      toggleRealtimeStats: (bool) =>
        set((state) => ({
          config: {
            ...state.config,
            showRealtimeStats: bool ?? !state.config.showRealtimeStats,
          },
        })),
      toggleCaseSensitive: (bool) =>
        set((state) => ({
          config: {
            ...state.config,
            caseSensitive: bool ?? !state.config.caseSensitive,
          },
        })),
      toggleSound: (bool) =>
        set((state) => {
          const next = bool ?? !state.config.soundEnabled
          return {
            config: { ...state.config, soundEnabled: next },
            keyboard: { ...state.keyboard, enableSound: next },
          }
        }),
      toggleGhostMode: (bool) =>
        set((state) => ({
          config: { ...state.config, ghostMode: bool ?? !state.config.ghostMode },
        })),
      setPunctuationDensity: (density) =>
        set((state) => ({ config: { ...state.config, punctuationDensity: density } })),
      setPunctuationEndMode: (endMode) =>
        set((state) => ({ config: { ...state.config, punctuationEndMode: endMode } })),
      toggleHistory: (bool) =>
        set((state) => ({ isHistoryOpen: bool ?? !state.isHistoryOpen })),

      incrStat: (stat) =>
        set((state) => ({
          stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
        })),

      recordKeystroke: (charIndex, timestamp) =>
        set((state) => ({
          currentKeystrokes: [...state.currentKeystrokes, { charIndex, timestamp }],
        })),

      setCurrentText: (text) => set(() => ({ currentText: text })),

      reset: () =>
        set(() => ({ stats: initialState.stats, currentKeystrokes: [] })),

      saveTestResult: () => {
        const state = get()

        // Don't save accidental runs (< 10 chars or no keystrokes).
        if (state.stats.typedCharCount < 10) return
        const keystrokes = state.currentKeystrokes
        if (keystrokes.length === 0) return

        // Use the longer of elapsed time vs last keystroke for the chart duration.
        const lastKeystrokeTime = Math.ceil(
          keystrokes[keystrokes.length - 1].timestamp / 1000,
        )
        const testDuration = state.stats.secElapsed || lastKeystrokeTime

        // Per-second chart data: raw WPM and net WPM (accounting for accuracy).
        const chartData = []
        for (let s = 1; s <= testDuration; s++) {
          const upToNow = keystrokes.filter((k) => k.timestamp <= s * 1000)
          const charCount = upToNow.length
          const rawWpm = Math.round(charCount / 5 / (s / 60))
          const accuracyRatio = state.calcAccuracy() / 100
          const wpm = Math.round(rawWpm * accuracyRatio)
          chartData.push({ time: s, wpm, raw: rawWpm, errors: 0 })
        }

        const newResult: TestResult = {
          id: Date.now().toString(),
          wpm: state.calcWPM(),
          rawWpm: Math.round(
            state.stats.typedCharCount / 5 / (state.stats.secElapsed / 60),
          ),
          accuracy: state.calcAccuracy(),
          mode: state.config.mode,
          language: state.config.language,
          difficulty: state.config.difficulty,
          timeAmount: state.config.timeAmount,
          timeUnit: state.config.timeUnit,
          wordsAmount: state.config.wordsAmount,
          wordUnit: state.config.wordUnit,
          punctuationDensity: state.config.punctuationDensity,
          date: new Date().toISOString(),
          keystrokes: state.currentKeystrokes,
          textUsed: state.currentText,
          chartData,
        }

        // Streak: local-day key, once per day. Extend on consecutive days, reset otherwise.
        const todayKey = new Date().toLocaleDateString()
        const yesterdayKey = new Date(
          Date.now() - 86400000,
        ).toLocaleDateString()
        const prev = state.streak
        const streak =
          prev.lastDate === todayKey
            ? prev
            : prev.lastDate === yesterdayKey
              ? {
                  count: prev.count + 1,
                  lastDate: todayKey,
                  longest: Math.max(prev.longest, prev.count + 1),
                }
              : { count: 1, lastDate: todayKey, longest: Math.max(prev.longest, 1) }

        set((state) => ({
          history: [newResult, ...state.history].slice(0, 100),
          streak,
        }))
      },

      calcWPM: (
        sec = get().stats.secElapsed,
        charCount = get().stats.typedCharCount,
      ) => {
        if (!sec || sec === 0 || charCount === 0) return 0
        return Math.round(charCount / 5 / (sec / 60))
      },

      calcAccuracy: (
        typos = get().stats.typos,
        charCount = get().stats.typedCharCount,
      ) => {
        if (!charCount || charCount === 0) return 100
        return Math.max(0, +(100 - (typos * 100) / charCount).toFixed(1))
      },

      getBestGhostRun: () => {
        const state = get()
        const targetTime = state.config.timeAmount
        const targetTimeU = state.config.timeUnit
        const targetWords = state.config.wordsAmount
        const targetWordsU = state.config.wordUnit
        const targetDensity = state.config.punctuationDensity

        const validRuns = state.history.filter(
          (h) =>
            h.mode === state.config.mode &&
            h.language === state.config.language &&
            h.difficulty === state.config.difficulty &&
            (state.config.mode === 'time'
              ? (h.timeAmount || 30) === targetTime &&
                (h.timeUnit || 's') === targetTimeU
              : state.config.mode === 'punctuation'
                ? (h.punctuationDensity || 'medium') === targetDensity
                : (h.wordsAmount || 25) === targetWords &&
                  (h.wordUnit || 'words') === targetWordsU) &&
            h.keystrokes?.length > 0 &&
            h.textUsed?.length > 0,
        )

        if (validRuns.length === 0) return null
        return validRuns.reduce(
          (best, curr) => (curr.wpm > best.wpm ? curr : best),
          validRuns[0],
        )
      },
    }),
    {
      name: 'donkey-type-storage',
      partialize: (state) => ({
        config: state.config,
        history: state.history,
        streak: state.streak,
      }),
    },
  ),
)

export default useStore

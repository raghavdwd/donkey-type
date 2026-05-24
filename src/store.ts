import { create } from "zustand";
import { persist } from "zustand/middleware";

interface KeystrokeTiming {
  charIndex: number;
  timestamp: number;
}

export interface TestResult {
  id: string;
  wpm: number;
  rawWpm?: number;
  accuracy: number;
  mode: string;
  date: string;
  keystrokes: KeystrokeTiming[];
  language: 'english' | 'hindi';
  difficulty: 'easy' | 'medium' | 'hard';
  textUsed: string; 
  timeAmount?: number;
  timeUnit?: 's' | 'm' | 'h';
  wordsAmount?: number;
  wordUnit?: 'words' | 'chars';
  chartData?: { time: number; wpm: number; raw: number; errors: number }[];
}

export type ThemeName = 'default' | 'nord' | 'matcha' | 'cyberpunk' | 'midnight';

interface State {
	config: {
		mode: "time" | "words" | "zen";
        language: "english" | "hindi";
        difficulty: "easy" | "medium" | "hard";
        theme: ThemeName;
        timeAmount: number;
        timeUnit: "s" | "m" | "h";
        wordsAmount: number;
        wordUnit: "words" | "chars";
		showRealtimeStats: boolean;
		caseSensitive: boolean;
        soundEnabled: boolean;
        ghostMode: boolean;
	};
	stats: {
		typos: number;
		wordCount: number;
		typedCharCount: number;
		secElapsed: number;
	};
    currentKeystrokes: KeystrokeTiming[];
    currentText: string;
    history: TestResult[];
    isHistoryOpen: boolean;
}

interface Mutation {
	changeMode: (mode: State["config"]["mode"]) => void;
    changeLanguage: (language: State["config"]["language"]) => void;
    changeDifficulty: (difficulty: State["config"]["difficulty"]) => void;
    changeTheme: (theme: ThemeName) => void;
    setTimeAmount: (amount: number) => void;
    setTimeUnit: (unit: State["config"]["timeUnit"]) => void;
    setWordsAmount: (amount: number) => void;
    setWordUnit: (unit: State["config"]["wordUnit"]) => void;
	toggleRealtimeStats: (bool?: boolean) => void;
	toggleCaseSensitive: (bool?: boolean) => void;
    toggleSound: (bool?: boolean) => void;
    toggleGhostMode: (bool?: boolean) => void;
    toggleHistory: (bool?: boolean) => void;
	incrStat: (stat: keyof State["stats"]) => void;
    recordKeystroke: (charIndex: number, timestamp: number) => void;
    setCurrentText: (text: string) => void;
	reset: () => void;
    saveTestResult: () => void;
}

interface Compute {
	calcWPM: (sec?: number, charCount?: number) => number;
	calcAccuracy: (typos?: number, charCount?: number) => number;
    getBestGhostRun: () => TestResult | null;
}

const initialState = {
	config: {
		mode: "time" as const,
        language: "english" as const,
        difficulty: "medium" as const,
        theme: "default" as const,
        timeAmount: 30,
        timeUnit: "s" as const,
        wordsAmount: 25,
        wordUnit: "words" as const,
		showRealtimeStats: true,
		caseSensitive: false,
        soundEnabled: true,
        ghostMode: false,
	},
	stats: {
		typos: 0,
		wordCount: 0,
		typedCharCount: 0,
		secElapsed: 0,
	},
    currentKeystrokes: [],
    currentText: "",
    isHistoryOpen: false,
};

const useStore = create<State & Mutation & Compute>()(
  persist(
    (set, get) => ({
      ...initialState,
      history: [],

      changeMode: (mode) =>
          set((state) => ({
              config: { ...state.config, mode },
          })),
      changeLanguage: (language) =>
          set((state) => ({
              config: { ...state.config, language },
          })),
      changeDifficulty: (difficulty) =>
          set((state) => ({
              config: { ...state.config, difficulty },
          })),
      changeTheme: (theme) => {
          // Keep the DOM theme in sync immediately so the UI updates before React finishes rerendering.
          document.documentElement.setAttribute('data-theme', theme);
          set((state) => ({
              config: { ...state.config, theme },
          }))
      },
      setTimeAmount: (amount) =>
          set((state) => ({
              config: { ...state.config, timeAmount: amount },
          })),
      setTimeUnit: (unit) =>
          set((state) => ({
              config: { ...state.config, timeUnit: unit },
          })),
      setWordsAmount: (amount) =>
          set((state) => ({
              config: { ...state.config, wordsAmount: amount },
          })),
      setWordUnit: (unit) =>
          set((state) => ({
              config: { ...state.config, wordUnit: unit },
          })),
      toggleRealtimeStats: (bool) =>
          set((state) => ({
              config: { ...state.config, showRealtimeStats: bool ?? !state.config.showRealtimeStats },
          })),
      toggleCaseSensitive: (bool) =>
          set((state) => ({
              config: { ...state.config, caseSensitive: bool ?? !state.config.caseSensitive },
          })),
      toggleSound: (bool) =>
          set((state) => ({
              config: { ...state.config, soundEnabled: bool ?? !state.config.soundEnabled },
          })),
      toggleGhostMode: (bool) =>
          set((state) => ({
              config: { ...state.config, ghostMode: bool ?? !state.config.ghostMode },
          })),
      toggleHistory: (bool) =>
          set((state) => ({
              isHistoryOpen: bool ?? !state.isHistoryOpen,
          })),
      incrStat: (stat) =>
          set((state) => ({
              stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
          })),
      recordKeystroke: (charIndex, timestamp) => 
          set((state) => ({
              currentKeystrokes: [...state.currentKeystrokes, { charIndex, timestamp }]
          })),
      setCurrentText: (text) => 
          set(() => ({ currentText: text })),
      reset: () =>
          set(() => ({
              stats: initialState.stats,
              currentKeystrokes: [],
          })),
          
      saveTestResult: () => {
          const state = get();
          if (state.stats.typedCharCount < 10) return; 
          
          const keystrokes = state.currentKeystrokes;
          if (keystrokes.length === 0) return;
          
          // Use actual elapsed time or configured time for the chart to avoid truncating idle tails
          const lastKeystrokeTime = Math.ceil(keystrokes[keystrokes.length - 1].timestamp / 1000);
          const testDuration = state.stats.secElapsed || lastKeystrokeTime;
          const chartData = [];
          
          for (let s = 1; s <= testDuration; s++) {
              const upToNow = keystrokes.filter(k => k.timestamp <= s * 1000);
              const charCount = upToNow.length;
              const rawWpm = Math.round((charCount / 5) / (s / 60));
              const accuracyRatio = state.calcAccuracy() / 100;
              const wpm = Math.round(rawWpm * accuracyRatio);

              chartData.push({
                  time: s,
                  wpm,
                  raw: rawWpm,
                  errors: 0
              });
          }

          const newResult: TestResult = {
              id: Date.now().toString(),
              wpm: state.calcWPM(),
              rawWpm: Math.round((state.stats.typedCharCount / 5) / (state.stats.secElapsed / 60)),
              accuracy: state.calcAccuracy(),
              mode: state.config.mode,
              language: state.config.language,
              difficulty: state.config.difficulty,
              timeAmount: state.config.timeAmount,
              timeUnit: state.config.timeUnit,
              wordsAmount: state.config.wordsAmount,
              wordUnit: state.config.wordUnit,
              date: new Date().toISOString(),
              keystrokes: state.currentKeystrokes,
              textUsed: state.currentText,
              chartData
          };
          
          set((state) => ({
              history: [newResult, ...state.history].slice(0, 100) 
          }));
      },

      calcWPM: (
          sec = get().stats.secElapsed,
          charCount = get().stats.typedCharCount,
      ) => {
          if (!sec || sec === 0 || charCount === 0) return 0;
          const minutes = sec / 60;
          const words = charCount / 5;
          return Math.round(words / minutes);
      },
      
      calcAccuracy: (
          typos = get().stats.typos,
          charCount = get().stats.typedCharCount,
      ) => {
          if (!charCount || charCount === 0) return 100;
          return Math.max(0, +(100 - (typos * 100) / charCount).toFixed(1));
      },

      getBestGhostRun: () => {
          const state = get();
          const targetTime = state.config.timeAmount;
          const targetTimeU = state.config.timeUnit;
          const targetWords = state.config.wordsAmount;
          const targetWordsU = state.config.wordUnit;
          
          const validRuns = state.history.filter(h => 
              h.mode === state.config.mode && 
              h.language === state.config.language && 
              h.difficulty === state.config.difficulty &&
              (state.config.mode === 'time' 
                ? ((h.timeAmount || 30) === targetTime && (h.timeUnit || 's') === targetTimeU) 
                : ((h.wordsAmount || 25) === targetWords && (h.wordUnit || 'words') === targetWordsU)
              ) &&
              h.keystrokes?.length > 0 &&
              h.textUsed?.length > 0
          );
          if (validRuns.length === 0) return null;
          return validRuns.reduce((best, curr) => curr.wpm > best.wpm ? curr : best, validRuns[0]);
      }
    }),
    {
      name: 'donkey-type-storage',
      partialize: (state) => ({ 
          config: state.config,
          history: state.history 
      }),
    }
  )
);

export default useStore;

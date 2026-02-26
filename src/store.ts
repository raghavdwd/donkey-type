import { create } from "zustand";
import { persist } from "zustand/middleware";

interface KeystrokeTiming {
  charIndex: number;
  timestamp: number;
}

export interface TestResult {
  id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  date: string;
  keystrokes: KeystrokeTiming[];
  language: 'english' | 'hindi';
  difficulty: 'easy' | 'medium' | 'hard';
  textUsed: string; // Saved so ghost mode can replay the exact same text
}

export type ThemeName = 'default' | 'nord' | 'matcha' | 'cyberpunk' | 'midnight';

interface State {
	config: {
		mode: "time" | "words" | "zen";
        language: "english" | "hindi";
        difficulty: "easy" | "medium" | "hard";
        theme: ThemeName;
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
          document.documentElement.setAttribute('data-theme', theme);
          set((state) => ({
              config: { ...state.config, theme },
          }))
      },
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
          
          const newResult: TestResult = {
              id: Date.now().toString(),
              wpm: state.calcWPM(),
              accuracy: state.calcAccuracy(),
              mode: state.config.mode,
              language: state.config.language,
              difficulty: state.config.difficulty,
              date: new Date().toISOString(),
              keystrokes: state.currentKeystrokes,
              textUsed: state.currentText
          };
          
          set((state) => ({
              history: [newResult, ...state.history].slice(0, 100) 
          }));
      },

      calcWPM: (
          sec = get().stats.secElapsed || 1,
          charCount = get().stats.typedCharCount,
      ) => +((charCount * 60) / (sec * 5)).toFixed(1),
      
      calcAccuracy: (
          typos = get().stats.typos,
          charCount = get().stats.typedCharCount || 1,
      ) => Math.max(0, +(100 - (typos * 100) / charCount).toFixed(1)),

      getBestGhostRun: () => {
          const state = get();
          const validRuns = state.history.filter(h => 
              h.mode === state.config.mode && 
              h.language === state.config.language && 
              h.difficulty === state.config.difficulty &&
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
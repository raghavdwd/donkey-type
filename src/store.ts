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
}

export type ThemeName = 'default' | 'nord' | 'matcha' | 'cyberpunk' | 'midnight';

interface State {
	config: {
		mode: "time" | "words" | "zen";
        language: "english" | "hindi";
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
    history: TestResult[];
    isHistoryOpen: boolean;
}

interface Mutation {
	changeMode: (mode: State["config"]["mode"]) => void;
    changeLanguage: (language: State["config"]["language"]) => void;
    changeTheme: (theme: ThemeName) => void;
	toggleRealtimeStats: (bool?: boolean) => void;
	toggleCaseSensitive: (bool?: boolean) => void;
    toggleSound: (bool?: boolean) => void;
    toggleGhostMode: (bool?: boolean) => void;
    toggleHistory: (bool?: boolean) => void;
	incrStat: (stat: keyof State["stats"]) => void;
    recordKeystroke: (charIndex: number, timestamp: number) => void;
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
    isHistoryOpen: false,
};

const useStore = create<State & Mutation & Compute>()(
  persist(
    (set, get) => ({
      ...initialState,
      history: [],

      changeMode: (mode) =>
          set((state) => ({
              config: {
                  ...state.config,
                  mode,
                  showRealtimeStats:
                      mode === "zen" ? false : state.config.showRealtimeStats,
              },
          })),
      changeLanguage: (language) =>
          set((state) => ({
              config: {
                  ...state.config,
                  language,
              },
          })),
      changeTheme: (theme) => {
          document.documentElement.setAttribute('data-theme', theme);
          set((state) => ({
              config: {
                  ...state.config,
                  theme,
              },
          }))
      },
      toggleRealtimeStats: (bool) =>
          set((state) => ({
              config: {
                  ...state.config,
                  showRealtimeStats:
                      bool === undefined ? !state.config.showRealtimeStats : bool,
              },
          })),
      toggleCaseSensitive: (bool) =>
          set((state) => ({
              config: {
                  ...state.config,
                  caseSensitive: bool === undefined ? !state.config.caseSensitive : bool,
              },
          })),
      toggleSound: (bool) =>
          set((state) => ({
              config: {
                  ...state.config,
                  soundEnabled: bool === undefined ? !state.config.soundEnabled : bool,
              },
          })),
      toggleGhostMode: (bool) =>
          set((state) => ({
              config: {
                  ...state.config,
                  ghostMode: bool === undefined ? !state.config.ghostMode : bool,
              },
          })),
      toggleHistory: (bool) =>
          set((state) => ({
              isHistoryOpen: bool === undefined ? !state.isHistoryOpen : bool,
          })),
      incrStat: (stat) =>
          set((state) => ({
              stats: {
                  ...state.stats,
                  [stat]: state.stats[stat] + 1,
              },
          })),
      recordKeystroke: (charIndex, timestamp) => 
          set((state) => ({
              currentKeystrokes: [...state.currentKeystrokes, { charIndex, timestamp }]
          })),
      reset: () =>
          set((state) => ({
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
              date: new Date().toISOString(),
              keystrokes: state.currentKeystrokes
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
          const validRuns = state.history.filter(h => h.mode === state.config.mode && h.language === state.config.language && h.keystrokes?.length > 0);
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
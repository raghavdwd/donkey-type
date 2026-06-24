/*
 * store.ts
 * 
 * This is the global state management file for the entire typing test application.
 * We use a library called Zustand to manage application state.
 * Zustand is a tiny (about 1KB), fast, and scalable state management solution for React.
 * It's an alternative to Redux or Context API but much simpler to use.
 * 
 * Zustand works by creating a "store" (like a centralized database for our UI state)
 * that any component can read from or write to. This is much better than passing
 * props through many levels of components (which is called "prop drilling").
 * 
 * We also use Zustand's "persist" middleware which saves the store data to
 * localStorage automatically. This means when the user closes the browser and
 * comes back, their settings and test history are still there.
 * The data is saved under the key 'donkey-type-storage' in the browser's localStorage.
 * 
 * IMPORTANT: We only persist the 'config' and 'history' parts of the state.
 * Things like the current stats, current keystrokes, and current text are NOT persisted
 * because they change with every test and should reset when the page reloads.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/*
 * ============================================================
 * TYPE DEFINITIONS
 * ============================================================
 * 
 * TypeScript interfaces that define the shape of all our data.
 * Interfaces in TypeScript are like contracts that describe what properties
 * an object should have and what types those properties should be.
 */

/*
 * KeystrokeTiming
 * 
 * This interface represents a single keystroke that the user makes during a test.
 * We record every single keystroke so we can:
 * 1. Calculate WPM at any point during the test (not just at the end)
 * 2. Generate per-second chart data showing how speed changed over time
 * 3. Replay the typing in "ghost mode" (racing against your previous best run)
 * 
 * Properties:
 *   charIndex - The index of the character in the full text that was typed
 *   timestamp - The time in milliseconds since the test started when this key was pressed
 */
interface KeystrokeTiming {
  charIndex: number;
  timestamp: number;
}

/*
 * TestResult
 * 
 * This interface describes the shape of a completed typing test result.
 * Every time a user finishes a test (or time runs out), a TestResult object
 * is created and saved to the history array.
 * 
 * Properties explained:
 *   id - A unique identifier for this test result (we use Date.now() which gives
 *        the current timestamp in milliseconds, so it's unique enough)
 *   wpm - Words Per Minute - the main speed metric (net WPM, accounting for errors)
 *   rawWpm - Raw WPM without accounting for errors (gross typing speed)
 *   accuracy - Percentage of correct keystrokes (0-100%)
 *   mode - Which test mode was used: 'time', 'words', or 'zen'
 *   date - ISO timestamp string of when the test was completed
 *   keystrokes - Array of every keystroke with timestamps for charting and ghost mode
 *   language - Whether the test was in English or Hindi
 *   difficulty - Easy, Medium, or Hard
 *   textUsed - The exact text that was shown to the user (needed for ghost mode replay)
 *   timeAmount/timeUnit - Configuration for time mode (e.g., 30 seconds, 2 minutes)
 *   wordsAmount/wordUnit - Configuration for words mode (e.g., 25 words, 100 characters)
 *   chartData - Pre-computed per-second data for the performance chart (wpm, raw, errors per second)
 */
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

/*
 * ThemeName
 * 
 * We have exactly 5 themes that the user can choose from.
 * By defining this as a union type (using the | operator), TypeScript will
 * show an error if we try to use a theme name that doesn't exist.
 * This prevents bugs from typos in theme names.
 */
export type ThemeName = 'default' | 'nord' | 'matcha' | 'cyberpunk' | 'midnight' | 'rose';

/*
 * State interface
 * 
 * This defines the shape of our entire application state.
 * It's divided into several logical groups:
 * 
 * config - All user-configurable settings that persist between sessions
 *   mode: 'time' (timed test), 'words' (fixed number of words), or 'zen' (no limits)
 *   language: English or Hindi
 *   difficulty: Controls word length/complexity
 *   theme: Visual color scheme
 *   timeAmount/Unit: For time mode (e.g., 30 seconds, 1 minute, 2 hours)
 *   wordsAmount/Unit: For words mode (e.g., 25 words, 100 characters)
 *   showRealtimeStats: Whether to show WPM and time remaining while typing
 *   caseSensitive: Whether uppercase/lowercase matters (NOT fully implemented yet)
 *   soundEnabled: Whether keypress sounds play
 *   ghostMode: Whether to race against your best previous run
 * 
 * stats - Current test statistics that reset for each new test
 *   typos: Count of incorrect keystrokes
 *   wordCount: Number of words completed (advancing with space)
 *   typedCharCount: Total characters typed
 *   secElapsed: Seconds elapsed in the current test
 * 
 * currentKeystrokes - Array of keystrokes recorded during the current test
 * currentText - The text the user is supposed to type
 * history - Array of past TestResult objects (capped at 100)
 * isHistoryOpen - Whether the history modal is currently visible
 */
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

/*
 * Mutation interface
 * 
 * These are the functions (also called "actions" or "mutations") that allow
 * components to modify the state. In Zustand, you call these functions
 * directly on the store (e.g., useStore.getState().changeMode('zen')).
 * 
 * Each mutation function uses Zustand's set() function to update the state.
 * Zustand automatically triggers re-renders in any component that uses
 * the updated part of the state.
 */
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

/*
 * Compute interface
 * 
 * These are computed values (also called "derived state").
 * Instead of storing calculated values in the state, we compute them
 * on-the-fly from the raw state. This ensures they're always up-to-date
 * and we don't have stale cached values.
 */
interface Compute {
  calcWPM: (sec?: number, charCount?: number) => number;
  calcAccuracy: (typos?: number, charCount?: number) => number;
  getBestGhostRun: () => TestResult | null;
}

/*
 * ============================================================
 * INITIAL STATE
 * ============================================================
 * 
 * This is the default state that the app starts with.
 * We define it separately so we can reuse it in the reset() function.
 * When we reset, we want to go back to these exact values (except for
 * config which keeps its current settings and history which stays intact).
 * 
 * Default configuration:
 *   - Mode: time (most popular typing test format)
 *   - Language: English (the default)
 *   - Difficulty: Medium (balanced for most users)
 *   - Theme: default (dark with yellow accents)
 *   - Time: 30 seconds (standard typing test duration)
 *   - Words: 25 (another common test format)
 *   - Case sensitive: off (more forgiving for casual typing)
 *   - Sound: on (audio feedback for keystrokes)
 *   - Ghost mode: off (optional feature, off by default)
 *   - Realtime stats: on (show WPM while typing)
 */
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

/*
 * ============================================================
 * STORE CREATION
 * ============================================================
 * 
 * Here we actually create the Zustand store.
 * create() takes a function that receives 'set' and 'get' parameters:
 *   - set() is how we update state (like React's setState but for the whole store)
 *   - get() is how we read the current state (useful for calculations)
 * 
 * We wrap the store in persist() middleware which saves it to localStorage.
 * The partialize option tells persist() which parts of the state to save.
 * We only persist config and history - not the current test data.
 * 
 * The store combines State, Mutation, and Compute interfaces into one
 * unified type that components can use.
 */
const useStore = create<State & Mutation & Compute>()(
  persist(
    (set, get) => ({
      /*
       * Spread the initial state as our starting values.
       * History starts as an empty array (it gets filled as tests are completed).
       */
      ...initialState,
      history: [],

      /*
       * changeMode
       * 
       * Updates the test mode: time, words, or zen.
       * Time mode: You type for a set duration (e.g., 30 seconds).
       * Words mode: You type a set number of words (e.g., 25 words).
       * Zen mode: No time limit or word limit - just type until you're done.
       */
      changeMode: (mode) =>
        set((state) => ({
          config: { ...state.config, mode },
        })),

      /*
       * changeLanguage
       * 
       * Switches between English and Hindi word pools.
       * This affects which words are displayed in the typing test.
       */
      changeLanguage: (language) =>
        set((state) => ({
          config: { ...state.config, language },
        })),

      /*
       * changeDifficulty
       * 
       * Changes the word difficulty: easy, medium, or hard.
       * Easy words are short (1-4 chars), medium are 5-7, hard are 8+.
       */
      changeDifficulty: (difficulty) =>
        set((state) => ({
          config: { ...state.config, difficulty },
        })),

      /*
       * changeTheme
       * 
       * Changes the visual color theme.
       * When the theme changes, we immediately update the data-theme attribute
       * on the HTML element so the CSS variables update right away.
       * This is faster than waiting for React to re-render because DOM
       * manipulation happens synchronously.
       */
      changeTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set((state) => ({
          config: { ...state.config, theme },
        }))
      },

      /*
       * Simple config setters
       * 
       * These are straightforward setters for individual config values.
       * Each one spreads the existing config and overrides one property.
       * We have to spread because Zustand does shallow merging by default.
       */
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

      /*
       * Toggle functions
       * 
       * These toggle boolean values in the config.
       * If a boolean argument is provided, it sets the value to that boolean.
       * If no argument is provided, it flips the current value (toggle).
       * This pattern allows both explicit setting and toggling.
       * 
       * The double exclamation mark (??) is the nullish coalescing operator.
       * bool ?? !state.config.showRealtimeStats means:
       * "use bool if it's provided, otherwise flip the current value"
       */
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

      /*
       * incrStat
       * 
       * Increments one of the stats counters by 1.
       * This is used during typing to track typos, word count, and character count.
       * The 'stat' parameter is one of the keys of the stats object.
       * We use computed property syntax [stat] to dynamically set which stat to increment.
       */
      incrStat: (stat) =>
        set((state) => ({
          stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
        })),

      /*
       * recordKeystroke
       * 
       * Records a single keystroke with its character index and timestamp.
       * This is called for every keypress during the test.
       * The keystrokes array grows as the user types and is used to:
       * 1. Generate the per-second chart data at the end of the test
       * 2. Replay typing in ghost mode
       * 
       * We spread the existing array and append the new keystroke.
       * This creates a new array (immutability) which is important for React
       * to detect the change and re-render if needed.
       */
      recordKeystroke: (charIndex, timestamp) =>
        set((state) => ({
          currentKeystrokes: [...state.currentKeystrokes, { charIndex, timestamp }]
        })),

      /*
       * setCurrentText
       * 
       * Sets the text that the user will type.
       * This is called when initializing a new game.
       * We don't need the previous state for this, so we use () => ({...})
       * instead of (state) => ({...}).
       */
      setCurrentText: (text) =>
        set(() => ({ currentText: text })),

      /*
       * reset
       * 
       * Resets the current test state (stats and keystrokes) to initial values.
       * This is called when:
       * 1. A new test begins
       * 2. The user presses Tab to restart
       * 3. The configuration changes
       * 
       * IMPORTANT: This does NOT reset config or history - only the per-test data.
       */
      reset: () =>
        set(() => ({
          stats: initialState.stats,
          currentKeystrokes: [],
        })),

      /*
       * saveTestResult
       * 
       * This is the most complex function in the store.
       * It's called when a test finishes (either by time running out, or
       * by the user completing all the words/characters).
       * 
       * What it does:
       * 1. Checks that enough characters were typed (at least 10)
       * 2. Checks that keystrokes were recorded
       * 3. Builds per-second chart data from all keystrokes
       * 4. Creates a TestResult object with all the test metadata
       * 5. Adds it to the beginning of the history array
       * 6. Caps the history at 100 entries
       * 
       * The chart data is computed by dividing the test into 1-second intervals
       * and calculating WPM, Raw WPM for each interval.
       * This is what generates those nice performance-over-time graphs.
       */
      saveTestResult: () => {
        /*
         * Get the current state so we can read all values.
         * We use get() instead of the set() parameter because we need
         * to READ state to compute the result, not just write it.
         */
        const state = get();

        /*
         * Guard clauses: if the user typed less than 10 characters or
         * there are no keystrokes recorded, we don't save the result.
         * This prevents saving accidental/empty tests.
         */
        if (state.stats.typedCharCount < 10) return;
        const keystrokes = state.currentKeystrokes;
        if (keystrokes.length === 0) return;

        /*
         * Calculate the effective test duration.
         * We use either the elapsed time (from the timer) or the time of
         * the last keystroke, whichever is greater. This ensures the chart
         * doesn't get truncated if the timer ran past the last keystroke.
         * Math.ceil rounds up to the nearest whole second.
         */
        const lastKeystrokeTime = Math.ceil(keystrokes[keystrokes.length - 1].timestamp / 1000);
        const testDuration = state.stats.secElapsed || lastKeystrokeTime;

        /*
         * Build the per-second chart data.
         * For each second of the test, we:
         * 1. Find all keystrokes up to that second
         * 2. Calculate raw WPM from the character count
         * 3. Apply the accuracy ratio to get net WPM
         * 
         * Raw WPM = (charCount / 5) / (seconds / 60)
         * The divide by 5 is because one "word" in typing speed is defined
         * as 5 keystrokes (this is the industry standard).
         * 
         * Net WPM = Raw WPM * accuracy%
         * This penalizes you for mistakes.
         */
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

        /*
         * Create the TestResult object with all test metadata.
         * The id is Date.now() which gives milliseconds since 1970.
         * This is guaranteed to be unique for each test (unless you run
         * two tests in the same millisecond, which is impossible).
         */
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

        /*
         * Add the new result to the beginning of history (most recent first).
         * .slice(0, 100) ensures we never store more than 100 results.
         * This prevents the localStorage from growing too large.
         */
        set((state) => ({
          history: [newResult, ...state.history].slice(0, 100)
        }));
      },

      /*
       * calcWPM
       * 
       * Calculates the Words Per Minute typing speed.
       * Formula: (charCount / 5) / (seconds / 60)
       * 
       * The optional parameters allow calculating WPM at any point in time,
       * not just at the end. This is used for real-time stats display.
       * If no arguments are provided, it uses the current stats from the store.
       * 
       * @param sec - Number of seconds elapsed (optional)
       * @param charCount - Number of characters typed (optional)
       * @returns Rounded WPM value
       */
      calcWPM: (
        sec = get().stats.secElapsed,
        charCount = get().stats.typedCharCount,
      ) => {
        if (!sec || sec === 0 || charCount === 0) return 0;
        const minutes = sec / 60;
        const words = charCount / 5;
        return Math.round(words / minutes);
      },

      /*
       * calcAccuracy
       * 
       * Calculates typing accuracy as a percentage.
       * Formula: 100 - (typos * 100 / charCount)
       * 
       * For example, if you typed 100 characters with 5 typos:
       * accuracy = 100 - (5 * 100 / 100) = 95%
       * 
       * The optional parameters allow calculating accuracy at any point.
       * Math.max(0, ...) ensures accuracy never goes below 0%.
       * +(...).toFixed(1) rounds to 1 decimal place.
       * 
       * @param typos - Number of incorrect keystrokes (optional)
       * @param charCount - Total characters typed (optional)
       * @returns Accuracy percentage (0-100)
       */
      calcAccuracy: (
        typos = get().stats.typos,
        charCount = get().stats.typedCharCount,
      ) => {
        if (!charCount || charCount === 0) return 100;
        return Math.max(0, +(100 - (typos * 100) / charCount).toFixed(1));
      },

      /*
       * getBestGhostRun
       * 
       * Finds the best (highest WPM) previous test result that matches the
       * current configuration. This is used for "ghost mode" where a
       * semi-transparent cursor races against you.
       * 
       * How it works:
       * 1. Filter history to only include runs that match current config
       *    (same mode, language, difficulty, time/word settings)
       * 2. Also check that the run has keystroke data and text (needed for replay)
       * 3. If no matching runs found, return null (ghost mode won't show anything)
       * 4. If matching runs found, return the one with the highest WPM
       * 
       * The .reduce() method iterates through all valid runs and keeps
       * the one with the highest WPM. It's like a contest where only
       * the best survives.
       * 
       * @returns The best matching TestResult, or null if none found
       */
      getBestGhostRun: () => {
        const state = get();
        const targetTime = state.config.timeAmount;
        const targetTimeU = state.config.timeUnit;
        const targetWords = state.config.wordsAmount;
        const targetWordsU = state.config.wordUnit;

        /*
         * Filter the history to find runs that match the current settings.
         * We check mode, language, difficulty, and the time/word amounts.
         * We also verify that keystrokes and text exist (needed for replay).
         */
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

        /*
         * If there are no matching runs, return null.
         * The ghost mode feature will show nothing in this case.
         */
        if (validRuns.length === 0) return null;

        /*
         * Find the run with the highest WPM using reduce().
         * reduce() iterates through the array and keeps the best one.
         * We start with validRuns[0] as the initial "best" and compare each one.
         */
        return validRuns.reduce((best, curr) => curr.wpm > best.wpm ? curr : best, validRuns[0]);
      }
    }),
    /*
     * Persist middleware configuration
     * 
     * name: 'donkey-type-storage' - The key used in localStorage
     * partialize: A function that selects which parts of the state to save.
     *   We only save config and history, NOT the current test state.
     *   This means when you refresh the page, your settings and history
     *   are preserved, but any in-progress test is reset.
     */
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

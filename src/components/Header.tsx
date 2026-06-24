/*
 * Header.tsx
 * 
 * This is the top navigation bar of the typing test application.
 * It contains the logo, configuration options, and various toggle buttons.
 * 
 * The header includes:
 * 1. A logo section with a keyboard icon and "donkeytype" text
 * 2. A "Configure Time/Words" button that opens the configuration modal
 * 3. A settings bar with difficulty, theme, and language toggles
 * 4. Action buttons for history, ghost mode, and sound
 * 
 * When the user starts typing, the entire header fades out (handled by App.tsx)
 * so there are no distractions during the test.
 */

import { useState } from 'react'

/*
 * We use Lucide React icons for all the iconography in the header.
 * Lucide is a popular open-source icon library with clean, consistent icons.
 * Each icon is imported as a React component that renders an SVG inline.
 * 
 * Icons used:
 * Keyboard - The main logo icon
 * History - Opens the test history modal
 * Languages - Toggle between English and Hindi
 * Palette - Cycle through color themes
 * Gauge - Cycle through difficulty levels
 * Settings - Opens the config modal
 * Volume2 / VolumeX - Toggle sound on/off
 * Ghost - Toggle ghost mode on/off
 */
import {
  Keyboard,
  History,
  Languages,
  Palette,
  Gauge,
  Settings,
  Volume2,
  VolumeX,
  Ghost,
} from 'lucide-react'
import useStore from '../store'
import type { ThemeName } from '../store'

/*
 * clsx is a tiny utility library for conditionally joining CSS class names.
 * It's much cleaner than template literals with ternary operators.
 * For example: clsx('base', isActive && 'active', variant === 'primary' && 'primary')
 */
import clsx from 'clsx'
import TimeWordsConfigModal from './TimeWordsConfigModal'

/*
 * THEMES constant array
 * 
 * This defines the list of available themes in the order they cycle through.
 * When the user clicks the theme button, it advances to the next theme in this array.
 * The order wraps around (after 'midnight' comes back to 'default').
 */
const THEMES: ThemeName[] = [
  'default',
  'nord',
  'matcha',
  'cyberpunk',
  'midnight',
  'rose',
]

/*
 * DIFFICULTIES constant array
 * 
 * The three difficulty levels for the typing test.
 * When the user clicks the difficulty button, it cycles through these.
 * 'as const' tells TypeScript this is a readonly tuple, not a mutable array.
 */
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

/*
 * Header component (default export)
 * 
 * This is the main header component that appears at the top of the page.
 * It reads configuration from the Zustand store and provides UI controls
 * for all the settings that persist across tests.
 */
export default function Header() {
  /*
   * Destructure the store actions we need from the Zustand store.
   * We only destructure what we actually use in this component.
   * 
   * config: The current application configuration
   * changeLanguage: Toggle between English and Hindi
   * changeTheme: Cycle through themes
   * changeDifficulty: Cycle through difficulties
   * toggleSound: Enable/disable keypress sounds
   * toggleGhostMode: Enable/disable ghost mode
   * toggleHistory: Show/hide the history modal
   */
  const {
    config,
    changeLanguage,
    changeTheme,
    changeDifficulty,
    toggleSound,
    toggleGhostMode,
    toggleHistory,
  } = useStore()

  /*
   * Local state to track whether the Time/Words configuration modal is open.
   * This is local state because the modal belongs to this component and
   * doesn't need to be shared globally.
   */
  const [isModalOpen, setIsModalOpen] = useState(false)

  /*
   * handleNextTheme
   * 
   * Cycles to the next theme in the THEMES array.
   * Uses modular arithmetic ((currentIndex + 1) % length) to wrap around
   * when reaching the end of the array.
   * For example: default -> nord -> matcha -> cyberpunk -> midnight -> default
   */
  const handleNextTheme = () => {
    const currentIndex = THEMES.indexOf(config.theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    changeTheme(THEMES[nextIndex])
  }

  /*
   * handleNextDifficulty
   * 
   * Cycles to the next difficulty level.
   * Same modular arithmetic as handleNextTheme.
   * For example: easy -> medium -> hard -> easy
   */
  const handleNextDifficulty = () => {
    const currentIndex = DIFFICULTIES.indexOf(config.difficulty)
    const nextIndex = (currentIndex + 1) % DIFFICULTIES.length
    changeDifficulty(DIFFICULTIES[nextIndex])
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <header className="w-full flex items-center justify-between py-8">
      {/*
       * Logo section
       * 
       * Displays a keyboard icon with a pulsing dot (indicating the app is active)
       * and the text "donkeytype" in the brand color.
       * "donkey" is yellow (brand color) and "type" is the normal text color.
       * 
       * The logo has a group hover effect that:
       * - Scales the keyboard icon up slightly
       * - Shows an underline animation on the text
       * The underline is created by a div that starts at 0 width and expands
       * on hover using Tailwind's group-hover utility.
       */}
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="relative">
          <Keyboard className="w-9 h-9 text-brand transition-transform duration-300 group-hover:scale-110" />
          {/*
           * This small pulsing dot adds visual interest to the logo.
           * It's positioned at the bottom-right of the keyboard icon.
           */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand rounded-full border-2 border-bg animate-pulse" />
        </div>
        <div className="flex flex-col -gap-1">
          {/*
           * The "donkeytype" title is split into two spans so we can color
           * "donkey" with the brand color and "type" with the regular text color.
           * This creates the signature branded look.
           */}
          <h1 className="text-3xl font-black tracking-tight text-brand font-mono hidden md:block">
            donkey<span className="text-text">type</span>
          </h1>
          {/*
           * Animated underline that appears on hover.
           * Starts at width 0 and expands to full width on group hover.
           */}
          <div className="h-0.5 w-0 group-hover:w-full bg-brand transition-all duration-300 rounded-full" />
        </div>
      </div>

      {/*
       * Configure Time/Words button
       * 
       * Opens a modal where the user can configure test parameters such as
       * time duration (for time mode) or word count (for words mode).
       * The modal is controlled by the isModalOpen local state.
       */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px] hover:bg-bg/60 text-text-muted hover:text-brand"
          title="Configure Time/Words"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden lg:inline uppercase font-bold tracking-wider">
            Configure Time/Words
          </span>
        </button>
      </div>

      {/*
       * TimeWordsConfigModal is rendered here but only shows when isModalOpen is true.
       * The onClose callback sets isModalOpen back to false.
       */}
      <TimeWordsConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/*
       * Settings / Toggles bar
       * 
       * This is the main settings area with all the toggle buttons.
       * It has a subtle dark background with rounded corners and a border.
       * The bar is divided into two sections separated by a vertical divider:
       * 
       * Left side: Difficulty, Theme, and Language toggles
       * Right side: History, Ghost Mode, and Sound buttons
       */}
      <div className="flex items-center bg-bg-secondary/50 p-1 rounded-xl border border-neutral-800/50 shadow-md">
        <div className="flex items-center gap-0.5">
          {/*
           * Difficulty button
           * 
           * Clicking this cycles through easy, medium, and hard.
           * The current difficulty is displayed next to the gauge icon.
           * On mobile screens, only the icon is shown (text is hidden with lg:inline).
           */}
          <button
            onClick={handleNextDifficulty}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px] hover:bg-bg/60 text-text-muted hover:text-brand"
            title={`Difficulty: ${config.difficulty}`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden lg:inline uppercase font-bold tracking-wider">
              {config.difficulty}
            </span>
          </button>

          {/*
           * Vertical divider between controls
           */}
          <div className="w-px h-4 bg-neutral-800 hidden sm:block mx-1" />

          {/*
           * Theme button
           * 
           * Cycles through the 5 available themes.
           * The current theme name is displayed next to the palette icon.
           */}
          <button
            onClick={handleNextTheme}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px] hover:bg-bg/60 text-text-muted hover:text-brand"
            title={`Theme: ${config.theme}`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden lg:inline uppercase font-bold tracking-wider">
              {config.theme}
            </span>
          </button>

          <div className="w-px h-4 bg-neutral-800 hidden sm:block mx-1" />

          {/*
           * Language toggle button
           * 
           * Toggles between English and Hindi.
           * When Hindi is active, the button gets a green highlight
           * (text-success bg-success/5) to indicate the language switch.
           * This is done using clsx for conditional styling.
           */}
          <button
            onClick={() =>
              changeLanguage(
                config.language === 'english' ? 'hindi' : 'english',
              )
            }
            className={clsx(
              'group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-mono text-[12px]',
              /*
               * When Hindi is active, highlight in green (success color).
               * Otherwise, use muted text with hover effects.
               */
              config.language === 'hindi'
                ? 'text-success bg-success/5'
                : 'text-text-muted hover:bg-bg/60 hover:text-brand',
            )}
            title="Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden lg:inline uppercase font-bold tracking-wider">
              {config.language === 'english' ? 'en' : 'hi'}
            </span>
          </button>
        </div>

        {/*
         * Vertical divider separating the left controls from the right actions.
         */}
        <div className="w-px h-6 bg-neutral-800 mx-2" />

        {/*
         * Right-side action buttons
         * 
         * These are icon-only buttons that perform specific actions:
         * - History: Opens the history modal showing past test results
         * - Ghost Mode: Toggles ghost mode (blue highlight when active)
         * - Sound: Toggles keypress sound on/off
         */}
        <div className="flex items-center gap-1 pr-1">
          {/*
           * History button
           * Opens the full history modal showing all past test results.
           */}
          <button
            onClick={() => toggleHistory()}
            className="p-2 text-text-muted hover:text-brand hover:bg-bg/60 rounded-lg transition-all"
            title="History"
          >
            <History className="w-4 h-4" />
          </button>

          {/*
           * Ghost Mode button
           * 
           * When enabled, a blue semi-transparent cursor races against you,
           * showing your best previous run's pace.
           * The button gets a blue highlight when active.
           */}
          <button
            onClick={() => toggleGhostMode()}
            className={clsx(
              'p-2 rounded-lg transition-all',
              /*
               * Blue highlight when ghost mode is active.
               * Muted color with hover effects when inactive.
               */
              config.ghostMode
                ? 'text-blue-400 bg-blue-400/5'
                : 'text-text-muted hover:text-brand hover:bg-bg/60',
            )}
            title="Ghost Mode"
          >
            <Ghost className="w-4 h-4" />
          </button>

          {/*
           * Sound toggle button
           * 
           * Shows Volume2 icon when sound is enabled,
           * VolumeX icon (with a cross) when sound is disabled.
           * Each keystroke produces a synthetic beep using the Web Audio API
           * (implemented in TypingArea.tsx).
           */}
          <button
            onClick={() => toggleSound()}
            className="p-2 text-text-muted hover:text-brand hover:bg-bg/60 rounded-lg transition-all"
            title="Sound"
          >
            {config.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

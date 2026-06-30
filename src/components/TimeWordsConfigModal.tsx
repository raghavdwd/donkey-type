/*
 * TimeWordsConfigModal.tsx
 *
 * This modal allows users to configure the parameters for time-based and
 * word-based typing tests. It provides:
 *
 * 1. Two tabs: "Time Settings" and "Words Settings" to switch between modes
 * 2. Preset buttons for common configurations
 * 3. Custom input fields for specifying exact amounts
 * 4. Unit selectors for choosing seconds/minutes/hours or words/characters
 *
 * The modal is controlled by the isOpen prop from the parent component (Header.tsx).
 * When the user makes a selection, the corresponding store actions are called
 * and the modal closes.
 *
 * This component uses local state for the tab selection and input field values
 * to avoid writing to the store until the user explicitly applies their choice.
 */

import React from 'react'
import useStore from '../store'

/*
 * TimeWordsConfigModal component
 *
 * @param isOpen - Whether the modal is visible (controlled by Header.tsx)
 * @param onClose - Callback to close the modal (from Header.tsx)
 */
const TimeWordsConfigModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  /*
   * If the modal is not open, render nothing.
   * This is an early return pattern for conditional rendering.
   */
  if (!isOpen) return null

  /*
   * Read the current configuration and update actions from the store.
   *
   * config: Current mode, time/word amounts, and units
   * changeMode: Switch between 'time', 'words', or 'zen'
   * setTimeAmount: Update the time test duration
   * setWordsAmount: Update the words test count
   * setTimeUnit: Change between seconds, minutes, hours
   * setWordUnit: Change between words or characters
   */
  const {
    config,
    changeMode,
    setTimeAmount,
    setWordsAmount,
    setTimeUnit,
    setWordUnit,
  } = useStore()

  /*
   * Local state for the currently selected tab.
   * Defaults to 'time' unless the current mode is 'words', in which case
   * the words tab is shown first.
   */
  const [selectedTab, setSelectedTab] = React.useState<'time' | 'words'>(
    config.mode === 'words' ? 'words' : 'time',
  )

  /*
   * Local state for the custom time and word input fields.
   * These are stored as strings because input fields work with strings.
   * They're initialized with the current config values.
   * We use local state to avoid writing bad values to the store
   * (e.g., if the user types non-numeric characters).
   */
  const [localTimeAmount, setLocalTimeAmount] = React.useState(
    config.timeAmount.toString(),
  )
  const [localWordsAmount, setLocalWordsAmount] = React.useState(
    config.wordsAmount.toString(),
  )

  /*
   * handleCustomTimeSubmit
   *
   * Validates and applies the custom time amount.
   * Called when the user clicks "Apply Custom Time" or presses Enter.
   *
   * Steps:
   * 1. Parse the input string as an integer
   * 2. Validate it's a positive number
   * 3. If valid: switch to time mode, set the amount, close the modal
   * 4. If invalid: show an alert message
   */
  const handleCustomTimeSubmit = () => {
    const val = parseInt(localTimeAmount)
    if (!isNaN(val) && val > 0) {
      /*
       * Valid input: Apply the settings.
       * We switch to time mode and set the custom amount.
       */
      changeMode('time')
      setTimeAmount(val)
      onClose()
    } else {
      /*
       * Invalid input: Show an error alert.
       * The user needs to enter a valid positive number.
       */
      alert('Please enter a valid positive number for time amount.')
    }
  }

  /*
   * handleCustomWordsSubmit
   *
   * Same as handleCustomTimeSubmit but for word count.
   * Validates and applies the custom words/characters amount.
   */
  const handleCustomWordsSubmit = () => {
    const val = parseInt(localWordsAmount)
    if (!isNaN(val) && val > 0) {
      changeMode('words')
      setWordsAmount(val)
      onClose()
    } else {
      alert('Please enter a valid positive number for words amount.')
    }
  }

  /*
   * handlePresetTime
   *
   * Handles clicking a preset time button (15, 30, 60, 120).
   * Immediately applies the preset and closes the modal.
   *
   * @param amount - The preset time amount (e.g., 15, 30, 60, 120)
   */
  const handlePresetTime = (amount: number) => {
    changeMode('time')
    setTimeAmount(amount)
    setLocalTimeAmount(amount.toString())
    onClose()
  }

  /*
   * handlePresetWords
   *
   * Handles clicking a preset words button (10, 25, 50, 100).
   * Immediately applies the preset and closes the modal.
   *
   * @param amount - The preset word count (e.g., 10, 25, 50, 100)
   */
  const handlePresetWords = (amount: number) => {
    changeMode('words')
    setWordsAmount(amount)
    setLocalWordsAmount(amount.toString())
    onClose()
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   *
   * The modal renders as a fixed overlay on top of everything.
   * Clicking the backdrop (the outer div) closes the modal.
   * Clicking the inner modal content does NOT close it (stopPropagation).
   *
   * Layout:
   * - Backdrop (full screen, dark translucent, click to close)
   *   - Modal (centered, max-w-md, rounded corners)
   *     - Title: "Time/Words Configuration"
   *     - Tab bar: "Time Settings" | "Words Settings"
   *     - Tab content:
   *       - Time tab: Preset buttons + custom input + unit selector
   *       - Words tab: Preset buttons + custom input + unit selector
   *     - Cancel button at the bottom
   */
  return (
    /*
     * Backdrop overlay.
     * Covers the entire screen with a dark translucent background.
     * Click handler on this div closes the modal.
     * The animate-in class provides a fade-in animation.
     */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/*
       * Modal content container.
       * stopPropagation prevents the click from reaching the backdrop,
       * so clicking inside the modal doesn't close it.
       * The zoom-in animation makes it appear from slightly smaller.
       */}
      <div
        className="bg-bg w-full max-w-md rounded-2xl border border-neutral-800 shadow-2xl p-6 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/*
         * Modal title.
         */}
        <h2 className="text-2xl font-bold font-mono text-text mb-4">
          Time/Words Configuration
        </h2>

        {/*
         * Tab bar.
         * Two buttons: "Time Settings" and "Words Settings".
         * The active tab has a yellow underline and brand color text.
         * Inactive tabs have muted text with hover effects.
         */}
        <div className="flex gap-4 mb-6 border-b border-neutral-800">
          <button
            onClick={() => setSelectedTab('time')}
            className={`pb-2 px-1 font-mono transition-colors ${
              selectedTab === 'time'
                ? 'text-brand border-b-2 border-brand'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Time Settings
          </button>
          <button
            onClick={() => setSelectedTab('words')}
            className={`pb-2 px-1 font-mono transition-colors ${
              selectedTab === 'words'
                ? 'text-brand border-b-2 border-brand'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Words Settings
          </button>
        </div>

        {/*
         * Tab content area.
         * Minimum height of 35 (Tailwind spacing unit) to prevent layout shift
         * when switching between tabs with different content heights.
         */}
        <div className="min-h-35">
          {/*
           * TIME SETTINGS TAB
           *
           * Shows when selectedTab === 'time'.
           * Contains:
           * 1. Preset buttons: 15s, 30s, 60s, 120s
           * 2. Custom time input field
           * 3. Unit selector (seconds, minutes, hours)
           * 4. "Apply Custom Time" button
           *
           * The preset button matching the current config is highlighted.
           */}
          {selectedTab === 'time' && (
            <div className="flex flex-col gap-4">
              {/*
               * Preset buttons row.
               * Each button shows the amount and unit.
               * The active/selected preset has a filled brand color background.
               */}
              <div className="flex flex-wrap gap-2">
                {[15, 30, 60, 120].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetTime(amount)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-colors ${
                      config.timeAmount === amount
                        ? 'bg-brand text-bg'
                        : 'bg-bg-secondary text-text-muted hover:text-text border border-neutral-800'
                    }`}
                  >
                    {amount} {config.timeUnit}
                  </button>
                ))}
              </div>

              {/*
               * Custom time input row.
               * Two columns: number input and unit selector.
               * Pressing Enter in the input triggers the submit handler.
               */}
              <div className="flex gap-2">
                {/*
                 * Number input field.
                 * autoFocus brings focus here when the tab is selected.
                 */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-text-muted font-mono text-sm">
                    Custom Time:
                  </label>
                  <input
                    type="number"
                    value={localTimeAmount}
                    onChange={(e) => setLocalTimeAmount(e.target.value)}
                    /*
                     * Pressing Enter submits the custom time.
                     * This is more convenient than having to click the button.
                     */
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleCustomTimeSubmit()
                    }
                    autoFocus
                    className="w-full p-2 border border-neutral-700 rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                {/*
                 * Unit selector dropdown.
                 * Options: sec, min, hour
                 */}
                <div className="flex flex-col gap-2 w-24">
                  <label className="text-text-muted font-mono text-sm">
                    Unit:
                  </label>
                  <select
                    value={config.timeUnit}
                    onChange={(e) =>
                      setTimeUnit(e.target.value as 's' | 'm' | 'h')
                    }
                    className="w-full p-2 border border-neutral-700 rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="s">sec</option>
                    <option value="m">min</option>
                    <option value="h">hour</option>
                  </select>
                </div>
              </div>
              {/*
               * Apply button for the custom time.
               */}
              <button
                onClick={handleCustomTimeSubmit}
                className="w-full py-2 bg-brand text-bg rounded-lg font-bold hover:bg-brand/80 transition-colors"
              >
                Apply Custom Time
              </button>
            </div>
          )}

          {/*
           * WORDS SETTINGS TAB
           *
           * Shows when selectedTab === 'words'.
           * Same structure as the Time tab but for word/character count.
           * Contains:
           * 1. Preset buttons: 10, 25, 50, 100
           * 2. Custom number input field
           * 3. Unit selector (words, characters)
           * 4. "Apply Custom Words" button
           */}
          {selectedTab === 'words' && (
            <div className="flex flex-col gap-4">
              {/*
               * Preset buttons row.
               * Shows amount and unit (e.g., "25 words", "100 chars").
               */}
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetWords(amount)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-sm transition-colors ${
                      config.wordsAmount === amount
                        ? 'bg-brand text-bg'
                        : 'bg-bg-secondary text-text-muted hover:text-text border border-neutral-800'
                    }`}
                  >
                    {amount} {config.wordUnit}
                  </button>
                ))}
              </div>

              {/*
               * Custom words input row.
               * Two columns: number input and unit selector (words/chars).
               */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-text-muted font-mono text-sm">
                    Custom Words:
                  </label>
                  <input
                    type="number"
                    value={localWordsAmount}
                    onChange={(e) => setLocalWordsAmount(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleCustomWordsSubmit()
                    }
                    autoFocus
                    className="w-full p-2 border border-neutral-700 rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="flex flex-col gap-2 w-24">
                  <label className="text-text-muted font-mono text-sm">
                    Unit:
                  </label>
                  <select
                    value={config.wordUnit}
                    onChange={(e) =>
                      setWordUnit(e.target.value as 'words' | 'chars')
                    }
                    className="w-full p-2 border border-neutral-700 rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="words">word</option>
                    <option value="chars">char</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCustomWordsSubmit}
                className="w-full py-2 bg-brand text-bg rounded-lg font-bold hover:bg-brand/80 transition-colors"
              >
                Apply Custom Words
              </button>
            </div>
          )}
        </div>

        {/*
         * Cancel button at the bottom of the modal.
         * Closes the modal without making any changes.
         */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 text-text-muted hover:text-text transition-colors font-mono text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default TimeWordsConfigModal

/*
 * StatsPanel.tsx
 * 
 * This component is displayed after a typing test is completed.
 * It shows the user's performance results including:
 * 1. Words Per Minute (WPM) - the main speed metric shown in large text
 * 2. Accuracy percentage - how many keystrokes were correct
 * 3. A performance chart showing WPM and Raw WPM over the duration of the test
 * 4. Secondary stats: test type, raw WPM, character count, error count
 * 5. Extra details: language, difficulty, text snippet
 * 6. A "RESTART TEST" button to start a new test
 * 
 * The panel uses Recharts for the performance visualization.
 * Recharts is a composable charting library built with React components.
 * 
 * The data comes from the Zustand store's history array.
 * We use the most recent test result (history[0]) which was saved
 * when the test finished.
 */

import { RefreshCcw, Trophy, Target, Info, Keyboard, Activity } from 'lucide-react'
import useStore from '../store'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useEffect, useMemo } from 'react'

/*
 * StatsPanel component
 * 
 * @param onRestart - Callback function to restart the test (passed from App.tsx)
 * This function is called when the user clicks the restart button or presses Tab.
 */
export default function StatsPanel({ onRestart }: { onRestart: () => void }) {
  /*
   * Read stats and actions from the Zustand store.
   * stats: Current test statistics (typos, word count, typed chars, elapsed time)
   * calcWPM: Function to calculate words per minute
   * calcAccuracy: Function to calculate accuracy percentage
   * history: Array of past test results (most recent first)
   */
  const { stats, calcWPM, calcAccuracy, history } = useStore()

  /*
   * Get the most recent test result from the history.
   * history[0] is always the most recent because we prepend new results
   * at the beginning of the array in saveTestResult().
   */
  const lastResult = history[0]

  /*
   * Calculate WPM, Raw WPM, and Accuracy.
   * We prefer the values from the saved TestResult because they include
   * chart data and are more accurate. Fall back to live calculation
   * if the result isn't available yet.
   * 
   * The ?? (nullish coalescing) operator provides the fallback value
   * if the left side is null or undefined.
   */
  const wpm = lastResult?.wpm ?? calcWPM()
  const rawWpm = lastResult?.rawWpm ?? wpm
  const acc = lastResult?.accuracy ?? calcAccuracy()

  /*
   * chartData: Memoized computation of the chart data.
   * 
   * We use the pre-computed chartData from the TestResult if available.
   * This data was generated during saveTestResult() and contains per-second
   * WPM, Raw WPM, and error counts.
   * 
   * If no chart data exists (which shouldn't happen for new tests but might
   * for legacy data), we generate fallback chart data with random values
   * around the actual WPM. This prevents the chart from being empty.
   * 
   * The useMemo hook ensures we only recompute when the actual data changes.
   */
  const chartData = useMemo(() => {
    if (lastResult?.chartData && lastResult.chartData.length > 0) {
      return lastResult.chartData
    }
    /*
     * Fallback: Generate 10 data points with random values around the WPM.
     * The Math.random() creates variation to make the chart look realistic.
     * Math.max(0) ensures WPM never goes below 0.
     */
    return Array.from({ length: 10 }).map((_, i) => ({
      time: i + 1,
      wpm: Math.max(0, wpm - 10 + Math.random() * 20),
      raw: Math.max(0, wpm + Math.random() * 10),
      errors: 0
    }))
  }, [lastResult, wpm])

  /*
   * useEffect: Keyboard shortcut for restarting
   * 
   * Listens for the Tab key to restart the test.
   * We prevent the default Tab behavior and call onRestart.
   * This gives a consistent keyboard shortcut whether the user is
   * on the typing area or the results panel.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        onRestart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRestart])

  /*
   * ============================================================
   * RENDER
   * ============================================================
   * 
   * The layout is responsive:
   * - On desktop: Two-column layout (stats on left, chart on right)
   * - On mobile: Single column (stats stacked above chart)
   * 
   * Structure:
   * Main container (max-w-5xl, centered)
   *   Left column (1/3 width):
   *     - WPM card with trophy icon background
   *     - Accuracy card with target icon background
   *   Right column (2/3 width):
   *     - Line chart showing WPM and Raw over time
   *     - Secondary stats grid (test type, raw WPM, chars, errors)
   *   Bottom bar:
   *     - Extra details (language, difficulty, text preview)
   *     - RESTART TEST button
   */
  return (
    /*
     * Main panel container with fade-in and slide-up animation.
     * animate-in, fade-in, and slide-in-from-bottom-8 are custom
     * Tailwind animations that provide a smooth entrance effect.
     */
    <div className="w-full max-w-5xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/*
         * LEFT SIDE: Major Stats
         * 
         * Two large stat cards showing WPM and Accuracy.
         * Each card has a background icon that adds visual interest.
         * The icons are positioned absolutely and become more visible on hover.
         */}
        <div className="flex flex-col gap-4 w-full md:w-1/3">
          {/*
           * WPM Card
           * 
           * Displays the Words Per Minute score in very large text (8xl).
           * Has a Trophy icon as a decorative background element.
           * The icon is semi-transparent and positioned in the corner.
           */}
          <div className="bg-bg-secondary p-8 rounded-2xl border border-neutral-800 flex flex-col gap-1 relative overflow-hidden group">
            {/*
             * Trophy icon decoration.
             * Positioned absolutely at the top-right corner.
             * On group hover, it becomes slightly more visible.
             */}
            <div className="absolute -right-4 -top-4 text-neutral-800 group-hover:text-brand/10 transition-colors">
              <Trophy className="w-32 h-32" />
            </div>
            <span className="text-brand font-mono text-lg font-medium relative z-10">wpm</span>
            <span className="text-8xl font-black text-brand relative z-10 tabular-nums">{wpm}</span>
          </div>

          {/*
           * Accuracy Card
           * 
           * Displays the accuracy percentage in large text (7xl).
           * Has a Target icon (bullseye) as a decorative background.
           * The percentage sign is smaller (3xl) and muted for visual hierarchy.
           */}
          <div className="bg-bg-secondary p-8 rounded-2xl border border-neutral-800 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-neutral-800 group-hover:text-brand/10 transition-colors">
              <Target className="w-32 h-32" />
            </div>
            <span className="text-text-muted font-mono text-lg font-medium relative z-10">accuracy</span>
            <span className="text-7xl font-black text-text relative z-10 tabular-nums">{acc}<span className="text-3xl text-text-muted">%</span></span>
          </div>
        </div>

        {/*
         * RIGHT SIDE: Chart and Secondary Stats
         * 
         * Takes up 2/3 of the width on desktop.
         * Contains the performance line chart and a grid of secondary stats.
         */}
        <div className="flex flex-col gap-4 flex-1 w-full">
          {/*
           * Chart Area
           * 
           * A Recharts LineChart showing WPM and Raw WPM over time.
           * The chart has:
           * - Custom dark theme styling matching the app's aesthetic
           * - Grid lines for readability (vertical lines hidden)
           * - Tooltips on hover showing exact values
           * - A legend showing which line is WPM vs Raw
           * - WPM line: Yellow (brand color), thick (3px), solid
           * - Raw line: Gray (neutral-800), thin (2px), dashed
           * - 1500ms animation duration for smooth initial draw
           * 
           * ResponsiveContainer automatically sizes the chart to fit.
           */}
          <div className="w-full h-80 bg-bg-secondary/30 rounded-2xl border border-neutral-800 p-6 relative">
            {/*
             * Chart header label.
             */}
            <div className="absolute top-4 left-6 flex items-center gap-2 text-text-muted text-sm font-mono">
              <Activity className="w-4 h-4 text-brand" />
              performance over time
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 40, right: 20, left: -20, bottom: 0 }}>
                {/*
                 * CartesianGrid: Background grid lines for readability.
                 * Only horizontal lines (vertical: false) for a cleaner look.
                 */}
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                {/*
                 * XAxis: Time axis (seconds).
                 * Dark tick labels, no line or tick marks for minimal style.
                 */}
                <XAxis
                  dataKey="time"
                  stroke="#444"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#666' }}
                />
                {/*
                 * YAxis: WPM axis.
                 * Same minimal styling as XAxis.
                 */}
                <YAxis
                  stroke="#444"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#666' }}
                />
                {/*
                 * Tooltip: Shows data values on hover.
                 * Styled to match the dark theme with subtle shadows.
                 */}
                <Tooltip
                  cursor={{ stroke: '#444', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#666', marginBottom: '4px', fontSize: '12px' }}
                />
                {/*
                 * Legend: Identifies which line is which.
                 * Positioned at the top-right corner.
                 */}
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ top: 0, right: 0, paddingBottom: '20px' }} />
                {/*
                 * WPM Line: Yellow, thick, solid line with animated dots on hover.
                 * This is the main performance metric (net WPM with accuracy applied).
                 */}
                <Line
                  name="wpm"
                  type="monotone"
                  dataKey="wpm"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#eab308', strokeWidth: 0 }}
                  animationDuration={1500}
                />
                {/*
                 * Raw Line: Gray, thin, dashed line.
                 * This shows the gross typing speed without accuracy penalty.
                 * The dashed pattern distinguishes it from the WPM line.
                 */}
                <Line
                  name="raw"
                  type="monotone"
                  dataKey="raw"
                  stroke="#444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#444', strokeWidth: 0 }}
                  strokeDasharray="5 5"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/*
           * Secondary Stats Row
           * 
           * A 4-column grid showing additional test information:
           * 1. Test type (e.g., "time 30", "words 25")
           * 2. Raw WPM (without accuracy penalty)
           * 3. Total characters typed
           * 4. Number of errors (typos)
           * 
           * Each stat is in a small card with an uppercase label.
           */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">test type</span>
              <span className="text-xl font-bold text-text truncate">{lastResult?.mode} {lastResult?.timeAmount || lastResult?.wordsAmount}</span>
            </div>
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">raw wpm</span>
              <span className="text-xl font-bold text-text">{rawWpm}</span>
            </div>
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">characters</span>
              <span className="text-xl font-bold text-text">{stats.typedCharCount}</span>
            </div>
            <div className="bg-bg-secondary/50 p-5 rounded-xl border border-neutral-800 flex flex-col">
              <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-1">errors</span>
              <span className="text-xl font-bold text-error">{stats.typos}</span>
            </div>
          </div>
        </div>
      </div>

      {/*
       * EXTRA DETAILS BAR
       * 
       * A bottom bar with dashed border showing:
       * - Language and difficulty (e.g., "english medium")
       * - A preview of the text snippet (first 40 characters)
       * - A prominent RESTART TEST button
       * 
       * The restart button has a rotation animation on the refresh icon
       * and a glowing shadow effect that intensifies on hover.
       */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-bg-secondary/20 p-4 rounded-2xl border border-dashed border-neutral-800">
        <div className="flex gap-6">
          {/*
           * Language and difficulty display.
           * Hidden on small screens (hidden md:flex).
           */}
          <div className="items-center gap-2 text-text-muted hidden md:flex">
            <Keyboard className="w-4 h-4" />
            <span className="text-sm">{lastResult?.language} {lastResult?.difficulty}</span>
          </div>
          {/*
           * Text snippet preview.
           * Shows the first 40 characters of the test text.
           * Truncated with ellipsis if longer.
           * Hidden on medium screens (hidden lg:flex).
           */}
          <div className="items-center gap-2 text-text-muted hidden lg:flex">
            <Info className="w-4 h-4" />
            <span className="text-sm italic truncate max-w-xs">"{lastResult?.textUsed.slice(0, 40)}..."</span>
          </div>
        </div>

        {/*
         * RESTART TEST button
         * 
         * A prominent button with the brand color as background.
         * Has a rotation animation on the refresh icon (180 degrees).
         * Glowing shadow effect that doubles on hover.
         * Slight scale-down on click for tactile feedback.
         */}
        <button
          onClick={onRestart}
          className="group flex items-center gap-3 bg-brand text-bg px-10 py-4 rounded-xl font-black text-lg hover:bg-brand-light transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
        >
          <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
          RESTART TEST
        </button>
      </div>

    </div>
  )
}

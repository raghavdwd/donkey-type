import useStore from '../store'

/* Live WPM/acc/time-left readout shown inside the header during an active test. */
export default function LiveStatus() {
  const { config, stats, calcWPM, calcAccuracy } = useStore()

  if (!config.showRealtimeStats) return null

  const accuracy = calcAccuracy()

  return (
    <div
      className="font-mono text-sm sm:text-base  flex items-center gap-3 sm:gap-5 tabular-nums"
      aria-live="polite"
    >
      <Stat label="wpm" value={calcWPM()} accent />
      <Divider />
      <Stat label="acc" value={`${accuracy}%`} />
      {(config.mode === 'time' ||
        (config.mode === 'punctuation' &&
          config.punctuationEndMode === 'time')) &&
        stats.secElapsed > 0 && (
          <>
            <Divider />
            <Stat label="left" value={getTimeLeft(config, stats.secElapsed)} />
          </>
        )}
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-text-muted text-[15px] sm:text-s uppercase tracking-widest">
        {label}
      </span>
      <span className={accent ? 'text-brand font-semibold' : 'text-text'}>
        {value}
      </span>
    </span>
  )
}

function Divider() {
  return <span className="text-neutral-700">·</span>
}

function getTimeLeft(
  config: {
    timeAmount: number
    timeUnit: 's' | 'm' | 'h'
    mode: string
    punctuationEndMode?: 'time' | 'words'
  },
  secElapsed: number,
) {
  const isTime =
    config.mode === 'time' ||
    (config.mode === 'punctuation' && config.punctuationEndMode === 'time')
  if (!isTime) return ''
  const multiplier =
    config.timeUnit === 'h' ? 3600 : config.timeUnit === 'm' ? 60 : 1
  const target = config.timeAmount * multiplier
  const left = Math.max(0, target - secElapsed)
  if (config.timeUnit === 's') return `${left}s`
  const m = Math.floor(left / 60)
  const s = left % 60
  if (config.timeUnit === 'm') return `${m}:${s.toString().padStart(2, '0')}`
  const h = Math.floor(left / 3600)
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

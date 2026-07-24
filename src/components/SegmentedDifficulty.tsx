import clsx from 'clsx'
import useStore from '../store'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
type Difficulty = (typeof DIFFICULTIES)[number]

/* Three-segment radio group (easy / med / hard). Disabled in Hindi or punctuation mode. */
export default function SegmentedDifficulty() {
  const { config, changeDifficulty } = useStore()
  const disabled = config.language === 'hindi' || config.mode === 'punctuation'

  return (
    <div
      role="radiogroup"
      aria-label="Difficulty"
      aria-disabled={disabled}
      className={clsx(
        'inline-flex items-center p-0.5 rounded-lg',
        'bg-bg-secondary/60 border border-neutral-800/60',
        disabled && 'opacity-40',
      )}
      title={disabled ? (config.mode === 'punctuation' ? 'Controlled by punctuation mode' : 'Difficulty disabled in Hindi mode') : 'Difficulty'}
    >
      {DIFFICULTIES.map((d: Difficulty) => {
        const active = config.difficulty === d
        return (
          <button
            key={d}
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => changeDifficulty(d)}
            className={clsx(
              'px-2.5 sm:px-3 py-1 rounded-md font-mono text-[11px] sm:text-xs',
              'uppercase tracking-wider font-bold transition-all',
              active
                ? 'bg-brand/15 text-brand shadow-sm'
                : 'text-text-muted hover:text-text',
              disabled && 'cursor-not-allowed',
            )}
          >
            {d === 'easy' ? 'easy' : d === 'medium' ? 'med' : 'hard'}
          </button>
        )
      })}
    </div>
  )
}

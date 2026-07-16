import { useState } from 'react'
import { Timer, Type, Sparkles, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import useStore from '../store'
import TimeWordsConfigModal from './TimeWordsConfigModal'

/*
 * ModePill
 *
 * The visual anchor of the new header. Shows the active test config at a
 * glance (e.g. "time · 30s", "words · 25", "zen") and opens the time/words
 * configuration modal on click.
 *
 * Replaces the standalone "Configure Time/Words" button from the old header.
 * The mode icon + label are the loudest thing in the top bar, making it
 * impossible to forget what test you're running.
 */
export default function ModePill() {
  const { config } = useStore()
  const [isOpen, setIsOpen] = useState(false)

  const Icon =
    config.mode === 'time' ? Timer : config.mode === 'words' ? Type : Sparkles

  const label =
    config.mode === 'time'
      ? `${config.timeAmount}${config.timeUnit}`
      : config.mode === 'words'
        ? `${config.wordsAmount} ${config.wordUnit === 'words' ? 'w' : 'c'}`
        : 'zen'

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full',
          'bg-bg-secondary/60 border border-neutral-800/60',
          'hover:border-brand/60 hover:bg-bg-secondary',
          'transition-all duration-200 font-mono text-sm',
        )}
        title="Change test mode"
        aria-label={`Current mode: ${config.mode}. Click to change.`}
      >
        <Icon className="w-3.5 h-3.5 text-brand" />
        <span className="text-text-muted group-hover:text-text transition-colors lowercase">
          {config.mode}
        </span>
        <span className="text-text font-semibold tracking-wide">{label}</span>
        <ChevronDown className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      <TimeWordsConfigModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

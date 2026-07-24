import React from 'react'
import { Timer, Type, Sparkles } from 'lucide-react'
import useStore from '../store'
import { featureFlags } from '../lib/feature-flags'

const ConfigModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const {
    config,
    changeMode,
    setTimeAmount,
    setWordsAmount,
    setTimeUnit,
    setWordUnit,
    setPunctuationDensity,
    setPunctuationEndMode,
  } = useStore()

  const [selectedTab, setSelectedTab] = React.useState<
    'time' | 'words' | 'punctuation'
  >(
    config.mode === 'words'
      ? 'words'
      : config.mode === 'punctuation' && featureFlags.punctuationMode
        ? 'punctuation'
        : 'time',
  )

  const [localTimeAmount, setLocalTimeAmount] = React.useState(
    config.timeAmount.toString(),
  )
  const [localWordsAmount, setLocalWordsAmount] = React.useState(
    config.wordsAmount.toString(),
  )

  if (!isOpen) return null

  const handleCustomTimeSubmit = () => {
    const val = parseInt(localTimeAmount)
    if (!isNaN(val) && val > 0) {
      changeMode('time')
      setTimeAmount(val)
      onClose()
    } else {
      alert('Please enter a valid positive number for time amount.')
    }
  }

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

  const handlePresetTime = (amount: number) => {
    changeMode('time')
    setTimeAmount(amount)
    setLocalTimeAmount(amount.toString())
    onClose()
  }

  const handlePresetWords = (amount: number) => {
    changeMode('words')
    setWordsAmount(amount)
    setLocalWordsAmount(amount.toString())
    onClose()
  }

  const handlePunctuationApply = () => {
    changeMode('punctuation')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-bg w-full max-w-md rounded-2xl border border-neutral-800 shadow-2xl p-6 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold font-mono text-text mb-4">
          Configuration
        </h2>

        <div className="flex gap-4 mb-6 border-b border-neutral-800">
          <button
            onClick={() => setSelectedTab('time')}
            className={`inline-flex items-center gap-1.5 pb-2 px-1 font-mono transition-colors ${
              selectedTab === 'time'
                ? 'text-brand border-b-2 border-brand'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            Time
          </button>
          <button
            onClick={() => setSelectedTab('words')}
            className={`inline-flex items-center gap-1.5 pb-2 px-1 font-mono transition-colors ${
              selectedTab === 'words'
                ? 'text-brand border-b-2 border-brand'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Words
          </button>
          {featureFlags.punctuationMode && (
            <button
              onClick={() => setSelectedTab('punctuation')}
              className={`inline-flex items-center gap-1.5 pb-2 px-1 font-mono transition-colors ${
                selectedTab === 'punctuation'
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Punctuation
            </button>
          )}
        </div>

        <div className="min-h-35">
          {selectedTab === 'time' && (
            <div className="flex flex-col gap-4">
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

              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-text-muted font-mono text-sm">
                    Custom Time:
                  </label>
                  <input
                    type="number"
                    value={localTimeAmount}
                    onChange={(e) => setLocalTimeAmount(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleCustomTimeSubmit()
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
              <button
                onClick={handleCustomTimeSubmit}
                className="w-full py-2 bg-brand text-bg rounded-lg font-bold hover:bg-brand/80 transition-colors"
              >
                Apply Custom Time
              </button>
            </div>
          )}

          {selectedTab === 'words' && (
            <div className="flex flex-col gap-4">
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

          {selectedTab === 'punctuation' && featureFlags.punctuationMode && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-text-muted font-mono text-sm">
                  Punctuation Density:
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => setPunctuationDensity(density)}
                      className={`flex-1 px-3 py-1.5 rounded-lg font-mono text-sm transition-colors ${
                        config.punctuationDensity === density
                          ? 'bg-brand text-bg'
                          : 'bg-bg-secondary text-text-muted hover:text-text border border-neutral-800'
                      }`}
                    >
                      {density === 'easy'
                        ? 'Easy (.)'
                        : density === 'medium'
                          ? 'Medium (.,!?;:)'
                          : 'Hard (all)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-muted font-mono text-sm">
                  End Condition:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPunctuationEndMode('time')}
                    className={`flex-1 px-3 py-1.5 rounded-lg font-mono text-sm transition-colors ${
                      config.punctuationEndMode === 'time'
                        ? 'bg-brand text-bg'
                        : 'bg-bg-secondary text-text-muted hover:text-text border border-neutral-800'
                    }`}
                  >
                    Time
                  </button>
                  <button
                    onClick={() => setPunctuationEndMode('words')}
                    className={`flex-1 px-3 py-1.5 rounded-lg font-mono text-sm transition-colors ${
                      config.punctuationEndMode === 'words'
                        ? 'bg-brand text-bg'
                        : 'bg-bg-secondary text-text-muted hover:text-text border border-neutral-800'
                    }`}
                  >
                    Words
                  </button>
                </div>
              </div>

              {config.punctuationEndMode === 'time' ? (
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-text-muted font-mono text-sm">
                      Duration:
                    </label>
                    <input
                      type="number"
                      value={localTimeAmount}
                      onChange={(e) => setLocalTimeAmount(e.target.value)}
                      className="w-full p-2 border border-neutral-700 rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
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
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-text-muted font-mono text-sm">
                      Count:
                    </label>
                    <input
                      type="number"
                      value={localWordsAmount}
                      onChange={(e) => setLocalWordsAmount(e.target.value)}
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
              )}

              <button
                onClick={handlePunctuationApply}
                className="w-full py-2 bg-brand text-bg rounded-lg font-bold hover:bg-brand/80 transition-colors"
              >
                Start Punctuation Mode
              </button>
            </div>
          )}
        </div>

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

export default ConfigModal

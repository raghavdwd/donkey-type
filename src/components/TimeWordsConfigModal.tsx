import React from 'react'
import useStore from '../store'

const TimeWordsConfigModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  if (!isOpen) return null
  const { config, setTimeAmount, setWordsAmount, setTimeUnit, setWordUnit } =
    useStore()
  const [selectedTab, setSelectedTab] = React.useState<'time' | 'words'>(
    config.mode === 'words' ? 'words' : 'time',
  )

  const [localTimeAmount, setLocalTimeAmount] = React.useState(
    config.timeAmount.toString(),
  )
  const [localWordsAmount, setLocalWordsAmount] = React.useState(
    config.wordsAmount.toString(),
  )

  const handleCustomTimeSubmit = () => {
    const val = parseInt(localTimeAmount)
    if (!isNaN(val) && val > 0) {
      setTimeAmount(val)
      onClose()
    } else {
      alert('Please enter a valid positive number for time amount.')
    }
  }

  const handleCustomWordsSubmit = () => {
    const val = parseInt(localWordsAmount)
    if (!isNaN(val) && val > 0) {
      setWordsAmount(val)
      onClose()
    } else {
      alert('Please enter a valid positive number for words amount.')
    }
  }

  const handlePresetTime = (amount: number) => {
    setTimeAmount(amount)
    setLocalTimeAmount(amount.toString())
    onClose()
  }

  const handlePresetWords = (amount: number) => {
    setWordsAmount(amount)
    setLocalWordsAmount(amount.toString())
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
          Test Configuration
        </h2>
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

export default TimeWordsConfigModal

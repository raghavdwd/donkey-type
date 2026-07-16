import { useState, useEffect } from 'react'
import clsx from 'clsx'
import useStore from '../store'
import { Switch } from './ui/switch'

type Tab = 'test' | 'keyboard'


/*
 * SettingsMenu
 *
 * Unified settings entry. Replaces the two separate "Configure Time/Words"
 * and "Keyboard Settings" buttons from the old header. Tabbed shell with
 * inline content (no double-backdrop). The original TimeWordsConfigModal
 * and KeyboardSettingsModal are left untouched for any external callers
 * (none today, but harmless to keep).
 */
export default function SettingsMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('test')

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-bg w-full max-w-md rounded-2xl border border-neutral-800 shadow-2xl p-6 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-mono text-text">Settings</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-xl leading-none w-8 h-8 rounded-lg hover:bg-bg-secondary transition-colors flex items-center justify-center"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="flex gap-1 mb-5 p-1 bg-bg-secondary/60 rounded-lg border border-neutral-800/60">
          <TabButton active={tab === 'test'} onClick={() => setTab('test')}>
            Test
          </TabButton>
          <TabButton
            active={tab === 'keyboard'}
            onClick={() => setTab('keyboard')}
          >
            Keyboard
          </TabButton>
        </div>

        {tab === 'test' ? <TestBody /> : <KeyboardBody />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-1 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider font-bold transition-all',
        active
          ? 'bg-bg text-brand shadow-sm'
          : 'text-text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}

function TestBody() {
  const {
    config,
    toggleRealtimeStats,
  } = useStore()


  return (
    <div className="space-y-5">
      <div className="pt-2 border-t border-neutral-800">
        <ToggleRow
          label="Show live stats while typing"
          checked={config.showRealtimeStats}
          onChange={(checked) => toggleRealtimeStats(checked)}
        />
      </div>
    </div>
  )
}

function KeyboardBody() {
  const { keyboard, config, toggleSound, toggleGhostMode } = useStore()
  type KeyboardTheme = typeof keyboard.theme
  const keyboardThemes: KeyboardTheme[] = [
    'classic',
    'mint',
    'royal',
    'dolch',
    'sand',
    'scarlet',
  ]

  return (
    <div className="space-y-4">
      <Row label="Theme">
        <select
          value={keyboard.theme}
          onChange={(e) =>
            useStore.setState({
              keyboard: { ...keyboard, theme: e.target.value as KeyboardTheme },
            })
          }
          className="px-2 py-1.5 bg-bg-secondary border border-neutral-700 rounded-lg font-mono text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {keyboardThemes.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </Row>

      <ToggleRow
        label="Display Keyboard"
        checked={keyboard.display}
        onChange={(checked) =>
          useStore.setState({
            keyboard: { ...keyboard, display: checked },
          })
        }
      />

      <ToggleRow
        label="Haptics"
        checked={keyboard.enableHaptics}
        onChange={(checked) =>
          useStore.setState({
            keyboard: { ...keyboard, enableHaptics: checked },
          })
        }
      />

      <ToggleRow
        label="Keypress Sound"
        checked={config.soundEnabled}
        onChange={(checked) => {
          toggleSound(checked)
        }}
      />

      <ToggleRow
        label="Ghost Mode"
        checked={config.ghostMode}
        onChange={(checked) => toggleGhostMode(checked)}
      />
    </div>
  )
}


function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-text font-mono text-sm">{label}</label>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Row label={label}>
      <Switch checked={checked} onChange={onChange} />
    </Row>
  )
}

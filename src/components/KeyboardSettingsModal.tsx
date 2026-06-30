import useStore from '../store'
import { Switch } from './ui/switch'

const KeyboardSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { keyboard, config } = useStore()
  const keyboardThemes = [
    'classic',
    'mint',
    'royal',
    'dolch',
    'sand',
    'scarlet',
  ]
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
        <h2 className="text-lg font-bold font-mono text-text mb-2">
          Keyboard Settings
        </h2>
        <p className="text-text-muted mb-4">
          Configure your keyboard preferences here.
        </p>
        <div className="mb-4">
          <label className="block text-text-muted font-mono text-sm mb-1">
            Theme:
          </label>
          <select
            value={keyboard.theme}
            onChange={(e) =>
              useStore.setState({
                keyboard: { ...keyboard, theme: e.target.value as any },
              })
            }
            className="w-full p-2 border border-neutral-700 rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {keyboardThemes.map((theme) => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-text-muted font-mono text-sm">
            Display Keyboard
          </label>
          <Switch
            checked={keyboard.display}
            onChange={(checked) =>
              useStore.setState({
                keyboard: { ...keyboard, display: checked },
              })
            }
          />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-text-muted font-mono text-sm">
            Enable Haptics
          </label>
          <Switch
            checked={keyboard.enableHaptics}
            onChange={(checked) =>
              useStore.setState({
                keyboard: { ...keyboard, enableHaptics: checked },
              })
            }
          />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-text-muted font-mono text-sm">
            Enable Sound
          </label>
          <Switch
            checked={config.soundEnabled}
            onChange={(checked) =>
              useStore.setState({
                keyboard: { ...keyboard, enableSound: checked },
                config: { ...config, soundEnabled: checked },
              })
            }
          />
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 bg-brand text-bg rounded-lg font-bold hover:bg-brand/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default KeyboardSettingsModal

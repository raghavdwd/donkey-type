'use client'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export function Switch({ checked, onChange, id }: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className="relative inline-flex h-6 w-11 cursor-pointer items-center"
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="absolute inset-0 rounded-full bg-neutral-700 transition-colors peer-checked:bg-brand" />
      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
    </label>
  )
}

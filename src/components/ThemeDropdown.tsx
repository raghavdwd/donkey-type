import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import useStore, { type ThemeName } from '../store'
import { Palette, Check } from 'lucide-react'

/*
 * THEME_PREVIEW
 *
 * Per-theme live preview metadata. Each entry maps a ThemeName to the
 * CSS variable values that represent its look. We render these as small
 * swatches inside the dropdown so the user sees the actual palette
 * before picking — picking should feel concrete, not abstract.
 *
 * Keeping the values inline (not reading from the live :root CSS vars)
 * means the swatches render even if a theme is broken, and we don't
 * need a runtime computed style read.
 */
const THEME_PREVIEW: Record<
  ThemeName,
  { bg: string; accent: string; name: string }
> = {
  default: { bg: '#111111', accent: '#eab308', name: 'default' },
  nord: { bg: '#2e3440', accent: '#88c0d0', name: 'nord' },
  matcha: { bg: '#f4f0eb', accent: '#7ca66f', name: 'matcha' },
  'matcha-fresh': {
    bg: '#f7fef9',
    accent: '#22c55e',
    name: 'matcha-fresh',
  },
  cyberpunk: { bg: '#000b18', accent: '#fcee0a', name: 'cyberpunk' },
  midnight: { bg: '#0f172a', accent: '#a78bfa', name: 'midnight' },
  rose: { bg: '#1a0f14', accent: '#f472b6', name: 'rose' },
}

export default function ThemeDropdown() {
  const config = useStore((s) => s.config)
  const changeTheme = useStore((s) => s.changeTheme)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /*
   * Hover preview.
   *
   * On row hover we set the data-theme attribute on <html> directly so the
   * page re-themes instantly — but we don't call changeTheme, so the store
   * stays on the user's actual selection. On mouseleave (and on dropdown
   * close) we restore the attribute to the committed theme.
   *
   * This is intentionally side-effect-only: no React state, no re-render.
   * The CSS variables flip via the [data-theme] selector and Tailwind
   * utilities follow. When the user clicks a row, changeTheme writes the
   * same attribute AND updates the store, so the preview becomes permanent.
   */
  const previewTheme = (theme: ThemeName) => {
    document.documentElement.setAttribute('data-theme', theme)
  }
  const restoreTheme = () => {
    document.documentElement.setAttribute('data-theme', config.theme)
  }

  /*
   * Outside click + Escape dismissal.
   *
   * We attach the listeners to document instead of the container's children
   * so a click inside the panel doesn't bubble back up and close it. The
   * Escape listener is mounted only while open, so it can't fire on a
   * closed dropdown.
   */
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        restoreTheme()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        restoreTheme()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
      restoreTheme()
    }
  }, [open, config.theme])

  const current = config.theme

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Theme"
        aria-label="Theme"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={clsx(
          'inline-flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all',
          open
            ? 'text-brand bg-brand/10'
            : 'text-text-muted hover:text-text hover:bg-bg-secondary/60',
        )}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{current}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-bg-secondary bg-bg shadow-xl p-1.5"
        >
          {Object.entries(THEME_PREVIEW).map(([key, t]) => {
            const isActive = key === current
            return (
              <button
                key={key}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => previewTheme(key as ThemeName)}
                onMouseLeave={restoreTheme}
                onFocus={() => previewTheme(key as ThemeName)}
                onBlur={restoreTheme}
                onClick={() => {
                  changeTheme(key as ThemeName)
                  setOpen(false)
                }}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left font-mono text-xs transition-colors',
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-text hover:bg-bg-secondary/70',
                )}
              >
                <span
                  className="w-7 h-7 rounded-md shrink-0 border border-black/10 flex items-center justify-center"
                  style={{ background: t.bg }}
                  aria-hidden
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: t.accent }}
                  />
                </span>
                <span className="flex-1 lowercase">{t.name}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

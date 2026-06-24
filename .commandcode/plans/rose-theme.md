# Add Rose Theme

## What

Add a new dark theme called **"Rose"** with warm pink-coral accents — fills the pink/rose gap in the current 5-theme lineup.

## Color Palette

| Token | Hex | Description |
|-------|-----|-------------|
| `--brand` | `#f472b6` | Vibrant rose pink — cursor, highlights, accent |
| `--brand-light` | `#fda4af` | Soft coral-pink — hover states, lighter highlights |
| `--bg` | `#1a0f14` | Deep rosewood black — main background |
| `--bg-secondary` | `#2a1a20` | Slightly lighter rosewood — cards, panels, containers |
| `--text` | `#fff1f2` | Rose-tinted near-white — primary text |
| `--text-muted` | `#9f6a7a` | Dusty muted rose — secondary/labels |
| `--error` | `#be123c` | Deep rose-red — typing mistakes |
| `--success` | `#10b981` | Emerald green — correct keystrokes (contrasts well with pink) |

## Files to Edit (3 changes)

### 1. `src/index.css` — Add CSS custom properties block

Insert after the `[data-theme="midnight"]` block, at the end of the theme section (before the `@theme` block):

```css
[data-theme="rose"] {
  --brand: #f472b6;
  --brand-light: #fda4af;
  --bg: #1a0f14;
  --bg-secondary: #2a1a20;
  --text: #fff1f2;
  --text-muted: #9f6a7a;
  --error: #be123c;
  --success: #10b981;
}
```

Also add a multi-line comment block above it explaining the theme (match the existing comment style).

### 2. `src/store.ts` (line ~103) — Update `ThemeName` type

Add `'rose'` to the union:

```ts
export type ThemeName = 'default' | 'nord' | 'matcha' | 'cyberpunk' | 'midnight' | 'rose';
```

### 3. `src/components/Header.tsx` (line ~63) — Add to cycle array

Add `'rose'` at the end of the `THEMES` constant:

```ts
const THEMES: ThemeName[] = [
  'default',
  'nord',
  'matcha',
  'cyberpunk',
  'midnight',
  'rose',
]
```

## How it works (zero new logic needed)

- CSS `[data-theme="rose"]` selector activates via `data-theme` attribute on `<html>` — same mechanism as all other themes
- Tailwind bridge in `@theme` block already maps `--color-*` variables, so `bg-bg`, `text-brand`, etc. work with no changes
- `changeTheme()` in the Zustand store already handles any `ThemeName` — just passing the string
- THEMES array cycling in `handleNextTheme()` uses modular arithmetic, so adding to the end just extends the rotation naturally
- Order: default → nord → matcha → cyberpunk → midnight → rose → (wraps back to default)

## Verification

1. Start the dev server
2. Click the palette icon in the header — cycle through until "rose" appears
3. Confirm the theme applies with dark rosewood background and pink accents everywhere
4. Check all surfaces: header buttons, stats panel, typing area, history modal
5. Confirm error characters show deep red (`#be123c`) and correct characters show emerald (`#10b981`)
6. Refresh the page — theme should persist from localStorage

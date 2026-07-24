# AGENTS.md

## Repo type
Single-package React 19 app (Vite 7, TypeScript project references, TailwindCSS v4, Zustand v5). No tests configured.

## Commands
- Dev: `bun dev` (served at `http://localhost:5173`)
- Build: `bun run build` (runs `tsc -b` first, then `vite build`)
- Lint: `bun run lint`
- Note: README says pnpm, but repo contains `bun.lock` and no `pnpm-lock.yaml`. Use whichever matches the existing lockfile; if in doubt, `npm` works because `node_modules` is already present.

## Architecture
- Entry: `src/main.tsx` -> `src/App.tsx`
- Global state: `src/store.ts` (Zustand). Persists `config`, `history`, and `streak` to `localStorage` under key `donkey-type-storage`.
- Themes: CSS variables controlled by `data-theme` attribute on `<html>`. Theme changes write synchronously to the DOM in the store (`changeTheme`). Do not rely on React render cycle alone for theme application.
- Word lists: `/words.txt` is fetched asynchronously in `src/lib/word-list.ts` on module load. Hindi text is fetched from Wikipedia API with static fallbacks in `src/lib/hindi-text.ts`.
- Keyboard/audio: `src/lib/audio.ts` exports `registerKeySoundPlayer`/`playKeySound`; the UI keyboard lives in `src/components/ui/keyboard.tsx`.

## Vite quirks
- `vite.config.ts` aliases `react` and `react-dom` to `node_modules/...` to force a single React copy. Do not remove these aliases.

## TypeScript
- Project references: `tsconfig.app.json` (src) and `tsconfig.node.json` (vite.config.ts). Always run `tsc -b` before `vite build`.

## Styling
- Tailwind v4 with `@import "tailwindcss"` in `src/index.css`. Theme colors are CSS variables on `:root` / `[data-theme="..."]`.
- `cn()` utility: `src/lib/utils.ts` (clsx + tailwind-merge).

## Code style
- Prettier: no semicolons, single quotes, trailing commas everywhere, 2-space tabs, arrow parens always.
- ESLint flat config with React Hooks and React Refresh plugins.

## Static assets
- `public/words.txt` is required at runtime for English word generation.
- `public/sounds/` contains keyboard sound files.
- `public/og-image.png` and `public/logo.svg` are used in `<head>`.

## Repo conventions
- No tests, no CI, no pre-commit hooks.
- Store mutations are defined in `src/store.ts` as a single `create` block.
- `App.tsx` owns the typing timer (`setInterval` in `handleStartTyping`) and test lifecycle (`initGame`, `finishTest`). `Tab` key restarts via a `keydown` listener.

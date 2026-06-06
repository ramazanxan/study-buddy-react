# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

No test runner is configured yet.

## Stack

- **React 19** + **Vite 8** — JSX (not TypeScript), ES modules
- ESLint with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`

## Architecture

This is a minimal starter — the app lives almost entirely in `src/App.jsx`. There is no routing, no global state management, and no component hierarchy yet. As the study-buddy features get built out, components should be added under `src/` alongside `App.jsx`.

Static assets imported by JS go in `src/assets/`; files that need to be served at a fixed public URL (e.g. `icons.svg` referenced via `<use href="/icons.svg#...">`) go in `public/`.

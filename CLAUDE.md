# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarkBoard is a zero-dependency, single-file project tracker. There is no build step, no package manager, and no server. The entire application is `index.html` — open it directly in Chrome or Edge 86+ (requires the File System Access API). Board data is stored as plain `.md` files on disk.

## Running the App

Open `index.html` directly in Chrome or Edge 86+. No build step or dev server required.

## Development Commands

```bash
npm install                          # Install dev dependencies (vitest, playwright, serve)
npm test                             # Unit tests (Vitest) — parseMD/serialiseMD
npm run test:e2e                     # E2E tests (Playwright) — requires: npx playwright install chromium
npm run test:all                     # Both unit and E2E
npm run test:watch                   # Unit tests in watch mode
```

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Runs unit + E2E tests on push to `main` and on PRs.
- **Pages** (`.github/workflows/pages.yml`): Deploys `index.html` to GitHub Pages on push to `main`.
- **Release** (`.github/workflows/release.yml`): Creates a GitHub Release with `index.html` attached when a `v*` tag is pushed.

To release: `git tag v1.0.0 && git push --tags`

## Testing

Unit tests (`tests/parse.test.js`, `tests/serialise.test.js`) use a helper (`tests/helpers.js`) that extracts the `<script>` block from `index.html` and evaluates it in a sandbox — no need to split the source file.

E2E tests (`tests/e2e/board.spec.js`) use Playwright with Chromium. They inject board data via `page.evaluate()` to bypass the File System Access API picker. The Playwright config uses `serve` to host the files locally.

## Architecture

The entire application lives in `index.html`:
- **Lines 7–202**: CSS — 4 built-in themes (`dark`, `light`, `ocean`, `amber`) defined via CSS custom properties on `:root` and `[data-theme="..."]` selectors. Theme is persisted to `localStorage` under key `mb-theme`. A fifth `custom` theme can be loaded at runtime via the CSS plugin system (see Key Functions below).
- **Lines 203–265**: HTML structure — `#tab-bar`, `#connect-screen`, `#board` (phases, stats, progress bar, notes), `#toast`.
- **Lines 267–675**: Vanilla JS — no frameworks, no imports.

### State

```js
BOARDS = [{name, fileHandle, data, unsaved}]  // all open boards
ACTIVE = -1                                    // index into BOARDS
DRAG / DRAG_OVER                               // drag-and-drop transient state
```

`board()` and `data()` are convenience accessors for `BOARDS[ACTIVE]` and `BOARDS[ACTIVE].data`.

### Key Functions

| Function | Purpose |
|---|---|
| `parseMD(text)` | Parses a `.md` string into a board data object |
| `serialiseMD(d)` | Converts a board data object back to a `.md` string |
| `render()` | Rebuilds the DOM from `data()` — called after every state change |
| `openBoard()` | File picker → `parseMD` → push to `BOARDS` → `render` |
| `saveBoard(idx?)` | Writes `serialiseMD(data)` back to the file via the File System Access API |
| `cycleFeature(pi, fi)` | Cycles a feature's status (`pending → active → done → pending`), auto-derives phase status, then saves |
| `setTheme(t)` | Applies `data-theme` attribute and persists to `localStorage` |
| `pickCustomTheme()` | File picker for a `.css` plugin → `loadCustomTheme` |
| `loadCustomTheme(css)` | Injects CSS into `<style id="mb-custom-theme">`, saves to `localStorage`, activates `custom` theme |
| `clearCustomTheme()` | Removes injected CSS, clears `localStorage`, resets to dark |

Auto-save triggers on every status change and after a 1 s debounce on notes input.

### Markdown Format

```
# Board Title

<!-- meta: version=1.0 updated=2026-01-01 tests=42 -->

## Phase Name | done|active|pending
<!-- sub: Optional subtitle -->
- [x] Done feature :: description [2026-04-15]
- [~] Active feature :: description
- [ ] Pending feature

## Notes

Free text here.
```

- Phase status is auto-derived from feature statuses on every `cycleFeature` call — don't rely on the stored value as ground truth.
- Due date badges: overdue = red, ≤7 days = amber, future = grey, done = strikethrough.
- `parseMD` / `serialiseMD` are the authoritative round-trip format — editing either requires verifying both.

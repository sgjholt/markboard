# Contributing to MarkBoard

Thanks for your interest in contributing! Here's how to get started.

## Core principle

MarkBoard is a **single-file, zero-dependency** application. The entire app lives in `index.html` — no frameworks, no build step. All contributions must preserve this constraint. Development tooling (tests, CI) can use dependencies, but the shipped product is always one HTML file.

## Getting started

1. Fork and clone the repo
2. Open `index.html` in Chrome or Edge 86+ to run the app
3. Install dev dependencies for testing: `npm install`

## Running tests

```bash
npm test            # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright, requires: npx playwright install chromium)
npm run test:all    # Both
```

## Making changes

- **CSS**: Lines 8–232 of `index.html`. The four built-in themes use CSS custom properties — update all four theme blocks if adding a new variable. Custom user themes are loaded at runtime via `loadCustomTheme()` and stored in `localStorage`; see the **Custom themes** section in the README.
- **HTML**: Lines 234–313. Keep it minimal.
- **JS**: Lines 314–940. No imports, no modules — everything is in the global scope.

If you change `parseMD()` or `serialiseMD()`, make sure the round-trip test in `tests/serialise.test.js` still passes — these two functions must stay in sync.

The plugin system (`loadPluginsFromDir`, `applyBoardPlugins`) is intentionally separate from the board I/O functions — keep plugin loading async and non-blocking. Any new plugin file type should be added to `loadPluginsFromDir` and documented in `README.md` under **Project plugins (.mbconfig)**.

## Pull request checklist

- [ ] `index.html` remains a single, self-contained file (no external scripts or stylesheets)
- [ ] `npm test` passes
- [ ] `npm run test:e2e` passes
- [ ] New features include tests where applicable

## Reporting bugs

Use the [bug report template](https://github.com/jamesholt92/markboard/issues/new?template=bug_report.md). Include your browser and OS.

## Feature requests

Open an issue using the [feature request template](https://github.com/jamesholt92/markboard/issues/new?template=feature_request.md). Keep in mind the single-file constraint — features that would require a build step or external dependencies are unlikely to be accepted.

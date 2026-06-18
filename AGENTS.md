# Repository Guidelines

## Project Structure & Module Organization
HTML entry points (`index.html`, `units.html`, `flashcards.html`, `quiz.html`) live at the repo root and drive the UI. Client logic sits in `js/`, split by feature (`units.js`, `flashcards.js`, `quiz.js`, `audio-service.js`). Shared styles reside in `css/`, while vocab assets and raw datasets stay under `data/`. Static server helpers (`server.py`, `server.cmd`) belong in the root for easy local hosting.

## Build, Test & Development Commands
Run `server.cmd` to launch the threaded no-cache server on port 8000; use `run.cmd` when a quick vanilla `http.server` is enough. Prefer `py -3 server.py` during iterative UI work so stale assets never linger in cache. Open `data-viewer.html` directly to inspect bulk word data without booting the app shell.

## Coding Style & Naming Conventions
JavaScript modules use four-space indentation, ES6 modules, and descriptive function names (`initializeNavigation`, `displaySearchResults`). Favor camelCase for variables and functions, PascalCase for classes, and kebab-case for CSS classes. Keep HTML attribute order logical: data attributes, ARIA tags, then event hooks. When editing datasets, ensure IDs stay zero-padded and English entries precede localized strings.

## Testing Guidelines
There is no automated suite yet; rely on feature-specific smoke checks. After changes in `flashcards.js` or `quiz.js`, walk through Unit selection, flashcard flips, quiz submissions, and audio playback. Confirm localStorage updates via browser devtools and verify multilingual strings render correctly. Capture console output to ensure no warnings surface.

Speech-synthesis highlighting needs an explicit cross-browser and cross-voice check. Do not assume `SpeechSynthesisUtterance.onboundary` behaves the same across browsers or even across voices in the same browser. Windows built-in Microsoft voices support reliable word-by-word highlighting, while other voices may only highlight the first word or emit incomplete boundary events. Keep per-word highlighting only for known supported voices; fall back to whole-sentence highlighting for unsupported voices or platforms such as Android Chrome.

## Commit & Pull Request Guidelines
Commits follow short, imperative subjects (~50 chars) that describe the behavioral change (e.g., "Add pronunciation speed control"). Group related UI and data updates together to keep history reviewable. PRs should summarize the user-facing impact, list test steps performed, and include before/after screenshots for layout tweaks. Link relevant vocabulary issues or Trello cards so future maintainers can trace the source request.

## Data & Asset Hygiene
Keep audio URLs and example sentences synchronized between `data.js` and any YAML/CSV source of record. When adding media, store files beneath `data/images/` and reference them with relative paths. Run a quick spell-check pass on English terms to prevent quiz regressions.

When creating or extending a vocabulary unit JSON such as `data/unit-18.json`, follow the established schema exactly: top-level `id`, `title`, and `words`; each word should use `english`, `pronunciation`, and a `chinese` array, with optional `example`, `phrases`, `tense`, and `notes`. Keep example sentences as alternating English and Traditional Chinese strings, and bracket the target word in English examples and phrase patterns so the UI can highlight it correctly.

For high-frequency units, prefer standalone top-level entries for derivative forms when they have their own part of speech, example sentence, or phrase set. This worked well for Unit 18 with entries such as `competition`, `construction`, `difference`, `manager`, `softly`, `transportation`, `résumé`, and `resume`. Use `related` only for lightweight family words that do not need full standalone content.

When adding a brand-new unit, also register it in `data/units-index.json`. When appending new vocabulary batches to an existing unit, preserve the current ordering and append in place instead of reshuffling older entries. After every unit-data edit, run a quick JSON parse check, for example with `node -e "JSON.parse(require('fs').readFileSync('data/unit-18.json','utf8'))"`, to catch punctuation or quoting mistakes immediately.

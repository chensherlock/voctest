# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript vocabulary memorization website for English4U vocabulary. Built with HTML, CSS, and ES6+ JavaScript - no build tools or frameworks required.

## Running the Application

**Development server:**
```bash
py -3 -m http.server
# or just run: run.cmd
```

The application runs entirely in the browser at `http://localhost:8000`

## Architecture

### Core Data Layer (js/data.js)

Central vocabulary data store and shared utilities:
- `vocabularyData` object contains all units and words
- Unit structure: `{ id, title, default, words: [{ english, chinese, example, audioUrl }] }`
- Shared functions used across pages:
  - `getAllUnits()` - returns all vocabulary units
  - `getUnitById(unitId)` - get specific unit
  - `getWordsFromUnit(unitId)` - get words from one unit
  - `getWordsFromUnits(unitIds)` - get words from multiple units
  - `getAllWords()` - flatten all words from all units
  - `searchWords(query)` - search English/Chinese terms
- Audio playback with fallback chain:
  1. FreeDictionaryAPI (primary)
  2. Browser speech synthesis (fallback)
- Progress tracking via localStorage (`vocabProgress` key)
- Voice preference stored in localStorage (`preferredVoice` key)

### Page-Specific Scripts

Each HTML page has a corresponding JS file with isolated state:
- `units.js` - unit listing and word detail view
- `flashcards.js` - flashcard practice with flip animation
- `quiz.js` - multi-unit quiz system with range selection
- `script.js` - shared navigation and site-wide utilities

### Key Features

**Multi-unit selection (quiz.js & flashcards.js):**
- Supports selecting multiple units via checkboxes
- "All units" checkbox for quick selection
- Default units auto-selected on page load
- Vocabulary range selector for subset practice
- State stored in arrays: `selectedUnitIds`, `allUnitWords`

**Audio system:**
- Primary: FreeDictionaryAPI for real pronunciations
- Fallback: Web Speech API synthesis
- Audio provider selector in UI
- Graceful degradation if audio unavailable

**Progress tracking:**
- Per-word progress stored in localStorage
- Mastery levels tracked across sessions
- No backend - fully client-side

## Code Style

From .github/copilot-instructions.md:
- 4 spaces indentation
- camelCase for variables/functions
- Semantic HTML elements
- Modern ES6+ JavaScript
- Naming conventions:
  - `element` suffix for DOM elements (e.g., `cardElement`)
  - `btn` suffix for buttons (e.g., `submitBtn`)
  - `List`/`Container` suffix for parent elements
  - `current` prefix for state variables (e.g., `currentUnitId`)
  - Plural names for arrays (e.g., `words`, `units`)

## Adding Vocabulary

Add new units to `vocabularyData.units` array in `js/data.js`:
```javascript
{
    id: 7,
    title: "Unit 7",
    default: false,  // true for auto-selection in quiz
    words: [
        { english: "word", chinese: "翻译", example: "Example sentence", audioUrl: "" }
    ]
}
```

## Data Import

Use `js/data-importer.js` in browser console on English4U website to scrape vocabulary data. Requires adjusting selectors to match the source page structure.

## Testing

No automated test suite. Manual testing across modern browsers (Chrome, Firefox, Safari, Edge).

## Important Implementation Notes

- Unit IDs can be passed via URL query params: `?unit=3`
- Quiz supports multi-unit selection; flashcards currently single-unit
- All state is ephemeral except localStorage progress/preferences
- No server-side components - purely static files
- Audio URLs can be empty; system will use speech synthesis fallback

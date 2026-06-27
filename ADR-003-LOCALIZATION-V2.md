# ADR-003: Localization V2 - Bundle/Lazy Architecture

## Status: Accepted
## Date: 2025-06-28

## Context
All 15 language packs were bundled in the main JS payload (~200KB of strings),
increasing initial load time. Fonts for all scripts loaded upfront.

## Decision
- Bundle only AR and EN in the main JS module
- Move all other languages to lazy-loaded JSON packs (/locales/lazy/{code}.json)
- Implement LocalizationService with IndexedDB + Cache API persistence
- Lazy-load fonts for non-AR/EN languages via Google Fonts API
- TutorialPlayer uses TutorialEngine for dynamic native TTS voice selection
- Enforce pricing $10/$25/$100 in all tutorial scripts

## Consequences
- Initial bundle reduced by ~180KB of translation strings
- First load of a new language adds ~50ms latency, then cached offline
- Works offline after first language load (IndexedDB/Cache API)
- Native TTS voices preferred; MSA enforced for Arabic
- Font flash eliminated for AR/EN; swap display for others

## File Map
- `frontend/src/core/LocalizationService.js` - Service with persistence
- `frontend/src/core/FontLoader.js` - Lazy font loading
- `frontend/src/core/TutorialEngine.js` - TTS voice management
- `frontend/src/core/languages.js` - Language registry
- `frontend/src/locales/bundled/ar.js` - Bundled Arabic
- `frontend/src/locales/bundled/en.js` - Bundled English
- `frontend/src/locales/lazy/*.json` - Lazy-loaded packs

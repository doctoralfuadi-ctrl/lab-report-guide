# ADR-004: Centralized Pricing Configuration

## Status: Accepted
## Date: 2025-06-28

## Context
Pricing ($10/$25/$100) was hardcoded in multiple locations including tutorial scripts,
pricing UI, and backend checkout logic, leading to inconsistencies.

## Decision
- Single source of truth in `backend/core/config.py`
- Frontend pricing enforced in locale files and TutorialEngine.enforcePricing()
- All tutorial step text run through pricing correction before display/TTS
- Backend PRICING dict referenced by subscription endpoints

## Pricing (USD, yearly)
- Standard: $10/year
- Premium: $25/year  
- Clinic: $100/year

## File Map
- `backend/core/config.py` - CoreConfig.price_standard_yearly etc.
- `backend/server.py` - PRICING dict
- `frontend/src/locales/bundled/ar.js` - pricing.plans
- `frontend/src/locales/bundled/en.js` - pricing.plans
- `frontend/src/core/TutorialEngine.js` - enforcePricing()

# Math Mog Multi-Repo Sync Guide

Math Mog code exists in three repositories. This repo (standalone mathmog) is the **source of truth** for core logic. When making changes, use this guide to determine which repos need the update.

## Repositories

| Repo | Path | Purpose |
|------|------|---------|
| **mathmog** (standalone) | `src/` | Full-featured standalone app, source of truth for core logic |
| **peakprep-student-portal** | `src/**/mathmog/` | Integrated into student portal with homework mode |
| **peakprep-website** | TBD | Demo/marketing version for front-end site |

## Change Categories

### Core Logic (sync to ALL repos)
These changes should be synced everywhere:
- `lib/math-problems.ts` - Problem generation algorithms
- `lib/types.ts` - TypeScript types and interfaces
- `lib/drill-topics.ts` - Topic definitions and configurations
- Answer validation logic
- Bug fixes in problem generation

### Speed Challenge (sync to ALL repos)
- Timer logic
- Auto-advance behavior
- Results display

### UI/UX Improvements (usually sync to ALL)
- `components/problem-display.tsx` - Problem rendering
- `components/difficulty-selector.tsx` - Mode/difficulty selection
- Keyboard shortcuts
- Mobile responsiveness fixes

### App-Specific Features (DO NOT sync)

**Standalone only:**
- Leaderboards (if re-enabled)
- User accounts/profiles
- Features still in development/testing
- `ai/` folder - AI-related features

**PeakPrep Portal only:**
- `context/homework-context.tsx` - Homework mode integration
- Tutor assignment features
- Student progress tracking
- Any Firebase/backend integration

**Website only:**
- Simplified demo mode
- Marketing-specific UI
- Limited feature set

## Sync Checklist

After making Math Mog changes, complete this checklist:

```
[ ] Identify change category (core/speed/UI/app-specific)
[ ] If core/shared change:
    [ ] Note the specific files changed
    [ ] Sync to: [ ] peakprep-portal  [ ] peakprep-website
    [ ] Test in each repo after sync
[ ] If app-specific: no sync needed
```

## Recent Syncs

| Date | Change | From | To | Files |
|------|--------|------|-----|-------|
| 2026-02-13 | Speed challenge auto-advance 100ms, disable transition | mathmog | peakprep-portal | problem-display.tsx |

## Notes

- This repo is the source of truth for core problem generation logic
- When developing new features, prototype here first, then sync to other repos as needed
- Core problem generation logic should stay identical across all repos
- UI components may have slight variations (e.g., portal has homework badges)
- The portal has a different initialization flow for speed challenge (fixed a bug there that doesn't exist here)

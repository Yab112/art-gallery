# [Bug/UX] Dropdown Menu Causes Page Content to Shift Horizontally

## Problem Description

When opening dropdown menus (particularly the mega-menu for Artworks/Artists navigation and user dropdown), the page content shifts horizontally, creating a jarring visual experience.

## Current Behavior

1. User clicks on Artworks or Artists dropdown
2. Page content shifts left/right by ~15-17px
3. When dropdown closes, content shifts back
4. Most noticeable on Windows browsers where scrollbar takes up space

## Root Cause

Radix UI components trigger scroll-locking behavior that:
1. Adds `overflow: hidden` to body
2. Adds margin/padding compensation for disappearing scrollbar
3. This compensation causes the visible page shift

## Files Affected

- `src/components/mega-menu.tsx`
- `src/components/user-dropdown.tsx`
- `src/index.css`

## Quick Fix

Add to `src/index.css`:

```css
/* Prevent page shift when dropdowns open */
html {
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

body[data-scroll-locked],
html[data-scroll-locked] {
  margin: 0 !important;
  padding-right: 0 !important;
  overflow-y: scroll !important;
}

body[data-radix-scroll-lock],
html[data-radix-scroll-lock] {
  margin: 0 !important;
  padding-right: 0 !important;
}
```

## Acceptance Criteria

- [ ] Open Artworks mega-menu - no page shift
- [ ] Open Artists mega-menu - no page shift
- [ ] Open user dropdown - no page shift
- [ ] Test on Chrome Windows (scrollbar visible by default)
- [ ] Test on Firefox, Edge
- [ ] Test rapid open/close - no accumulated shift

## Labels

`bug`, `ui/ux`, `medium-priority`

## Priority

**Medium** - User experience issue affecting perceived quality

## Related

Previous fix documented in `docs/RADIX_UI_SELECT_PAGE_SHIFT_FIX.md`

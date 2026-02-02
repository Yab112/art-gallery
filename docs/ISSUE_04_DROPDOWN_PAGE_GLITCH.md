# Issue #4: Dropdown/Page Glitch - Visual Shifting When Opening Dropdowns

## Problem Summary

When opening dropdown menus (particularly the mega-menu for Artworks and Artists navigation, and user dropdown), the page content may shift horizontally. This creates a jarring visual experience and makes the interface feel unstable.

## Current Implementation Analysis

### 1. Mega Menu Component (`src/components/mega-menu.tsx`)

The mega-menu uses a fixed positioning approach:

```typescript
// Line 262-267: Current positioning
{isOpen && (
    <div
        className="-translate-x-1/2 fixed top-[73px] left-1/2 z-50 w-[95vw] max-w-[1200px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
    >
```

**Potential Issues:**
- Uses `fixed` positioning which can cause scroll lock behavior
- The `top-[73px]` is hardcoded and may not match header height in all scenarios
- No prevention of body scroll when menu is open

### 2. User Dropdown Component (`src/components/user-dropdown.tsx`)

```typescript
// Line 107-108: Current dropdown container
{isOpen && (
    <div className="absolute right-0 z-[100] mt-2 w-72 rounded-lg border bg-white shadow-xl">
```

**Overlay Implementation:**
```typescript
// Line 250: Click-outside overlay
{isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />}
```

**Potential Issue:**
- The fixed overlay can trigger scroll locking behavior in some browsers
- Z-index layering between overlay (z-90) and dropdown (z-100) can cause rendering issues

### 3. Radix UI Select Components

From previous documentation (`docs/RADIX_UI_SELECT_PAGE_SHIFT_FIX.md`), Radix UI Select components cause page shift due to:
- Default `modal={true}` behavior
- Adding `overflow: hidden` to body
- Adding margin/padding compensation for scrollbar

### 4. Header Component (`src/components/header.tsx`)

```typescript
// Line 296-297: Header styling
<header className="sticky top-0 z-50 border-b bg-white">
    <div className="mx-auto max-w-7xl overflow-visible px-4 py-4">
```

**Issue:** The `overflow-visible` is set correctly but the mega-menu's fixed positioning can still cause issues.

### 5. Dropdown Menu UI Component (`src/components/ui/dropdown-menu.tsx`)

Uses Radix UI primitives which have known scroll-lock behavior:

```typescript
const DropdownMenuContent = React.forwardRef<...>(
    ({ className, sideOffset = 4, ...props }, ref) => (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                ref={ref}
                sideOffset={sideOffset}
                className={cn(
                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ...",
                    className
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    )
)
```

## Symptoms

1. **Horizontal Page Shift**: Page content moves left or right when dropdowns open/close
2. **Scrollbar Flicker**: Scrollbar appears/disappears causing layout shift
3. **Content Jump**: Text and images jump position momentarily
4. **Most Noticeable On**: Windows browsers (scrollbar takes up space)

## Root Cause

The page shift is caused by multiple factors:

1. **Scroll Locking**: When dropdowns open, the browser may add `overflow: hidden` to the body, causing the scrollbar to disappear and the page to shift by ~15-17px
2. **Compensation Padding**: Libraries add margin/padding to compensate, but this causes shift in the opposite direction
3. **Z-Index Stacking**: Overlays and fixed elements can trigger repaints

## Proposed Solutions

### Solution 1: CSS Global Fix (Quick Fix)

Add to `src/index.css`:

```css
/* Prevent page shift when modals/dropdowns open */
html {
  overflow-y: scroll; /* Always show scrollbar */
}

/* Prevent Radix UI scroll lock from shifting page */
body[data-scroll-locked],
html[data-scroll-locked] {
  margin-right: 0 !important;
  margin-left: 0 !important;
  padding-right: 0 !important;
  padding-left: 0 !important;
  overflow-y: scroll !important;
}

body[data-radix-scroll-lock],
html[data-radix-scroll-lock] {
  margin-right: 0 !important;
  margin-left: 0 !important;
  padding-right: 0 !important;
  padding-left: 0 !important;
}

/* Prevent scrollbar width compensation */
body {
  scrollbar-gutter: stable;
}
```

### Solution 2: Update Mega Menu Component

```typescript
// src/components/mega-menu.tsx

// Add useEffect to prevent body scroll issues
useEffect(() => {
    if (mobileMode) return

    // Prevent scroll lock from causing page shift
    const style = document.createElement('style')
    style.id = 'mega-menu-scroll-fix'
    style.textContent = `
        body { 
            overflow-y: scroll !important;
            margin-right: 0 !important;
            padding-right: 0 !important;
        }
    `
    
    if (isOpen) {
        document.head.appendChild(style)
    }
    
    return () => {
        const existingStyle = document.getElementById('mega-menu-scroll-fix')
        if (existingStyle) {
            existingStyle.remove()
        }
    }
}, [isOpen, mobileMode])

// Update the dropdown container
{isOpen && (
    <div
        className="fixed top-[73px] left-1/2 z-50 w-[95vw] max-w-[1200px] -translate-x-1/2 transform overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
        style={{ 
            // Use transform instead of margin for positioning to avoid layout shifts
            willChange: 'transform, opacity'
        }}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
    >
```

### Solution 3: Update User Dropdown

```typescript
// src/components/user-dropdown.tsx

// Update the overlay to not cause layout shift
{isOpen && (
    <>
        {/* Invisible click-catcher that doesn't affect layout */}
        <div 
            className="fixed inset-0" 
            style={{ 
                zIndex: 90,
                // Prevent any layout impact
                pointerEvents: 'auto',
                background: 'transparent'
            }} 
            onClick={() => setIsOpen(false)} 
            aria-hidden="true"
        />
        <div 
            className="absolute right-0 z-[100] mt-2 w-72 rounded-lg border bg-white shadow-xl"
            style={{
                // Hardware acceleration to prevent paint issues
                transform: 'translateZ(0)',
                willChange: 'transform, opacity'
            }}
        >
            {/* Dropdown content */}
        </div>
    </>
)}
```

### Solution 4: Add Modal Prevention to Radix Components

Update Select components to use `modal={false}`:

```typescript
// src/components/ui/select.tsx
// When using Select, pass modal={false}
<Select 
    value={value} 
    onValueChange={onChange}
    {...({ modal: false } as any)} // Prevent modal scroll lock behavior
>
```

### Solution 5: Use Popper/Floating UI for Positioning (Advanced)

Consider migrating to Floating UI for better positioning:

```bash
npm install @floating-ui/react
```

```typescript
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react'

// In component
const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
})

// In JSX
<button ref={refs.setReference}>...</button>
{isOpen && (
    <div ref={refs.setFloating} style={floatingStyles}>
        {/* Dropdown content */}
    </div>
)}
```

## Implementation Priority

1. **First**: Apply CSS global fix (Solution 1) - Immediate impact, low risk
2. **Second**: Update mega-menu component (Solution 2) - Targeted fix
3. **Third**: Update user dropdown (Solution 3) - Consistent behavior
4. **Fourth**: Add modal={false} to Select components (Solution 4)
5. **Optional**: Consider Floating UI migration (Solution 5) - Long-term improvement

## Files to Modify

1. `src/index.css` - Add global CSS fixes
2. `src/components/mega-menu.tsx` - Add scroll lock prevention
3. `src/components/user-dropdown.tsx` - Update overlay and dropdown styling
4. `src/components/ui/select.tsx` - Add modal={false} default
5. Any component using Radix Select - Apply modal={false}

## Testing Checklist

### Visual Tests
- [ ] Open Artworks mega-menu - no page shift
- [ ] Open Artists mega-menu - no page shift  
- [ ] Open user dropdown - no page shift
- [ ] Open category filters on marketplace - no page shift
- [ ] Open Select dropdowns on sell art page - no page shift

### Browser Tests
- [ ] Test on Chrome Windows (scrollbar visible by default)
- [ ] Test on Firefox Windows
- [ ] Test on Edge
- [ ] Test on Safari macOS
- [ ] Test on Chrome macOS
- [ ] Test on mobile browsers

### Interaction Tests
- [ ] Rapidly open/close dropdowns - no accumulated shift
- [ ] Open dropdown while scrolled down - no jump
- [ ] Open nested dropdowns - no shift
- [ ] Keyboard navigation in dropdowns - no shift

## Performance Considerations

1. **CSS-only solution**: Zero runtime overhead
2. **JavaScript solution**: Minimal overhead, only on open/close
3. **Hardware acceleration**: `transform` and `willChange` can improve smoothness

## Related Documentation

- [Radix UI Select Page Shift Fix](./RADIX_UI_SELECT_PAGE_SHIFT_FIX.md) - Previous fix for similar issue
- [Radix UI GitHub Issue #3251](https://github.com/radix-ui/primitives/issues/3251)

## Browser-Specific Notes

### Windows
- Scrollbar takes up ~17px of space
- Most noticeable shift when scrollbar appears/disappears

### macOS
- Scrollbar overlays content (doesn't take space)
- Less noticeable but still can occur

### Mobile
- Usually no visible scrollbar
- Touch interactions may still cause minor shifts

## Priority

**Medium** - User experience issue affecting professionalism

## Estimated Effort

- CSS Global Fix: 30 minutes
- Mega Menu Update: 1-2 hours
- User Dropdown Update: 1 hour
- Select Component Updates: 1-2 hours
- Testing: 2-3 hours

**Total: 5-8 hours**

---

**Status:** 🟡 Partially Addressed (Select dropdowns fixed)  
**Severity:** Medium - UX Issue  
**Category:** UI/UX Bug

## Quick Fix Implementation

If you need an immediate fix, add this to `src/index.css`:

```css
/* === DROPDOWN PAGE SHIFT FIX === */

/* Always show scrollbar to prevent layout shift */
html {
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

/* Prevent any scroll-lock induced shifts */
body[data-scroll-locked],
html[data-scroll-locked],
body[data-radix-scroll-lock],
html[data-radix-scroll-lock] {
  margin: 0 !important;
  padding-right: 0 !important;
  padding-left: 0 !important;
  overflow-y: scroll !important;
}

/* Ensure body never gets unwanted margins */
body {
  margin-right: 0 !important;
}
```

This CSS-only fix should resolve most page shift issues immediately.

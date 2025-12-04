# Artists Page Search & Loading Issues - Fix Documentation

## Problems Identified

### 1. **Page Reloading on Every Keystroke**
**Issue**: When typing in the search input, the entire page was being replaced with a skeleton loader on every keystroke, making it impossible to continue typing.

**Root Cause**:
- `searchTerm` was passed directly to `useGetAllArtists()` hook (line 22)
- Every keystroke changed `searchTerm`, which triggered a new React Query fetch
- When `isLoading` became `true`, the entire component returned `<ArtistsPageSkeleton />`, unmounting the input field
- This caused the input to lose focus and appear as if the page was "reloading"

### 2. **Loading State Showing on Every Search**
**Issue**: Users saw a full-page skeleton loader every time they typed, even though React Query should handle background updates silently.

**Root Cause**:
- The code used `isLoading` which becomes `true` whenever there's no cached data for a query key
- Since each search term creates a new query key, React Query treats it as a new query with no cache
- The condition `if (isLoading)` on line 79 replaced the entire page with skeleton
- No distinction between initial load (should show skeleton) vs. search/filter updates (should be silent)

### 3. **No Debouncing**
**Issue**: Every single keystroke immediately triggered an API call, causing:
- Unnecessary network requests
- Poor performance
- Server overload potential

**Root Cause**:
- No debounce mechanism implemented
- Search term was used directly in the query key

## Solutions Implemented

### 1. **Added Debouncing**
**File**: `art-gallery/src/hooks/use-debounce.ts` (NEW)
- Created a reusable `useDebounce` hook
- Delays API calls by 500ms after user stops typing
- Prevents API calls on every keystroke

**Usage**:
```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearchTerm = useDebounce(searchTerm, 500);
// Use debouncedSearchTerm in API calls
```

### 2. **Fixed Loading State Logic**
**File**: `art-gallery/src/pages/Artists.tsx`

**Changes**:
- Separated `isLoading` (initial load) from `isFetching` (background updates)
- Only show skeleton on **initial load** when there's no data:
  ```typescript
  const isInitialLoading = isLoadingAll && !allArtistsData;
  ```
- Use `isFetching` for subtle background loading indicators
- Added `placeholderData` to React Query config to keep previous data visible during fetches

### 3. **Improved React Query Configuration**
**File**: `art-gallery/src/services/artist/useGetAllArtists.ts`

**Changes**:
- Added `placeholderData: (previousData) => previousData` - keeps old data visible while fetching new data
- Added `refetchOnWindowFocus: false` - prevents unnecessary refetches
- This ensures smooth transitions without flickering or page replacement

### 4. **Added Subtle Loading Indicator**
**File**: `art-gallery/src/pages/Artists.tsx`

**Changes**:
- Added a small "Updating..." indicator in the header when `isFetchingAll` is true
- Shows users that search is working without replacing the entire page
- Uses a subtle spinner icon instead of full-page skeleton

## Key Concepts

### React Query Loading States

1. **`isLoading`**: 
   - `true` only when there's no cached data AND a fetch is in progress
   - Use for initial load skeletons

2. **`isFetching`**: 
   - `true` whenever a fetch is in progress (including background refetches)
   - Use for subtle loading indicators during updates

3. **`placeholderData`**: 
   - Keeps previous data visible while new data is being fetched
   - Prevents flickering and empty states during transitions

## Before vs After

### Before:
- ❌ Page "reloads" on every keystroke
- ❌ Full skeleton shown on every search
- ❌ API call on every keystroke (no debounce)
- ❌ Input loses focus
- ❌ Poor user experience

### After:
- ✅ Smooth typing experience (no page replacement)
- ✅ Skeleton only on initial load
- ✅ Debounced search (500ms delay)
- ✅ Input stays focused
- ✅ Subtle "Updating..." indicator during search
- ✅ Previous data remains visible while fetching
- ✅ Excellent user experience

## Testing Checklist

- [x] Type in search input - should not reload page
- [x] Search should wait 500ms after typing stops
- [x] Skeleton should only show on initial page load
- [x] During search, should show subtle "Updating..." indicator
- [x] Previous results should stay visible while fetching new ones
- [x] No flickering or empty states during transitions

## Files Modified

1. `art-gallery/src/hooks/use-debounce.ts` - NEW FILE
2. `art-gallery/src/pages/Artists.tsx` - Fixed loading logic and added debouncing
3. `art-gallery/src/services/artist/useGetAllArtists.ts` - Added placeholderData and refetch config









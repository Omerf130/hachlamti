# Code Review - Redundancies & Cleanup Opportunities

## 🔍 Findings

### 1. **Mongoose Query Pattern (High Priority)**
**Location:** Repeated in 6+ files
- `app/stories/page.tsx` (line 14-22)
- `app/therapists/page.tsx` (line 14-22)
- `app/stories/[id]/page.tsx` (line 20-32)
- `app/therapists/[id]/page.tsx` (line 20-32)
- `app/actions/story.ts` (multiple locations)
- `app/actions/therapist.ts` (multiple locations)

**Pattern:**
```typescript
const Model = mongoose.models.ModelName
if (!Model) { return [] }
const query = Model.find(filter).sort({...})
const execResult = query.exec() as unknown as Promise<Document[]>
```

**Solution:** Create `lib/db-queries.ts` with helper functions

---

### 2. **List Page Structure (Medium Priority)**
**Location:** 
- `app/stories/page.tsx`
- `app/therapists/page.tsx`

**Duplication:**
- Same `getStories()` / `getTherapists()` pattern
- Same error handling (try-catch returning empty array)
- Same empty state JSX structure
- Same SCSS (99% identical)

**Solution:** 
- Create shared `EmptyState` component
- Create shared list page SCSS
- Consider generic list page helper

---

### 3. **Detail Page Structure (Medium Priority)**
**Location:**
- `app/stories/[id]/page.tsx`
- `app/therapists/[id]/page.tsx`

**Duplication:**
- Same `getStory()` / `getTherapist()` pattern
- Same error handling (try-catch returning null)
- Same notFound() pattern
- Same SCSS (95% identical)

**Solution:**
- Create shared detail page SCSS
- Consider generic detail page helper

---

### 4. **SCSS Duplication (Low Priority)**
**Location:**
- `app/stories/page.module.scss` vs `app/therapists/page.module.scss`
- `app/stories/[id]/page.module.scss` vs `app/therapists/[id]/page.module.scss`

**Duplication:**
- `.main`, `.title`, `.empty` - identical
- `.container`, `.header`, `.content`, `.section` - identical

**Solution:**
- Create shared SCSS files:
  - `styles/list-page.module.scss`
  - `styles/detail-page.module.scss`

---

## ✅ Recommended Cleanup Actions

### Priority 1: Mongoose Query Helpers
**Impact:** High - Reduces code duplication, improves maintainability
**Files to create:**
- `lib/db-queries.ts` - Helper functions for Mongoose queries

**Benefits:**
- Single source of truth for query patterns
- Easier to fix TypeScript issues in one place
- Consistent error handling

---

### Priority 2: Shared Components
**Impact:** Medium - Reduces duplication, improves consistency
**Files to create:**
- `components/EmptyState.tsx` - Reusable empty state component
- `styles/list-page.module.scss` - Shared list page styles
- `styles/detail-page.module.scss` - Shared detail page styles

**Benefits:**
- Consistent empty states across pages
- Easier to update styling globally
- Less code to maintain

---

### Priority 3: Type Definitions
**Impact:** Low - Improves type safety
**Consider:**
- Shared types for page props (if needed)
- Shared types for query results

---

## 📋 Implementation Order

1. ✅ Create `lib/db-queries.ts` with Mongoose helpers
2. ✅ Refactor list pages to use helpers
3. ✅ Refactor detail pages to use helpers
4. ✅ Create `EmptyState` component
5. ✅ Create shared SCSS files
6. ✅ Update pages to use shared styles

---

## ⚠️ Considerations

- **MVP Scope:** Keep it simple - don't over-engineer
- **TypeScript Strict Mode:** Must maintain type safety
- **Backward Compatibility:** Ensure existing code still works
- **Testing:** Verify all pages still work after refactoring

---

## 🎯 Estimated Impact

- **Lines of code reduced:** ~150-200 lines
- **Maintainability:** Significantly improved
- **Consistency:** Much better
- **Type safety:** Maintained or improved


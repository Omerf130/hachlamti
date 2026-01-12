# Testing Checklist - Step 9: Public Pages (Stories)

## Pre-Step 10 Verification

Before proceeding to Step 10, verify the following:

### 1. Type Checking ✅
```bash
npm run type-check
```
**Expected:** No TypeScript errors

### 2. Build Verification ✅
```bash
npm run build
```
**Expected:** Build completes successfully without errors

### 3. Database Connection ✅
- Visit: `http://localhost:3000/api/test-db`
- **Expected:** JSON response with `success: true` and connection details

### 4. Home Page (`/`) ✅
- Visit: `http://localhost:3000`
- **Expected:**
  - Page loads without errors
  - Title "Hachlamti" displays
  - Description displays in Hebrew
  - Three navigation links visible:
    - "קרא סיפורים" → `/stories`
    - "מצא מטפל" → `/therapists`
    - "שתף סיפור" → `/submit-story`
  - Styling applied (centered layout, buttons styled)

### 5. Stories List Page (`/stories`) ✅
- Visit: `http://localhost:3000/stories`
- **Expected:**
  - Page loads without errors
  - Title "סיפורי החלמה" displays
  - **If no stories in DB:**
    - Empty state message: "אין סיפורים זמינים כרגע"
    - No errors in browser console
  - **If stories exist:**
    - List of story cards displays
    - Each card shows: displayName and treatmentCategory
    - Cards are clickable links to `/stories/[id]`
    - Hover effects work
  - Styling applied (card layout, spacing)

### 6. Story Detail Page (`/stories/[id]`) ✅
- **Test with valid story ID:**
  - Visit: `http://localhost:3000/stories/[valid-story-id]`
  - **Expected:**
    - Page loads without errors
    - Story title (displayName) displays
    - Meta information displays (category, condition, date)
    - Treatment process section displays
    - Optional sections display if present (duration, outcome)
    - Therapist info displays if linked
    - Styling applied (article layout, sections)
  
- **Test with invalid story ID:**
  - Visit: `http://localhost:3000/stories/invalid-id`
  - **Expected:**
    - 404 page displays (Next.js not-found)
    - No runtime errors

- **Test with non-existent story ID:**
  - Visit: `http://localhost:3000/stories/507f1f77bcf86cd799439011`
  - **Expected:**
    - 404 page displays
    - No runtime errors

### 7. Navigation Flow ✅
- From home page, click "קרא סיפורים"
- **Expected:** Navigates to `/stories` without errors
- From stories list, click a story card
- **Expected:** Navigates to `/stories/[id]` without errors
- Use browser back button
- **Expected:** Navigation works correctly

### 8. Error Handling ✅
- **Database connection failure:**
  - Temporarily break `MONGODB_URI` in `.env.local`
  - Visit `/stories`
  - **Expected:** Empty state displays, no browser errors
  
- **Invalid route:**
  - Visit `/stories/invalid-format`
  - **Expected:** 404 page or graceful error handling

### 9. RTL Support ✅
- Verify Hebrew text displays correctly (right-to-left)
- **Expected:** Text alignment and layout work correctly for RTL

### 10. Browser Console ✅
- Open browser DevTools → Console
- Navigate through all pages
- **Expected:** No errors or warnings in console

---

## Quick Test Commands

```bash
# 1. Type check
npm run type-check

# 2. Build
npm run build

# 3. Start dev server (if not running)
npm run dev

# 4. Test database connection
curl http://localhost:3000/api/test-db
```

---

## ✅ Checklist Summary

- [ ] Type checking passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Database connection works (`/api/test-db`)
- [ ] Home page loads and displays correctly
- [ ] Stories list page loads (empty state or with stories)
- [ ] Story detail page loads for valid IDs
- [ ] Story detail page shows 404 for invalid IDs
- [ ] Navigation between pages works
- [ ] No browser console errors
- [ ] Styling applied correctly
- [ ] RTL layout works for Hebrew text

---

## If All Tests Pass ✅

You're ready to proceed to **Step 10: Public Pages - Therapist Listing**

---

## If Tests Fail ❌

- Check browser console for errors
- Verify `.env.local` has correct `MONGODB_URI`
- Ensure database is accessible
- Check that models are properly imported
- Review terminal output for build/runtime errors


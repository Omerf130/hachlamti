# Form Validation & Error Handling Improvements

## Issues Fixed

### 1. **MongoDB ObjectId Error**
**Problem**: When admin user submitted forms, got error:
```
⚠️ input must be a 24 character hex string, 12 byte Uint8Array, or an integer
```

**Root Cause**: Admin user had `id: 'admin'` which is NOT a valid MongoDB ObjectId format.

**Fix**: Changed admin ID to `'000000000000000000000000'` (valid 24-character hex string).

**Files Changed**:
- `lib/auth.ts` (line 35)

---

### 2. **Better Error Messages**
**Problem**: Users saw technical MongoDB errors instead of helpful messages.

**Fix**: Added comprehensive error handling in server actions:
- Validate ObjectId format before creating documents
- Filter out technical errors
- Translate Zod validation errors to Hebrew
- Map field names to user-friendly Hebrew names
- Return structured error messages

**Files Changed**:
- `app/actions/story.ts`
- `app/actions/therapist.ts`

**Example Error Mapping**:
```typescript
{
  'submitterFullName': 'שם מלא',
  'submitterEmail': 'אימייל',
  'title': 'כותרת',
  // ... etc
}
```

---

### 3. **Field-Level Validation Display**
**Problem**: Debug error list showed technical field names.

**Fix**: 
- Added `fieldErrors` state to track server-side field errors
- Replaced debug error list with user-friendly message
- Each field shows its own error message below the input
- Top banner shows general message: "יש לתקן את השדות המסומנים באדום"

**Files Changed**:
- `app/submit-story/StorySubmissionForm.tsx`
- `app/apply-therapist/TherapistApplicationForm.tsx`

---

### 4. **User ID Validation**
**Problem**: No validation before attempting to create MongoDB ObjectId.

**Fix**: Added validation in server actions:
```typescript
if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
  return {
    success: false,
    error: 'שגיאה במערכת. אנא נסה להתחבר מחדש.',
  }
}
```

---

## User Experience Improvements

### Before:
- ✗ Technical error: "input must be a 24 character hex string..."
- ✗ Long debug list with English field names
- ✗ No clear indication which field was wrong
- ✗ 200 OK status but success: false (no client error thrown)

### After:
- ✓ Clear Hebrew error messages
- ✓ Field-specific errors shown below each input
- ✓ User-friendly error banner at top
- ✓ Technical errors filtered out
- ✓ Proper error state handling

---

## Testing Checklist

- [ ] Admin can submit story form
- [ ] Admin can submit therapist form
- [ ] Regular user can submit story form
- [ ] Regular user can submit therapist form
- [ ] Missing required fields show Hebrew error messages
- [ ] Invalid email shows proper validation error
- [ ] Declaration checkboxes show proper error if unchecked
- [ ] Error messages are in Hebrew and user-friendly
- [ ] No technical MongoDB errors visible to users

---

## Notes

- Admin ID is now a valid ObjectId format but won't match any real user in database
- This is fine since admin operations check `role === 'ADMIN'` not user document existence
- If you create a real admin user in MongoDB later, update the admin ID in `.env`


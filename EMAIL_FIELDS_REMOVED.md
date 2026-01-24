# Email Fields Removed from Story and Therapist Forms

## Summary
Removed email fields from both Story submission and Therapist application forms, including frontend, backend, database schemas, and validation logic.

---

## Files Changed

### **Database Models** (2 files)
1. ✅ `models/Story.ts`
   - Removed `submitterEmail: string` from interface
   - Removed `submitterEmail` field from schema

2. ✅ `models/Therapist.ts`
   - Removed `email: string` from interface
   - Removed `email` field from schema

### **Validation Schemas** (2 files)
3. ✅ `lib/validations/story.ts`
   - Removed `submitterEmail` from `createStorySchema`
   - Removed `submitterEmail` from `updateStorySchema`

4. ✅ `lib/validations/therapist.ts`
   - Removed `email` from `createTherapistSchema`

### **Server Actions** (2 files)
5. ✅ `app/actions/story.ts`
   - Removed `submitterEmail: validated.submitterEmail` from story creation
   - Removed `story.submitterEmail = validated.submitterEmail` from update
   - Removed `'submitterEmail': 'אימייל'` from Hebrew field names mapping

6. ✅ `app/actions/therapist.ts`
   - Removed `email: validated.email` from therapist creation
   - Removed `'email': 'אימייל'` from Hebrew field names mapping

### **Frontend Forms** (4 files)
7. ✅ `app/submit-story/StorySubmissionForm.tsx`
   - Removed `submitterEmail` from form schema
   - Removed email input field from form UI

8. ✅ `app/apply-therapist/TherapistApplicationForm.tsx`
   - Removed `email` from form schema
   - Removed `email: data.email` from submit data
   - Removed email input field from form UI

9. ✅ `app/stories/[id]/edit/StoryEditForm.tsx`
   - Removed `submitterEmail` from edit form schema
   - Removed `submitterEmail` from StoryEditFormProps interface
   - Removed `submitterEmail` from defaultValues
   - Removed email input field from form UI

10. ✅ `app/stories/[id]/edit/page.tsx`
    - Removed `submitterEmail: story.submitterEmail` from storyData

---

## What's Left in Forms

### Story Form (Personal Details):
- ✅ Full Name (submitterFullName)
- ✅ Phone Number (submitterPhone)
- ❌ ~~Email~~ (removed)
- ✅ May Contact
- ✅ Publication Choice

### Therapist Form (Personal Details):
- ✅ Full Name (fullName)
- ❌ ~~Email~~ (removed)
- ✅ Phone WhatsApp (phoneWhatsApp)
- ✅ Treatment Specialties
- ✅ Years Experience

---

## Database Impact

**Existing documents** in MongoDB that have email fields will keep them, but:
- New documents won't have email fields
- Forms won't display/collect email
- Server actions won't save email
- Validation won't require email

**No migration needed** - optional fields in MongoDB don't break existing data.

---

## Testing Checklist

### Story Submission:
- [ ] Can submit story without email field
- [ ] Form only shows: name, phone, contact preference
- [ ] Story saves successfully without email
- [ ] Edit story works without email field

### Therapist Application:
- [ ] Can submit application without email field
- [ ] Form only shows: name, phone
- [ ] Application saves successfully without email
- [ ] Admin can review without seeing email

### No Regressions:
- [ ] All other form fields still work
- [ ] Validation still works for remaining fields
- [ ] No console errors
- [ ] No TypeScript errors

---

## Why Remove Email?

**User has session/account:**
- Email already in User model (from signup)
- No need to ask again in forms
- Can get email from `session.user.email` if needed
- Reduces form friction

**Privacy:**
- One less piece of personal data collected per form
- Phone number is sufficient for contact

---

## Notes

- **No linter errors** after changes
- **Backwards compatible** with existing data
- **Clean removal** from all layers (DB → API → UI)
- **User email still accessible** via `User` model when needed

---

## If You Need Email Back

To restore email fields:
1. Add back to models (optional field for compatibility)
2. Add back to validation schemas
3. Add back to server actions
4. Add back to form UIs
5. Update Hebrew field mappings


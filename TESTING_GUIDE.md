# Testing Guide - Consolidated Spec Changes

**Date:** 2026-01-19

This guide covers testing the consolidated spec update implementation.

---

## Prerequisites

### 1. Database Reset (Recommended for MVP)

The schema changes are breaking. Easiest approach for development:

```bash
# Connect to MongoDB and drop the database
# Option A: Using MongoDB Compass - Drop the database
# Option B: Using mongosh CLI:
mongosh
use hachlamti  # or your database name
db.dropDatabase()
```

**Alternative:** If you have existing data you want to keep, you'll need to run migrations (see Migration Scripts section below).

### 2. Environment Variables

Ensure `.env.local` has:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

### 3. Start Development Server

```bash
npm run dev
```

---

## Test Scenarios

### Test 1: User Signup (BASIC Role)

**Goal:** Verify new users get `role = 'BASIC'`

**Steps:**
1. Navigate to `/signup`
2. Fill in:
   - Email: `testuser@example.com`
   - Password: `password123`
3. Submit form
4. Should redirect to login or auto-login

**Verify in Database:**
```javascript
db.users.findOne({ email: "testuser@example.com" })
// Should show: role: "BASIC"
```

**Expected Result:** ✅ User created with `role = 'BASIC'`

---

### Test 2: User Login

**Goal:** Verify login works with new role system

**Steps:**
1. Navigate to `/login`
2. Enter credentials from Test 1
3. Submit form
4. Should redirect to home page
5. Navigation should show "Share Story" and "Log Out"
6. Should NOT show "Sign Up" or "Log In"

**Expected Result:** ✅ Logged in successfully, navigation updated

---

### Test 3: Story Submission (Immediate Publication)

**Goal:** Verify stories are published immediately with `authorUserId`

**Steps:**
1. Make sure you're logged in (Test 2)
2. Navigate to `/submit-story`
3. Fill in all required fields:
   - Full Name: "Test User"
   - Phone: "0501234567"
   - Email: "test@example.com"
   - May Contact: Select "Yes"
   - Publication Choice: Select "Full Name"
   - Title: "My Healing Story"
   - Problem: "Description of the problem"
   - Previous Attempts: "What I tried before"
   - Solution: "The treatment that helped"
   - Results: "Current condition"
   - Message to Others: "Hope and inspiration"
   - Check all 4 declaration checkboxes
4. Submit form

**Verify in Database:**
```javascript
db.stories.findOne({ title: "My Healing Story" })
// Should show:
// - status: "PUBLISHED"
// - authorUserId: ObjectId (your user ID)
// - publishedAt: Date (current timestamp)
// - displayName: "Test User" (based on publication choice)
```

**Verify in UI:**
1. Navigate to `/stories`
2. Should see the story listed immediately
3. Click on the story
4. Should see full story details

**Expected Result:** ✅ Story published immediately, visible in public list

---

### Test 4: Therapist Application Submission

**Goal:** Verify therapist application creates record with `userId`

**Steps:**
1. Make sure you're logged in
2. Navigate to `/apply-therapist`
3. Fill in all required fields:
   - Full Name: "Dr. Test Therapist"
   - Email: "therapist@example.com"
   - Phone (WhatsApp): "0501234567"
   - Treatment Specialties: "Acupuncture, Massage"
   - Years of Experience: 5
   - Professional Description: "My approach to healing..."
   - Health Issues: Select at least one
   - Languages: Select at least one
   - Geographic Area: "Tel Aviv"
   - Treatment Locations: Select at least one
   - Availability: Fill in at least one day
   - Check all 5 declaration checkboxes
4. Submit form

**Verify in Database:**
```javascript
db.therapists.findOne({ fullName: "Dr. Test Therapist" })
// Should show:
// - status: "PENDING"
// - userId: ObjectId (your user ID)
```

**Verify in UI:**
1. Navigate to `/therapists`
2. Should NOT see the therapist (status is PENDING, not APPROVED)

**Verify User Role:**
```javascript
db.users.findOne({ email: "testuser@example.com" })
// Should still show: role: "BASIC" (not upgraded yet)
```

**Expected Result:** ✅ Therapist application created, still PENDING

---

### Test 5: Admin Login

**Goal:** Verify admin can log in with ADMIN role

**Steps:**
1. Log out if logged in
2. Navigate to `/login`
3. Enter admin credentials from `.env.local`:
   - Email: Value of `ADMIN_EMAIL`
   - Password: Value of `ADMIN_PASSWORD`
4. Submit form

**Expected Result:** ✅ Logged in as admin with `role = 'ADMIN'`

---

### Test 6: Admin Approves Therapist (Role Upgrade)

**Goal:** Verify approving therapist upgrades user role to THERAPIST

**Prerequisites:** 
- Admin must be logged in (Test 5)
- Therapist application must exist (Test 4)

**Note:** This requires admin UI to be implemented. If admin pages don't exist yet, you can test this manually via API or server action.

**Manual Testing (if admin UI doesn't exist):**

Create a test script `test-therapist-approval.mjs`:
```javascript
import { MongoClient, ObjectId } from 'mongodb'

const uri = 'your_mongodb_connection_string'
const client = new MongoClient(uri)

async function approveTherapist() {
  await client.connect()
  const db = client.db('hachlamti')
  
  // Find pending therapist
  const therapist = await db.collection('therapists').findOne({ status: 'PENDING' })
  console.log('Found therapist:', therapist.fullName)
  
  // Update therapist status
  await db.collection('therapists').updateOne(
    { _id: therapist._id },
    { $set: { status: 'APPROVED' } }
  )
  
  // Update user role
  await db.collection('users').updateOne(
    { _id: therapist.userId },
    { $set: { role: 'THERAPIST' } }
  )
  
  console.log('✅ Therapist approved and user role upgraded')
  
  await client.close()
}

approveTherapist()
```

Run: `node test-therapist-approval.mjs`

**Verify in Database:**
```javascript
// Check therapist status
db.therapists.findOne({ fullName: "Dr. Test Therapist" })
// Should show: status: "APPROVED"

// Check user role
db.users.findOne({ email: "testuser@example.com" })
// Should show: role: "THERAPIST" (upgraded from BASIC)
```

**Verify in UI:**
1. Navigate to `/therapists`
2. Should NOW see "Dr. Test Therapist" in the list
3. Click on the therapist
4. Should see full therapist profile

**Expected Result:** ✅ Therapist approved, user role upgraded to THERAPIST, therapist visible publicly

---

### Test 7: Story Editing (Own Stories Only)

**Goal:** Verify users can edit their own stories

**Prerequisites:**
- User must be logged in as the story author
- Story must exist (from Test 3)

**Note:** This requires a story editing UI to be implemented. Currently we have the server action (`updateStory`) but no UI.

**Manual Testing via Server Action:**

Create a test page `app/test-edit/page.tsx`:
```typescript
'use client'
import { updateStory } from '@/app/actions/story'
import { useState } from 'react'

export default function TestEditPage() {
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    const result = await updateStory({
      storyId: 'YOUR_STORY_ID_HERE', // Replace with actual ID
      submitterFullName: 'Updated Name',
      submitterPhone: '0509999999',
      submitterEmail: 'updated@example.com',
      mayContact: true,
      publicationChoice: 'FIRST_NAME_ONLY',
      title: 'Updated Title',
      problem: 'Updated problem',
      previousAttempts: 'Updated attempts',
      solution: 'Updated solution',
      results: 'Updated results',
      messageToOthers: 'Updated message',
      freeTextStory: 'Updated free text',
    })
    setResult(result)
  }

  return (
    <div>
      <button onClick={handleTest}>Test Story Edit</button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
```

**Expected Result:** ✅ Story updated successfully, displayName recomputed

---

## Test Matrix Summary

| Test | Feature | Status | Expected Outcome |
|------|---------|--------|------------------|
| 1 | User Signup | 🧪 | role = 'BASIC' |
| 2 | User Login | 🧪 | Session with BASIC role |
| 3 | Story Submit | 🧪 | status = 'PUBLISHED', authorUserId set |
| 4 | Therapist Apply | 🧪 | status = 'PENDING', userId set |
| 5 | Admin Login | 🧪 | Session with ADMIN role |
| 6 | Therapist Approval | 🧪 | status = 'APPROVED', user role = 'THERAPIST' |
| 7 | Story Edit | 🧪 | Story updated, ownership validated |

---

## Common Issues & Troubleshooting

### Issue 1: "Role validation error" on signup
**Cause:** Database has old users with 'user' role  
**Solution:** Drop database or run migration

### Issue 2: Stories not appearing in /stories
**Cause:** Query might be filtering by APPROVED status  
**Solution:** Check `app/stories/page.tsx` - should query `status: 'PUBLISHED'`

### Issue 3: Therapist not visible after approval
**Cause:** Status not updated or query filtering incorrectly  
**Solution:** Verify therapist `status: 'APPROVED'` in database

### Issue 4: "Unauthorized" when submitting story
**Cause:** Not logged in or session expired  
**Solution:** Log in again

---

## Database Migration Scripts (Optional)

If you want to keep existing data, run these migrations:

### Migration 1: Update User Roles
```javascript
// mongosh or MongoDB Compass
db.users.updateMany(
  { role: 'user' },
  { $set: { role: 'BASIC' } }
)

db.users.updateMany(
  { role: 'admin' },
  { $set: { role: 'ADMIN' } }
)
```

### Migration 2: Add authorUserId to Stories
```javascript
// This requires manual mapping based on your data
// Example: If you have a way to identify story authors
db.stories.updateMany(
  { authorUserId: { $exists: false } },
  { $set: { authorUserId: ObjectId('default_user_id') } }
)

// Update default status
db.stories.updateMany(
  { status: 'PENDING_REVIEW' },
  { $set: { status: 'PUBLISHED', publishedAt: new Date() } }
)
```

### Migration 3: Add userId to Therapists
```javascript
// This requires manual mapping based on your data
db.therapists.updateMany(
  { userId: { $exists: false } },
  { $set: { userId: ObjectId('default_user_id') } }
)
```

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Check console for any runtime errors
3. ✅ Verify database records match expected structure
4. 🔄 Implement missing UI components (if needed)
5. 🔄 Deploy to staging environment
6. 🔄 Run tests in staging
7. 🔄 Deploy to production

---

## Automated Testing (Future)

Consider adding:
- Unit tests for server actions
- Integration tests for auth flows
- E2E tests with Playwright/Cypress
- API endpoint tests

---

**Status:** Ready for manual testing  
**Last Updated:** 2026-01-19


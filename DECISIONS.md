# Engineering Decisions Log

This document tracks all assumptions, decisions, and architectural choices made during the development of Hachlamti.

---

## Decisions Log

### 2026-01-18 - Form Spec Update: Complete Redesign

**Context:** Major specification update received defining complete form structures, fields, and copy for both Therapist Application and Recovery Story Submission forms.

**Decision:** Complete redesign of both forms to match new specification exactly.

**Changes Implemented:**

#### Therapist Application Form (`/apply-therapist`)
- **Title:** "Join the Hachlamti Therapist Network 💚"
- **Subtitle:** "Help more people heal. Fill in your details and your profile will be reviewed before the site goes live."

**New Fields Added:**
- `phoneWhatsApp` (required) - replaces generic `phone`
- `treatmentSpecialties` (array of strings, free text/tags)
- `certifications` (dynamic array with name + fileUrl)
- `professionalDescription` (required long text)
- `healthIssues` (predefined checkboxes + "Other")
- `languages` (predefined checkboxes + "Other")
- `geographicArea` (select dropdown)
- `clinicAddress` (optional text)
- `treatmentLocations` (multi-select: FIXED_CLINIC, HOME_VISITS, REMOTE, COMBINATION)
- `availability` (structured weekly schedule - simplified to notes for MVP)
- `externalLinks` (website, facebook, instagram - max 3)
- `profileImageUrl` and `clinicImageUrl` (optional)
- **5 Required Declaration Checkboxes**
- `additionalNotes` (optional long text)

**Post-Submission Message:**
"Thank you for filling out the form. We would appreciate it if you could share the recovery story form with patients who have healed thanks to your treatment, so we can connect more patients to your work. The site will be launching soon."

#### Recovery Story Submission Form (`/submit-story`)
- **Title:** "Sharing the Light 💚"
- **Subtitle:** "Your story could be the hope someone else is looking for."

**New Fields Added:**
- `submitterFullName` (required) - for contact only
- `submitterPhone` (required) - "Will not be published without explicit approval"
- `submitterEmail` (required)
- `submissionDate` (auto-filled)
- `mayContact` (yes/no boolean)
- `publicationChoice` (FULL_NAME, FIRST_NAME_ONLY, ANONYMOUS) - replaces `privacyLevel`
- `title` (required) - e.g., "How I healed from..."
- `problem` (required long text) - "What was the medical condition?"
- `previousAttempts` (required long text) - "What did you try before?"
- `solution` (required long text) - "Type of treatment, description, duration, experience"
- `results` (required long text) - "What is your condition today?"
- `messageToOthers` (required long text) - "Message to someone going through this"
- `freeTextStory` (optional) - Alternative free-form text
- **4 Required Declaration Checkboxes**

**Post-Submission Message:**
"Thank you so much for sharing. The site will be launching soon, and many people will be able to draw hope and inspiration from your story."

**Removed Fields:**
- Therapist: `targetAudiences`, `phone`, `education`
- Story: `therapistId`, `therapistNameRaw`, `medicalCondition`, `treatmentCategory`, `treatmentProcess`, `duration`, `outcome`, `transcript`

**Rationale:**
- Exact adherence to specification requirements
- Clearer field names and purposes
- Better user experience with structured sections
- Simplified MVP implementation (e.g., availability as notes instead of complex weekly schedule)
- Consistent Hebrew copy throughout

**Implementation Notes:**
1. **File Uploads:** Implemented as URL inputs for MVP (actual file upload can be added later)
2. **Weekly Availability:** Simplified to free text notes for MVP (complex schedule UI deferred)
3. **Certifications:** Dynamic array allows adding multiple certifications
4. **Health Issues & Languages:** Checkbox groups with predefined options + "Other" text field
5. **Declaration Checkboxes:** All must be checked to submit (enforced client & server-side)
6. **Display Name Computation:** Updated to use `publicationChoice` instead of `privacyLevel`:
   - FULL_NAME → full name as-is
   - FIRST_NAME_ONLY → first name extracted
   - ANONYMOUS → "אנונימי"

**Impact:**
- **Breaking Change:** Existing form data structures incompatible
- Database must be cleared or migrated
- Forms now match exact specification
- Better UX with clear sections and field explanations
- Post-submission messages guide users appropriately

---

### 2026-01-19 - CONSOLIDATED SPEC UPDATE: Authentication, Roles & Story Workflow

**Context:** Major consolidated specification update fundamentally changed authentication model, user roles, story approval workflow, and permissions.

**Decision:** Complete system redesign to match consolidated spec requirements.

---

#### A. User Roles System (BREAKING CHANGE)

**Old System:**
- Roles: `'user' | 'admin'`
- Default on signup: `'user'`

**New System:**
- Roles: `'BASIC' | 'THERAPIST' | 'ADMIN'`
- Default on signup: `'BASIC'`

**Role Definitions:**

1. **BASIC** (default):
   - Can create recovery stories
   - Can edit their own stories
   - Can submit therapist applications
   - Cannot edit other users' stories
   - Cannot access admin functionality

2. **THERAPIST**:
   - All BASIC permissions
   - Can view their therapist profile
   - Can edit their therapist profile
   - Role granted ONLY after admin approves therapist application

3. **ADMIN**:
   - Full system access
   - Can approve therapist applications
   - Approving therapist upgrades user role from BASIC → THERAPIST
   - Manual role assignment only

**Rationale:**
- Clear progression path: BASIC → THERAPIST
- Single source of truth for user capabilities
- Therapist status tied directly to user role
- Simple role-based authorization checks

---

#### B. Story Workflow (MAJOR CHANGE)

**Old System:**
- Stories created with status = `PENDING_REVIEW`
- Required admin approval before publication
- Admin workflow for story moderation

**New System:**
- Stories published IMMEDIATELY upon creation
- Story.status = `PUBLISHED` by default
- NO admin approval required
- Users can edit their OWN stories
- Edited stories remain PUBLISHED (no re-approval)

**Story Ownership:**
- `Story.authorUserId` field (required) - references User._id
- Authorization enforced server-side
- Users can only edit stories where `story.authorUserId === session.user.id`

**Rationale:**
- Reduces friction for story submissions
- Empowers users to share experiences immediately
- No moderation bottleneck
- Focus admin time on therapist vetting only
- Users maintain control over their own content

**Admin Scope for Stories:**
- Admins do NOT approve, review, or moderate stories in MVP
- Optional deletion/hiding by admin is out of scope
- Story management may be added in future versions

---

#### C. Therapist Application Workflow

**Process:**
1. BASIC user submits therapist application
2. Creates Therapist document with:
   - `userId` (references User._id)
   - `status = PENDING`
3. Admin reviews application
4. On approval:
   - `Therapist.status` → `APPROVED`
   - `User.role` → upgraded from `BASIC` to `THERAPIST`

**This is the ONLY admin approval workflow in MVP.**

**Public Visibility:**
- Only APPROVED therapists appear on public routes:
  - `/therapists` (list)
  - `/therapists/[id]` (detail)

---

#### D. Permissions Summary

| Action                          | Guest | BASIC | THERAPIST | ADMIN |
|---------------------------------|-------|-------|-----------|-------|
| View public content             | ✓     | ✓     | ✓         | ✓     |
| Sign up / Log in                | ✓     | -     | -         | -     |
| Create stories                  | ✗     | ✓     | ✓         | ✓     |
| Edit own stories                | ✗     | ✓     | ✓         | ✓     |
| Edit others' stories            | ✗     | ✗     | ✗         | ✗     |
| Submit therapist application    | ✗     | ✓     | ✓         | ✓     |
| View own therapist profile      | ✗     | ✗     | ✓         | ✓     |
| Edit own therapist profile      | ✗     | ✗     | ✓         | ✓     |
| Approve therapist applications  | ✗     | ✗     | ✗         | ✓     |
| Access admin dashboard          | ✗     | ✗     | ✗         | ✓     |

---

#### E. Navigation Changes

**Main Navigation Rules:**

**Logged-out users see:**
- "Sign Up"
- "Log In"

**Logged-in users (BASIC, THERAPIST, or ADMIN) see:**
- "Share Story" (visible on navigation)
- "Log Out"
- Do NOT see "Sign Up" or "Log In"

**Home Page CTA:**
- "Share Story" CTA visible ONLY to logged-in users

---

#### F. Data Model Changes

**User Model:**
```typescript
{
  _id: ObjectId
  email: string (unique)
  password: string (hashed with bcrypt)
  role: 'BASIC' | 'THERAPIST' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}
```

**Story Model:**
```typescript
{
  _id: ObjectId
  authorUserId: ObjectId (required, indexed, ref: 'User')
  status: 'PUBLISHED' (default)
  // ... other story fields
}
```

**Therapist Model:**
```typescript
{
  _id: ObjectId
  userId: ObjectId (required, indexed, ref: 'User')
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  // ... other therapist fields
}
```

---

#### G. Implementation Changes

**Files Modified:**
1. `models/User.ts` - Role enum changed to `'BASIC' | 'THERAPIST' | 'ADMIN'`
2. `models/Story.ts` - Added `authorUserId` field, default status = `PUBLISHED`
3. `models/Therapist.ts` - Added `userId` field
4. `types/next-auth.d.ts` - Updated role types
5. `app/actions/user.ts` - Set role to `'BASIC'` on signup
6. `app/actions/story.ts` - 
   - `createStory` requires auth, sets `authorUserId`, status = `PUBLISHED`, sets `publishedAt`
   - New `updateStory` action for users to edit their own stories
   - Updated role checks to use `'ADMIN'`
7. `app/actions/therapist.ts` - 
   - `createTherapist` requires auth, sets `userId`
   - `updateTherapistStatus` upgrades User.role to `'THERAPIST'` on approval
   - Updated role checks to use `'ADMIN'`
8. `lib/validations/story.ts` - Added `updateStorySchema` for story editing
9. `lib/auth.ts` - Admin role set to `'ADMIN'`
10. `middleware.ts` - Updated role checks to `'ADMIN'`
11. `components/Navigation.tsx` - Already correct (shows "Share Story" only when authenticated)
12. `app/page.tsx` - Already correct (shows "Share Story" CTA only when authenticated)

---

#### H. Breaking Changes

**Database:**
- All existing users need role migration: `'user'` → `'BASIC'`, `'admin'` → `'ADMIN'`
- All existing stories need `authorUserId` field populated
- All existing therapists need `userId` field populated

**Authentication:**
- Middleware now checks for `role === 'ADMIN'` instead of `role === 'admin'`
- Session type now explicitly types role as union

**Story Workflow:**
- Stories no longer require admin approval
- Story status changes from `PENDING_REVIEW` to `PUBLISHED` by default

---

#### I. Rationale for Changes

1. **Clearer Role Progression:**
   - BASIC → THERAPIST path is explicit and automatic
   - Role determines capabilities throughout system
   - Single source of truth for permissions

2. **Reduced Admin Overhead:**
   - No story moderation required
   - Admin focuses on therapist vetting only
   - Faster content publication

3. **User Empowerment:**
   - Stories published immediately
   - Users can edit their own content
   - Lower barrier to sharing experiences

4. **Simplified Architecture:**
   - Single approval workflow (therapists only)
   - Clear ownership model for content
   - Consistent authorization patterns

---

#### J. Authority

This consolidated update is AUTHORITATIVE and overrides ALL previous specs regarding:
- Story approval workflow
- Authentication scope
- User roles
- Form fields
- File uploads
- Navigation permissions

**Any ambiguity MUST be documented in DECISIONS.md before implementation.**

---

### 2024-12-XX - Mongoose findOne TypeScript Workaround

**Context:** Mongoose v8 with TypeScript strict mode has type inference issues with `findOne()` method, causing "expression is not callable" errors.

**Decision:** Use explicit query construction with type narrowing to work around Mongoose TypeScript limitations.

**Rationale:** 
- Maintains type safety without using `any`
- Follows CURSOR_RULES.md (no `any`, no `@ts-ignore`)
- Simplest workaround that preserves type checking

**Impact:** 
- Query construction split into separate lines for better type inference
- Works correctly at runtime despite TypeScript warnings

---

### 2024-12-XX - DisplayName Computation Rules

**Context:** Specification states "displayName is computed at creation time and stored" but didn't define the exact formula for each privacy level.

**Decision:** DisplayName computation rules by publication choice:

1. **FULL_NAME**: `displayName = submitterFullName.trim()`
2. **FIRST_NAME_ONLY**: `displayName = "<FirstName>"` - extracted from full name
   - If only one name: use it as-is
   - Example: "John Doe" → "John"
3. **ANONYMOUS**: `displayName = "אנונימי"`

**Rationale:** 
- Ensures consistent display names stored in database
- Prevents computation at render time
- Clear validation rules for each publication choice
- Hebrew text for anonymous labels matches UI language

**Impact:** 
- Server Action must compute displayName before saving
- Validation enforces submitterFullName as required
- Public display uses stored displayName

---

### 2024-12-XX - Admin Authentication Strategy (MVP)

**Context:** Specification requires NextAuth for admin routes but doesn't define admin user model structure.

**Decision:** Use NextAuth with Credentials provider supporting both environment variables for admin AND database-backed regular users.

**Rationale:** 
- Dual authentication: admin via env vars, users via database
- Single admin user sufficient for MVP scope
- Regular users can sign up and log in
- Easy to configure via environment variables
- Extensible for future admin management

**Implementation:**
- Admin credentials in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
- User credentials in MongoDB with bcrypt hashing
- Admin routes protected via middleware (role === 'admin')
- Authenticated routes allow any logged-in user

**Impact:** 
- Admin can access /admin routes
- Regular users can access /submit-story and /apply-therapist
- Login page works for both admin and regular users
- Simple and secure authentication flow

---

### 2024-12-XX - Main Navigation Structure (MVP)

**Context:** Need to define navigation structure for MVP before implementing public pages.

**Decision:** Simple, global main navigation for all public pages with hardcoded items.

**Navigation Scope:**
- Navigation is present on all public pages
- Navigation is simple and non-configurable
- No role-based or dynamic menu logic in MVP

**Public Navigation Items (RTL, left to right):**
1. Home ("/")
2. Stories ("/stories")
3. Therapists ("/therapists")
4. Submit Story ("/submit-story") - shown only when authenticated

**Admin Navigation:**
- Admin routes have a SEPARATE layout
- Admin navigation is NOT visible in public navigation
- Admin layout includes its own sidebar or top nav

**Rules:**
- Navigation is a presentational UI concern only
- No permissions logic inside navigation components
- Navigation structure is hardcoded for MVP
- Navigation labels are in Hebrew
- Navigation styling uses SCSS Modules only

**Rationale:**
- Simplest approach for MVP - no database/config needed
- Clear separation between public and admin navigation
- Easy to extend later if needed
- Follows MVP principle: keep it simple

**Impact:**
- Main layout includes navigation component
- Admin layout will have separate navigation
- All public pages automatically get navigation

---

### 2024-12-XX - Authentication & Permissions Model (MVP)

**Context:** Spec update requires authentication for story submission and therapist application.

**Decision:** Implement two-tier authentication model:

1. **Regular Users (Authenticated):**
   - Can sign up via /signup
   - Can log in via /login
   - Can submit stories (/submit-story)
   - Can apply as therapists (/apply-therapist)
   - Cannot access admin routes

2. **Admin Users:**
   - Log in via /login with admin credentials
   - Full access to /admin routes
   - Can approve/reject therapists and stories
   - Can view all submissions

**Rules:**
- Guest users can view public content (stories, therapists lists)
- Authentication required for submission forms
- Admin role required for /admin routes
- Middleware enforces route protection

**Rationale:**
- Clear separation of concerns
- Simple role-based access control
- Secure submission process
- MVP-appropriate complexity

**Impact:**
- Middleware protects authenticated routes
- Forms require login
- Admin dashboard is separate and secure

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

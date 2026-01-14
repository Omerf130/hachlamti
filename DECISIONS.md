# Engineering Decisions Log

This document tracks all assumptions, decisions, and architectural choices made during the development of Hachlamti.

---

## Decisions Log

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

**Decision:** DisplayName computation rules by privacy level:

1. **FULL_NAME**: `displayName = submitterName.trim()` - submitterName REQUIRED
2. **FIRST_NAME_LAST_INITIAL**: `displayName = "<FirstName> <LastInitial>."` - submitterName REQUIRED
   - Extract first token as first name, last token as last name
   - If only one name: use first name only
   - Example: "John Doe Smith" → "John S."
3. **ANONYMOUS**: `displayName = "אנונימי"` - submitterName OPTIONAL
4. **INTERNAL_ONLY**: `displayName = "פנימי"` - submitterName optional, never shown publicly

**Rationale:** 
- Ensures consistent display names stored in database
- Prevents computation at render time
- Clear validation rules for each privacy level
- Hebrew text for anonymous/internal labels matches UI language

**Impact:** 
- Server Action must compute displayName before saving
- Validation schema must enforce submitterName requirements
- Public queries must filter out INTERNAL_ONLY stories

---

### 2024-12-XX - Admin Authentication Strategy (MVP)

**Context:** Specification requires NextAuth for admin routes but doesn't define admin user model structure.

**Decision:** Use NextAuth with Credentials provider and environment variables for admin authentication (MVP approach).

**Rationale:** 
- Simplest approach for MVP - no database model needed
- Single admin user sufficient for MVP scope
- Easy to configure via environment variables
- Can be upgraded to database-backed admin model later if needed

**Alternatives Considered:**
- Database-backed Admin model (more complex, not needed for MVP)
- OAuth providers (overkill for single admin user)

**Impact:** 
- Admin credentials stored in environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
- Admin routes protected via middleware
- Simple login page at /admin/login

---

### 2024 - Ambiguities Identified During Specification Review

**Context:** Initial review of project specification revealed several areas requiring clarification before implementation.

**Ambiguities Identified:**

1. **Story Media Field Structure**
   - Spec shows `media?: any` in Story model
   - Unclear: file uploads? URLs? array of objects? storage location?
   - Impact: Story submission form and display

2. **Therapist Certifications & Availability Fields**
   - Spec shows `certifications?: any` and `availability?: any`
   - Unclear: structure, format, validation rules
   - Impact: Therapist model and forms

3. **Story Transcript Field**
   - Spec includes `transcript?: string` in Story model
   - Unclear: purpose, when populated, relationship to main content
   - Impact: Story model and display

4. **DisplayName Computation Formula**
   - Spec states "displayName is computed at creation time and stored"
   - Unclear: exact formula for each privacy level (FULL_NAME, FIRST_NAME_LAST_INITIAL, ANONYMOUS)
   - Impact: Story creation logic

5. **Admin Authentication Setup**
   - Spec mentions NextAuth for admin routes but no user/admin model defined
   - Unclear: admin user model structure, how admins are created, role management
   - Impact: Admin authentication and authorization

6. **Pagination & Limits**
   - Spec mentions filters but no pagination strategy
   - Unclear: page size, infinite scroll vs pagination, total counts
   - Impact: List pages performance and UX

7. **Search Implementation**
   - Spec mentions search filters (q parameter) but no search strategy
   - Unclear: full-text search? which fields? MongoDB text indexes?
   - Impact: Search functionality

8. **Server Action Error Format**
   - Spec says "Errors returned in user-safe format" but no structure defined
   - Unclear: error response shape, validation error format
   - Impact: Error handling in forms

9. **Environment Variables**
   - Spec doesn't mention required env vars
   - Unclear: MongoDB connection string name, NextAuth config vars
   - Impact: Configuration and deployment

10. **Seed Script Execution**
    - Spec requires seed data but no execution method specified
    - Unclear: npm script? standalone file? when to run?
    - Impact: Development setup

11. **Form Validation Rules**
    - Spec mentions Zod validation but no field-level rules
    - Unclear: required fields, string length limits, email/phone formats
    - Impact: Form validation schemas

12. **File Upload Handling**
    - If media field involves uploads, no upload strategy specified
    - Unclear: storage location (local/Vercel Blob/S3), file types, size limits
    - Impact: Media handling in stories

13. **Therapist Selection in Story Form**
    - Spec allows linking to therapist or free-text name
    - Unclear: UI for therapist selection (search dropdown? autocomplete?), how to handle "not in system"
    - Impact: Story submission form UX

**Status:** Awaiting clarification before implementation begins.

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
4. Submit Story ("/submit-story")

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

**Context:** Spec update requires authentication for story submission and therapist application. Previously these were assumed to be public actions.

**Decision:** Implement three-tier authentication model:

1. **Guest Users (Not Authenticated):**
   - Can view all public content (home, stories list/details, therapists list/details)
   - Cannot submit stories or apply as therapists
   - Redirected to login if attempting to access `/submit-story` or `/apply-therapist`

2. **Authenticated Users (Non-Admin):**
   - Can view all public content
   - Can submit stories via `/submit-story` (creates Story with status PENDING_REVIEW)
   - Can apply as therapist via `/apply-therapist` (creates Therapist with status PENDING)
   - Cannot edit/delete submissions or access admin routes

3. **Admin Users (role = ADMIN):**
   - All authenticated user permissions
   - Full access to `/admin/*` routes
   - Can approve/reject/edit content

**Implementation:**
- Middleware protects `/submit-story` and `/apply-therapist` routes (require any authenticated user)
- Server-side auth checks in page components as fallback
- Login page handles `callbackUrl` query param to redirect after successful login
- Admin routes protected separately (require admin role)

**Route Name Note:**
- Spec mentions `/therapist/apply` but implementation uses `/apply-therapist` for consistency with `/submit-story` pattern
- Can be renamed later if needed

**Rationale:**
- Ensures content quality by requiring user authentication
- Simple three-tier model fits MVP needs
- Middleware + page-level checks provide defense in depth
- Callback URL pattern provides good UX for redirects

**Impact:**
- `/submit-story` and `/apply-therapist` now require authentication
- Login page redirects to original destination after login
- Middleware updated to protect authenticated-only routes
- All public viewing routes remain accessible to guests

---

### 2024-12-XX - Navigation and Home Page Authorization Rules (MVP)

**Context:** Spec update requires navigation buttons and home page CTA visibility to be driven by authentication state.

**Decision:** Implement authentication-based visibility for navigation and home page:

**Navigation Rules:**
- **Guest Users (Not Authenticated):**
  - Show "Sign Up" button (links to `/admin/login`)
  - Show "Log In" button (links to `/admin/login`)
  - Hide "Share Story" button
  - Hide "Log Out" button

- **Authenticated Users (Non-Admin):**
  - Show "Share Story" button (links to `/submit-story`)
  - Show "Log Out" button (calls `signOut()`)
  - Hide "Sign Up" and "Log In" buttons

- **Admin Users:**
  - Same as authenticated users (admin-specific navigation handled separately in admin layout)

**Home Page CTA Rules:**
- "Share Story" button only visible if user is authenticated
- No alternative CTA for logged-out users in MVP

**Implementation:**
- Navigation converted to Client Component to access `useSession()` hook
- SessionProvider wrapper added to root layout to enable session access
- Home page uses `getServerSession()` to check authentication server-side
- Logout uses NextAuth's `signOut()` with callback URL to current page
- All visibility logic centralized in Navigation component

**Note:**
- "Sign Up" button currently redirects to login page (MVP uses single login system)
- Can be updated later when separate sign-up flow is implemented

**Rationale:**
- Clear separation between authenticated and guest user experiences
- Prevents guest users from seeing CTAs that require authentication
- Centralized logic ensures consistency across all pages
- Server-side auth check on home page prevents flash of wrong content

**Impact:**
- Navigation component now requires SessionProvider wrapper
- Navigation visibility changes based on authentication state
- Home page CTA conditionally rendered based on auth state
- Logout functionality added to navigation

---

## Format

Each decision entry should follow this format:

```markdown
### [Date] - [Brief Title]

**Context:** [What prompted this decision?]

**Decision:** [What was decided?]

**Rationale:** [Why was this approach chosen?]

**Alternatives Considered:** [What other options were evaluated?]

**Impact:** [What does this affect?]
```

---


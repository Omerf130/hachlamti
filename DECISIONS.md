# Engineering Decisions Log

This document tracks all assumptions, decisions, and architectural choices made during the development of Hachlamti.

---

## Decisions Log

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


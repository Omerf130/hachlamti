# Hachlamti - Project Roadmap

**Last Updated:** 2026-01-19  
**Project Status:** MVP Core Complete, Missing Admin Dashboard & Editing UIs

---

## Project Overview

Hachlamti is a platform for sharing recovery stories and connecting patients with therapists.

---

## ✅ COMPLETED Features

### 1. Authentication System
- [x] User signup with email/password
- [x] User login (supports both admin and regular users)
- [x] Password hashing with bcrypt
- [x] NextAuth.js integration
- [x] Session management with JWT
- [x] Role-based authentication (BASIC, THERAPIST, ADMIN)
- [x] Protected routes via middleware
- [x] Admin authentication via environment variables

**Files:**
- `lib/auth.ts`
- `app/actions/user.ts`
- `app/signup/`, `app/login/`
- `middleware.ts`
- `types/next-auth.d.ts`

---

### 2. User Role System
- [x] Three-tier role system: BASIC, THERAPIST, ADMIN
- [x] New users get BASIC role by default
- [x] THERAPIST role granted on admin approval
- [x] Role-based permissions enforcement
- [x] Automatic role upgrade on therapist approval

**Files:**
- `models/User.ts`
- `app/actions/therapist.ts` (role upgrade logic)

---

### 3. Story Submission & Display
- [x] Story submission form (complete with all fields per spec)
- [x] Stories publish immediately (no admin approval)
- [x] Author tracking via `authorUserId`
- [x] Privacy controls (FULL_NAME, FIRST_NAME_ONLY, ANONYMOUS)
- [x] Display name computation
- [x] Stories list page (public)
- [x] Story detail page (public)
- [x] Story editing server action (ownership validation)

**Files:**
- `app/submit-story/`
- `app/stories/` (list and detail pages)
- `app/actions/story.ts`
- `models/Story.ts`
- `lib/validations/story.ts`

---

### 4. Therapist Application & Display
- [x] Therapist application form (complete with all fields per spec)
- [x] User association via `userId`
- [x] Application status: PENDING → APPROVED workflow
- [x] Therapists list page (public, shows only APPROVED)
- [x] Therapist detail page (public)
- [x] WhatsApp contact link generation
- [x] Weekly availability display
- [x] External links (website, social media)

**Files:**
- `app/apply-therapist/`
- `app/therapists/` (list and detail pages)
- `app/actions/therapist.ts`
- `models/Therapist.ts`
- `lib/validations/therapist.ts`

---

### 5. Navigation & Layout
- [x] Main navigation component
- [x] Responsive layout
- [x] Role-based navigation items
- [x] RTL (Hebrew) support
- [x] SCSS modules for styling

**Files:**
- `components/Navigation.tsx`
- `app/layout.tsx`
- `app/page.tsx` (home page)

---

### 6. Database Models
- [x] User model (with new role enum)
- [x] Story model (with authorUserId and immediate publication)
- [x] Therapist model (with userId)
- [x] ReviewLog model (for admin actions)
- [x] Report model (for user reports)
- [x] Mongoose schemas with proper indexes
- [x] MongoDB connection handling

**Files:**
- `models/User.ts`
- `models/Story.ts`
- `models/Therapist.ts`
- `models/ReviewLog.ts`
- `models/Report.ts`
- `lib/db.ts`

---

### 7. Validation & Type Safety
- [x] Zod schemas for all forms
- [x] TypeScript types throughout
- [x] Server-side validation
- [x] Client-side validation with react-hook-form
- [x] No linter errors

**Files:**
- `lib/validations/user.ts`
- `lib/validations/story.ts`
- `lib/validations/therapist.ts`

---

### 8. Responsive Design
- [x] Form pages with modern, responsive design
- [x] Stories and therapists list pages styled
- [x] Detail pages styled
- [x] Mobile-friendly layouts
- [x] Gradients, shadows, and visual polish

**Files:**
- `app/submit-story/page.module.scss`
- `app/apply-therapist/page.module.scss`
- `app/stories/page.module.scss`
- `app/therapists/page.module.scss`

---

## 🔄 IN PROGRESS / PARTIALLY COMPLETE

### Admin Dashboard

**Status:** Basic structure exists, but needs implementation

**What Exists:**
- `app/admin/page.tsx` - Empty admin page
- `app/admin/login/` - Admin login redirect (not needed, uses main login)
- Middleware protection for `/admin` routes

**What's Missing:**
- Admin dashboard UI
- Therapist approval interface
- Content management interface
- Analytics/stats

**Priority:** HIGH (needed to approve therapists)

---

## ❌ MISSING Features (MVP)

### 1. Story Editing UI
**Status:** Server action exists, UI missing

**What Exists:**
- `app/actions/story.ts` - `updateStory()` server action with ownership validation

**What's Needed:**
- Story edit form page (`app/stories/[id]/edit/page.tsx`)
- Edit button on story detail page (visible only to author)
- Form pre-populated with existing data
- Success/error handling

**Priority:** MEDIUM (users need to edit their stories)

**Estimated Effort:** 2-3 hours

---

### 2. Therapist Profile Editing UI
**Status:** No server action or UI exists

**What's Needed:**
- Server action: `updateTherapist()` in `app/actions/therapist.ts`
- Validation schema: `updateTherapistSchema` in `lib/validations/therapist.ts`
- Edit form page (`app/therapists/[id]/edit/page.tsx`)
- Edit button on therapist detail page (visible only to owner)
- Ownership validation (therapist.userId === session.user.id)

**Priority:** MEDIUM (therapists need to update their profiles)

**Estimated Effort:** 3-4 hours

---

### 3. Admin Dashboard - Therapist Approval Interface
**Status:** Critical functionality missing

**What's Needed:**
- Admin dashboard layout with navigation
- Therapist applications list page (`app/admin/therapists/page.tsx`)
  - Show all PENDING therapists
  - Sorting/filtering options
  - Bulk actions
- Therapist review page (`app/admin/therapists/[id]/page.tsx`)
  - View full application details
  - Approve/Reject buttons
  - Notes field for admin comments
  - Uses `updateTherapistStatus()` server action (already exists)

**Priority:** HIGH (no way to approve therapists currently)

**Estimated Effort:** 4-6 hours

---

### 4. Admin Dashboard - Overview & Stats
**Status:** Nice to have for MVP

**What's Needed:**
- Dashboard home page (`app/admin/page.tsx`)
  - Total users count
  - Total stories count (and breakdown by status)
  - Total therapists count (and breakdown by status)
  - Pending approvals count
  - Recent activity feed
- Simple charts/visualizations

**Priority:** LOW (can be added post-MVP)

**Estimated Effort:** 3-4 hours

---

### 5. User Profile Page
**Status:** Not in original spec, but useful

**What's Needed:**
- User profile page (`app/profile/page.tsx`)
  - Show user info (email, role)
  - List user's stories (with edit buttons)
  - Show therapist application status (if exists)
  - Link to therapist profile (if THERAPIST role)

**Priority:** LOW (nice to have)

**Estimated Effort:** 2-3 hours

---

### 6. Search & Filtering
**Status:** Not implemented

**What's Needed:**
- Stories search/filter:
  - Search by keywords in title, problem, solution
  - Filter by health issues
- Therapists search/filter:
  - Search by name, specialties
  - Filter by geographic area, languages, treatment locations

**Priority:** MEDIUM (improves UX significantly)

**Estimated Effort:** 4-6 hours

---

### 7. Admin Dashboard - Content Management
**Status:** Out of scope per consolidated spec

**What's Potentially Needed (Future):**
- Story management (optional hiding/deletion)
- User management
- Reports management (if report system is active)

**Priority:** LOW (stories don't need approval per spec)

**Estimated Effort:** 6-8 hours

---

## 🐛 KNOWN ISSUES

### 1. Database Migration Required
**Issue:** Existing data uses old schema (role: 'user'/'admin', no authorUserId, etc.)

**Solution Options:**
- **Option A (Recommended for MVP):** Drop database and start fresh
- **Option B:** Run migration scripts (see `TESTING_GUIDE.md`)

**Priority:** HIGH (blocks testing)

---

### 2. No Error Boundaries
**Issue:** Unhandled errors might crash the app

**Solution:** Add React error boundaries in layouts

**Priority:** MEDIUM

---

### 3. No Loading States
**Issue:** Forms and pages don't show loading states during async operations

**Solution:** Add loading spinners/skeletons

**Priority:** LOW (works, just not polished)

---

## 📋 MVP Completion Checklist

### Critical (Blocks MVP Launch)
- [ ] **Admin Dashboard - Therapist Approval** (HIGH PRIORITY)
  - [ ] Therapist applications list
  - [ ] Approve/Reject interface
  - [ ] Admin navigation

### Important (Needed for Good UX)
- [ ] **Story Editing UI** (MEDIUM PRIORITY)
- [ ] **Therapist Profile Editing UI** (MEDIUM PRIORITY)
- [ ] **Database Migration or Reset** (HIGH PRIORITY)

### Nice to Have (Post-MVP)
- [ ] User profile page
- [ ] Search & filtering
- [ ] Admin dashboard stats
- [ ] Loading states
- [ ] Error boundaries
- [ ] Email notifications
- [ ] Image uploads (for therapist profiles)

---

## 🚀 Deployment Checklist

Before deploying to production:

### Environment
- [ ] Set up production MongoDB database
- [ ] Configure environment variables (MONGODB_URI, NEXTAUTH_SECRET, etc.)
- [ ] Set admin credentials
- [ ] Configure domain and NEXTAUTH_URL

### Security
- [ ] Review all API routes for authentication
- [ ] Ensure sensitive data is not exposed
- [ ] Set secure session cookies
- [ ] Enable HTTPS

### Performance
- [ ] Test with realistic data volume
- [ ] Add database indexes (already done in models)
- [ ] Optimize image loading
- [ ] Add caching where appropriate

### Testing
- [ ] Run through all test scenarios (see `TESTING_GUIDE.md`)
- [ ] Test on multiple devices/browsers
- [ ] Test in production-like environment

### Monitoring
- [ ] Set up error logging (e.g., Sentry)
- [ ] Set up analytics (if desired)
- [ ] Set up uptime monitoring

---

## 📊 Project Timeline Estimate

### To MVP Launch
| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| Admin Therapist Approval | HIGH | 4-6h | ❌ Not Started |
| Story Edit UI | MEDIUM | 2-3h | ❌ Not Started |
| Therapist Edit UI | MEDIUM | 3-4h | ❌ Not Started |
| Database Reset/Migration | HIGH | 1h | ❌ Not Started |
| Testing | HIGH | 2-3h | ❌ Not Started |
| **TOTAL** | | **12-17h** | |

### Post-MVP Enhancements
| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| Search & Filtering | MEDIUM | 4-6h | ❌ Not Started |
| User Profile Page | LOW | 2-3h | ❌ Not Started |
| Admin Stats Dashboard | LOW | 3-4h | ❌ Not Started |
| Loading States | LOW | 2h | ❌ Not Started |
| Error Boundaries | MEDIUM | 1h | ❌ Not Started |
| **TOTAL** | | **12-16h** | |

---

## 🎯 Recommended Next Steps

### Immediate (This Week)
1. **Test current implementation**
   - Follow `TESTING_GUIDE.md`
   - Reset database
   - Verify all existing features work

2. **Build Admin Therapist Approval Interface**
   - This is the biggest blocker for MVP
   - Without it, no therapists can be approved

3. **Build Story Edit UI**
   - Important for user experience
   - Server action already exists

### Short Term (Next Week)
4. **Build Therapist Profile Edit UI**
   - Completes the therapist workflow
   - Allows therapists to maintain their info

5. **Add Search & Filtering**
   - Significantly improves UX
   - Helps users find relevant content

6. **Deployment Prep**
   - Set up production environment
   - Run full test suite
   - Deploy to staging

### Medium Term (Month 2)
7. **Polish & Enhancements**
   - User profile page
   - Admin stats dashboard
   - Loading states and error handling
   - Email notifications

8. **Monitoring & Analytics**
   - Set up error tracking
   - Add usage analytics
   - Monitor performance

---

## 📝 Notes

- **Current State:** Core functionality is complete and follows the consolidated spec exactly
- **Main Blocker:** Admin dashboard for therapist approval
- **Code Quality:** ✅ No linter errors, TypeScript strict mode, proper validation
- **Architecture:** Solid foundation, easy to extend
- **Documentation:** Comprehensive (DECISIONS.md, TESTING_GUIDE.md, this file)

---

**Status:** 🟡 **80% Complete** - Core features done, admin UI and editing interfaces needed

**Estimated Time to MVP:** 12-17 hours of focused development

**Last Updated:** 2026-01-19


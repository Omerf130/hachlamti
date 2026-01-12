# Cursor AI Engineering Rules for Hachlamti

These rules are **MANDATORY** and must be followed for all code written in this repository.

## A. TypeScript (MANDATORY)

- **TypeScript everywhere, strict mode.**
  - All files must use `.ts` or `.tsx` extensions.
  - No `.js` or `.jsx` files allowed.
  - `tsconfig.json` must have `"strict": true` and related strict flags enabled.

- **No `any`, no implicit `any`, no `@ts-ignore`.**
  - Never use `any` type.
  - Never use `@ts-ignore` or `@ts-expect-error` comments.
  - All variables, parameters, and return types must be explicitly typed.
  - Use `unknown` instead of `any` when type is truly unknown, then narrow it.

- **Explicit types for all function inputs and outputs.**
  - All function parameters must have explicit types.
  - All function return types must be explicitly declared.
  - Use TypeScript interfaces/types for complex objects.
  - Prefer `interface` for object shapes, `type` for unions/intersections.

## B. Scope & Discipline

- **Never implement features not explicitly defined.**
  - Only implement what is requested in the current step.
  - Do not add "nice-to-have" features or optimizations unless explicitly requested.
  - If a feature seems incomplete, ask for clarification rather than assuming.

- **If something is ambiguous, choose the simplest option and document it in DECISIONS.md.**
  - When multiple valid approaches exist, choose the simplest one.
  - Document the decision and reasoning in `/DECISIONS.md`.
  - Include date and context for each decision.

## C. Step-by-Step Execution

- **Implement only one step at a time.**
  - Complete each step fully before moving to the next.
  - Do not start multiple features simultaneously.
  - Wait for explicit approval before proceeding to the next step.

- **Never jump ahead.**
  - Do not implement future steps even if they seem obvious.
  - Do not create placeholder code for future features.
  - Focus on making the current step complete and correct.

## D. Architecture

- **Next.js App Router.**
  - Use Next.js 13+ App Router structure (`/app` directory).
  - Use `page.tsx` for routes, `layout.tsx` for layouts.
  - Use `loading.tsx` and `error.tsx` for loading/error states.
  - Use `route.ts` for API routes.

- **Server Components by default.**
  - All components are Server Components unless they require client-side interactivity.
  - Use `"use client"` directive only when necessary (hooks, event handlers, browser APIs).
  - Minimize Client Components to reduce bundle size.

- **Client Components only when necessary.**
  - Use Client Components for: forms, interactive UI, browser APIs, React hooks.
  - Keep Client Components small and focused.
  - Pass data from Server Components to Client Components via props.

## E. Data Layer

- **MongoDB Atlas + Mongoose only.**
  - Use Mongoose for all database operations.
  - Never use Prisma or any other ORM.
  - Use MongoDB Atlas for hosting.

- **Models in `/models`.**
  - All Mongoose models must be in the `/models` directory.
  - One model per file, named after the model (e.g., `Story.ts`, `Therapist.ts`).
  - Export models as default exports.

- **Connection singleton in `/lib/db.ts`.**
  - Create a single database connection utility in `/lib/db.ts`.
  - Export a function that returns a cached connection.
  - Handle connection errors gracefully.

- **Prevent model recompilation.**
  - Check if model exists before defining it.
  - Use Mongoose's model caching to prevent recompilation in development.
  - Example: `mongoose.models.Story || mongoose.model('Story', StorySchema)`

## F. Validation & Security

- **Zod for all Server Actions.**
  - All Server Actions must validate input with Zod schemas.
  - Define schemas in `/lib/validations` or co-located with actions.
  - Return typed errors from validation failures.

- **Never expose PII publicly.**
  - Personal Identifiable Information (PII) must never be exposed in public routes.
  - Sanitize data before sending to client.
  - Use server-side filtering for sensitive data.

- **Admin routes protected.**
  - All admin routes must be protected with NextAuth.
  - Use middleware or route handlers to verify admin status.
  - Never expose admin functionality to non-admin users.

## G. Styling

- **SCSS Modules only.**
  - Use `.module.scss` files for component styles.
  - Import styles as: `import styles from './Component.module.scss'`
  - Use CSS Modules class names: `className={styles.className}`

- **`globals.scss` minimal.**
  - Keep global styles minimal (resets, base typography only).
  - Avoid global styles that affect component styling.
  - Use CSS variables for theming.

- **`variables.scss` for CSS variables.**
  - Define all CSS custom properties in `variables.scss`.
  - Import variables in `globals.scss` or component files as needed.
  - Use variables for colors, spacing, typography, etc.

- **No Tailwind.**
  - Do not install or use Tailwind CSS.
  - Do not use utility-first CSS frameworks.
  - Use SCSS Modules for all styling.

## H. Quality & Verification

- **Code must typecheck and build.**
  - All code must pass TypeScript compilation without errors.
  - All code must pass Next.js build process.
  - Fix all linter errors before marking a step complete.

- **List verification commands after each step.**
  - After completing each step, provide commands to verify:
    - Type checking: `npm run type-check` or `tsc --noEmit`
    - Build: `npm run build`
    - Linting: `npm run lint` (if configured)
  - Ensure all verification commands pass before proceeding.

---

## Additional Guidelines

- **File Organization:**
  - Keep related files together.
  - Use clear, descriptive file names.
  - Follow Next.js App Router conventions.

- **Error Handling:**
  - Handle errors gracefully.
  - Provide meaningful error messages.
  - Log errors appropriately (server-side only).

- **Code Comments:**
  - Write self-documenting code.
  - Add comments only when necessary to explain "why", not "what".
  - Use JSDoc for public APIs if needed.

- **Testing (Future):**
  - When testing is added, write tests for critical paths.
  - Focus on integration tests for MVP.

---

**Remember:** These rules are non-negotiable. If a rule conflicts with a request, discuss it with the user before proceeding.


# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework

**Runner:** None. No automated test framework is installed or configured.

No `jest.config.*`, `vitest.config.*`, or `playwright.config.*` files exist. No `*.test.*` or `*.spec.*` files exist in the codebase.

**Testing dependencies in `package.json`:** None (no `jest`, `vitest`, `@testing-library/*`, `playwright`, or `cypress` in `dependencies` or `devDependencies`).

---

## Quality Gates (in lieu of tests)

### TypeScript type checking

```bash
npm run type-check   # alias for: tsc --noEmit
```

Defined in `package.json` scripts. Catches type errors across all `.ts` and `.tsx` files. This is the primary automated quality gate. Run this before committing any change.

### Build + lint check

```bash
npm run build        # next build — runs ESLint + type check + bundling
npm run lint         # next lint — ESLint with next/core-web-vitals only
```

`next build` is the full quality gate. It runs ESLint on all source files, performs TypeScript type checking, and validates that all pages/routes compile without errors. A successful build confirms the codebase is in a deployable state.

### Development mode validation

```bash
npm run dev          # next dev — fast refresh with runtime error overlay
```

Used for visual/functional manual testing during development.

---

## Manual Testing Process

All feature testing is manual via the browser:

1. Run `npm run dev`
2. Open `http://localhost:3000`
3. Navigate through the affected user flows
4. Verify behavior on both mobile viewport (Chrome DevTools device emulation) and desktop width

**Critical flows to verify manually after changes:**

- **Album:** Add/remove individual cards, bulk paste via QuickPaste, stat counters update
- **Compare/Intercambios:** Match cards display, mutual vs. direct badge, ExchangeActions (WhatsApp link, message form)
- **Search:** Debounced search by name/city, by card code (`MEX-05`), by team abbreviation (`ARG`)
- **Mensajes:** Send message, mark as read, unread badge count in BottomNav, inbox/outbox clear
- **Auth:** Register, login, sign-out, password recovery email flow
- **Public profile:** `/u/[slug]` renders without auth, shows contact info only if `show_contact = true`

---

## What Is Covered by Type Safety

The following bugs are caught at compile time (not test time):

- Missing or wrong fields in `ServerActionResult` destructuring
- Non-null access on Supabase nullable columns (e.g., `whatsapp: string | null`)
- Incorrect `CardKind` values (`"needed" | "duplicate"`)
- Missing `card_id` / `user_id` in DB insert shapes

The `Database` type in `types/database.ts` is hand-maintained and used by both `lib/supabase/server.ts` and `lib/supabase/client.ts` via `createServerClient<Database>()` and `createBrowserClient<Database>()`. New DB columns must be added to `types/database.ts` to benefit from this coverage.

---

## Coverage Gaps

### No unit tests for utility functions

`lib/utils.ts` contains non-trivial parsing logic with no test coverage:

- `parseQuickPaste()` — handles batch format (`MEX: 1,2,3`), range format (`MEX: 1-20`), single-card format (`MEX-05 x2`), deduplication with quantity summing, and error accumulation
- `tokenizeSearch()` — parses free-text into structured card/profile search filters
- `mapAuthError()` — string matching on Supabase error messages
- `slugify()` — Unicode normalization and slug generation

These are pure functions with clear input/output contracts — highest priority candidates for unit tests if testing is ever added.

### No integration tests for server actions

Server actions in `app/(app)/album/actions.ts` and `app/(app)/mensajes/actions.ts` contain auth checks, input validation, and Supabase mutations. No integration or end-to-end tests verify:

- Unauthenticated requests return `{ ok: false }`
- Out-of-range card numbers are rejected
- `revalidatePath` is called after successful mutations
- Bulk operations correctly count `added` vs `updated`

### No end-to-end tests

No Playwright or Cypress setup. Critical user flows (auth, album management, messaging) have no automated regression coverage.

---

## Recommended Test Setup (not yet implemented)

If automated testing is added, these are the recommended tools consistent with the Next.js 14 + TypeScript stack:

**Unit tests:** Vitest (zero-config with Vite-compatible projects, native ESM)
- Config file: `vitest.config.ts`
- Target: `lib/utils.ts` pure functions

**Component tests:** Vitest + `@testing-library/react`
- Target: UI components in `components/ui/`

**End-to-end:** Playwright
- Config file: `playwright.config.ts`
- Target: auth flows, album CRUD, messaging

---

*Testing analysis: 2026-05-06*

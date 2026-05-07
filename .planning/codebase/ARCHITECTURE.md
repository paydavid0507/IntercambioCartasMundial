<!-- refreshed: 2026-05-06 -->
# Architecture

**Analysis Date:** 2026-05-06

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Browser / Next.js App Router                      │
├────────────────┬───────────────┬──────────────┬─────────────────────┤
│  Public pages  │  Auth pages   │  Authenticated│   Public profiles   │
│  `app/page.tsx`│ `app/login`   │  `app/(app)/*`│  `app/u/[slug]`     │
│  `app/privacid`│ `app/register`│               │                     │
│                │ `app/recover` │               │                     │
└────────┬───────┴───────┬───────┴──────┬────────┴──────────┬─────────┘
         │               │              │                    │
         ▼               ▼              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Server Components (RSC)                            │
│   Fetch data with `lib/supabase/server.ts` (cookie-based session)    │
│   Pass serializable props to Client Components                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              ▼                ▼                    ▼
 ┌────────────────────┐ ┌─────────────┐  ┌──────────────────────────┐
 │  Server Actions     │ │  Client     │  │  Real-time subscription  │
 │ `album/actions.ts` │ │  Components │  │  `UnreadProvider.tsx`    │
 │ `mensajes/actions` │ │ `CardForm`  │  │  `lib/supabase/client.ts`│
 │ `profile/page.tsx` │ │ `CardList`  │  │  Supabase Realtime WS    │
 │  `"use server"`    │ │ `QuickPaste`│  └──────────────────────────┘
 └────────────────────┘ └─────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Supabase (PostgreSQL)                          │
│  profiles · teams · cards · user_card_needs · user_card_duplicates  │
│  messages · v_direct_card_matches · v_user_match_summary            │
│  RLS policies on every table · Realtime enabled on messages         │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root layout | Font variables, html/body shell | `app/layout.tsx` |
| App layout | Auth gate, fetch unread count, wrap in UnreadProvider | `app/(app)/layout.tsx` |
| Middleware | Session refresh on every request via Supabase SSR | `middleware.ts` + `lib/supabase/middleware.ts` |
| Album page | Server fetch of needs/duplicates, render tabs | `app/(app)/album/page.tsx` |
| Album actions | upsertCard, deleteCard, bulkDeleteCards, bulkUpsertFromText | `app/(app)/album/actions.ts` |
| Compare page | Server fetch of match views, sort by MUTUAL/DIRECT/NONE | `app/(app)/compare/page.tsx` |
| ExchangeColumn | Pure display of card list per counterpart | `app/(app)/compare/ExchangeColumn.tsx` |
| ExchangeActions | Client: WhatsApp link, inline message form, calls sendMessage | `app/(app)/compare/ExchangeActions.tsx` |
| Search page | Auth gate + pass userId to SearchClient | `app/(app)/search/page.tsx` |
| SearchClient | Client-side search against Supabase via browser client | `app/(app)/search/SearchClient.tsx` |
| Mensajes page | Server fetch inbox/outbox, build profileMap | `app/(app)/mensajes/page.tsx` |
| InboxClient | Client: tabs, markAsRead, clearBox actions | `app/(app)/mensajes/InboxClient.tsx` |
| Mensajes actions | sendMessage, markAsRead, clearBox | `app/(app)/mensajes/actions.ts` |
| Profile page | Server fetch + inline `"use server"` updateProfile action | `app/(app)/profile/page.tsx` |
| Public profile | Server-rendered, accessible to anon visitors | `app/u/[slug]/page.tsx` |
| MessageForm | Client form on public profile that calls sendMessage | `app/u/[slug]/MessageForm.tsx` |
| UnreadProvider | React context + Supabase Realtime subscription for unread count | `components/UnreadProvider.tsx` |
| Navbar | Server component (receives displayName prop), holds NavLinks | `components/Navbar.tsx` |
| NavLinks | Client component, reads unread from context, active link | `components/NavLinks.tsx` |
| BottomNav | Client component, mobile fixed nav, reads unread from context | `components/BottomNav.tsx` |
| CardForm | Client form, calls upsertCard server action | `components/CardForm.tsx` |
| CardList | Client: filter, select, inline edit, calls album actions | `components/CardList.tsx` |
| QuickPaste | Client: bulk text input, calls bulkUpsertFromText | `components/QuickPaste.tsx` |
| notifications | Pure server util: find match counterparts, insert messages | `lib/notifications.ts` |

## Pattern Overview

**Overall:** Next.js App Router — Server Components by default, Client Components for interactivity, Server Actions for mutations.

**Key Characteristics:**
- All data-fetching pages are async Server Components; they use `lib/supabase/server.ts` (cookie-based `createServerClient`)
- All mutations go through `"use server"` actions — never direct Supabase calls from the browser for writes
- Real-time (Supabase Realtime WebSocket) is isolated in `UnreadProvider`, the only place a persistent browser subscription lives
- Auth is enforced at two layers: middleware (session refresh) and layout/page `redirect("/login")` checks
- RLS is the final authority — the database enforces ownership regardless of what the application code sends

## Layers

**Routing / Pages (Server):**
- Purpose: Fetch data, enforce auth, compose page markup, pass props to client components
- Location: `app/(app)/*/page.tsx`, `app/u/[slug]/page.tsx`
- Contains: async React Server Components, `generateMetadata`, inline `"use server"` actions (profile page only)
- Depends on: `lib/supabase/server.ts`, feature components, server actions
- Used by: Next.js App Router

**Server Actions:**
- Purpose: Handle all write mutations from client components or forms
- Location: `app/(app)/album/actions.ts`, `app/(app)/mensajes/actions.ts`
- Contains: `"use server"` functions, auth check via `supabase.auth.getUser()`, validation, Supabase writes, `revalidatePath`
- Depends on: `lib/supabase/server.ts`, `lib/teams.ts`, `lib/utils.ts`, `lib/notifications.ts`
- Used by: Client components (`CardForm`, `CardList`, `QuickPaste`, `ExchangeActions`, `InboxClient`), Server Components (`app/(app)/profile/page.tsx`)

**Client Components:**
- Purpose: Interactivity (forms, filters, real-time UI, transitions)
- Location: `components/*.tsx` (marked `"use client"`), `app/(app)/*/SearchClient.tsx`, `app/(app)/*/InboxClient.tsx`, `app/(app)/compare/ExchangeActions.tsx`
- Contains: React state, `useTransition` for action calls, Supabase browser client for reads (search only)
- Depends on: `lib/supabase/client.ts` (search + UnreadProvider), server actions (mutations)
- Used by: Server Component pages (as leaf components)

**Supabase Clients:**
- Purpose: Provide typed Supabase clients appropriate for each context
- Location: `lib/supabase/server.ts` (SSR), `lib/supabase/client.ts` (browser), `lib/supabase/middleware.ts` (edge)
- Rule: Server Components and Server Actions always use `lib/supabase/server.ts`. Client Components use `lib/supabase/client.ts` only for reads (search queries, Realtime subscriptions). Writes must go through Server Actions.

**Utilities:**
- Purpose: Shared pure functions with no side effects
- Location: `lib/utils.ts`, `lib/teams.ts`, `lib/notifications.ts`
- Contains: `cn()`, `slugify()`, `mapAuthError()`, `parseQuickPaste()`, `tokenizeSearch()`, team catalog, `notifyMatchedUsers()`

## Data Flow

### Album Mutation (upsertCard)

1. User fills `CardForm` (client) and submits (`app/(app)/album/page.tsx` renders `CardForm`)
2. `CardForm.onSubmit` calls `upsertCard(kind, abbr, number, qty)` — a server action in `app/(app)/album/actions.ts`
3. Server action: validates abbr via `isAllowedAbbr()`, looks up card catalog, upserts into `user_card_needs` or `user_card_duplicates`
4. If the card is **new** (not an update), calls `notifyMatchedUsers()` from `lib/notifications.ts`
5. `notifyMatchedUsers` queries for counterpart users with matching needs/duplicates, filters `notify_matches = true`, inserts rows into `messages`
6. Server action calls `revalidatePath("/album")` — Next.js revalidates the page
7. Supabase Realtime fires an INSERT event on `messages` to connected `UnreadProvider` subscribers
8. `UnreadProvider` increments the unread count in React context
9. `BottomNav` and `NavLinks` re-render with the new badge count

### Page Load (Authenticated)

1. Browser request hits Next.js middleware (`middleware.ts`)
2. `updateSession` in `lib/supabase/middleware.ts` refreshes the Supabase session cookie if expired
3. `app/(app)/layout.tsx` runs: calls `supabase.auth.getUser()`, redirects to `/login` if no session
4. Layout fetches `profiles` (display name) and unread message count in parallel
5. Wraps children in `<UnreadProvider initialCount={N} userId={uid}>`
6. `UnreadProvider` mounts, subscribes to Supabase Realtime channel `unread-{userId}`
7. Page-level Server Component fetches its own data and renders

### Public Profile (Unauthenticated)

1. Browser requests `/u/[slug]`
2. No auth required — middleware still refreshes session but no redirect
3. `app/u/[slug]/page.tsx` fetches profile by `share_slug`, fetches needs/duplicates
4. If visitor is authenticated and not the profile owner, renders `MessageForm` (client)
5. If unauthenticated, shows "login to send a message" prompt

**State Management:**
- Server state: Supabase database, revalidated via `revalidatePath` after mutations
- Client state: React `useState` / `useTransition` inside individual components (no global client store)
- Real-time cross-component state: `UnreadCtx` context provided by `UnreadProvider`, consumed by `NavLinks` and `BottomNav` via `useUnread()`

## Key Abstractions

**`ServerActionResult`:**
- Purpose: Typed discriminated union returned by all album server actions
- Examples: `app/(app)/album/actions.ts` line 15
- Pattern: `{ ok: true } | { ok: false; error: string }` — client components check `result.ok` before updating UI

**`CardRow`:**
- Purpose: Normalized card shape used by CardList and CardForm
- Examples: `components/CardList.tsx` (exported type)
- Pattern: `{ card_id, card_code, team_abbr, card_number, quantity }`

**`CardKind`:**
- Purpose: Union type `"needed" | "duplicate"` — single parameter that switches all album operations between the two user card tables
- Examples: `app/(app)/album/actions.ts`, `components/CardForm.tsx`, `components/CardList.tsx`

**Match Views:**
- Purpose: PostgreSQL views that compute card matches between users without application-layer joins
- Examples: `supabase/migrations/0003_views.sql`
- Pattern: `v_direct_card_matches` (card-level), `v_user_match_summary` (user-level with MUTUAL/DIRECT/NONE)

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every request
- Responsibilities: Load Google Fonts (Bebas Neue, Plus Jakarta Sans), set `lang="es"`, set page metadata

**App Layout (Authenticated Shell):**
- Location: `app/(app)/layout.tsx`
- Triggers: Any request under `/(app)` route group
- Responsibilities: Auth gate (redirect to `/login`), fetch display name and unread count, render `Navbar` + `BottomNav` + `UnreadProvider`

**Middleware:**
- Location: `middleware.ts` + `lib/supabase/middleware.ts`
- Triggers: All routes except `_next/static`, `_next/image`, `favicon.ico`, images, and static assets
- Responsibilities: Refresh Supabase session cookie so Server Components always read a valid session

**Auth Callback:**
- Location: `app/auth/callback/route.ts`
- Triggers: GET request from Supabase email confirmation / magic link redirect
- Responsibilities: Exchange `code` for session, redirect to `/album` (or safe `next` param)

**Sign-out:**
- Location: `app/auth/sign-out/route.ts`
- Triggers: POST from Navbar form
- Responsibilities: Sign out via Supabase, redirect to `/login`

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop (Vercel serverless). No shared mutable state between requests.
- **Global state:** None at module level. `UnreadProvider` is the only cross-component state and is scoped to the React tree per request.
- **Circular imports:** None detected. `lib/notifications.ts` accepts `SupabaseClient` as a parameter to avoid importing from the server module, preventing circular dependency.
- **Server/Client boundary:** Pages and layouts are Server Components. Client Components are leaf nodes. Server Actions are the only bridge for mutations. Never import `lib/supabase/server.ts` from a `"use client"` file.
- **Realtime:** Only `UnreadProvider` holds a persistent Supabase channel. `REPLICA IDENTITY FULL` is set on `messages` so DELETE events include `recipient_id` for client-side filtering (`supabase/migrations/0012_realtime_messages.sql`).
- **FWC special case:** The FIFA World Cup card (`FWC`) has a card at position `00` (trophy card). `cardNumberMin()` in `lib/teams.ts` returns `0` for `FWC` and `1` for all others. All validation code must call `cardNumberMin(abbr)` rather than hardcoding `1`.

## Anti-Patterns

### Calling `lib/supabase/server.ts` from a Client Component

**What happens:** Importing `createClient` from `lib/supabase/server.ts` inside a `"use client"` file.
**Why it's wrong:** `lib/supabase/server.ts` calls `cookies()` from `next/headers`, which is only available in Server Components and Server Actions. The build will fail or produce a runtime error.
**Do this instead:** Use `lib/supabase/client.ts` (`createBrowserClient`) in Client Components. For writes, invoke a Server Action instead.

### Bypassing Server Actions for writes

**What happens:** A Client Component directly calls `supabase.from("user_card_needs").insert(...)` using the browser client.
**Why it's wrong:** The browser client uses the anon key. While RLS prevents unauthorized access, it bypasses server-side validation (`isAllowedAbbr`, card catalog lookup, `notifyMatchedUsers`). Also skips `revalidatePath`.
**Do this instead:** All writes go through `"use server"` actions in `app/(app)/album/actions.ts` or `app/(app)/mensajes/actions.ts`.

### Skipping `supabase.auth.getUser()` in a Server Action

**What happens:** A Server Action reads `user_id` from a cookie or client-supplied parameter instead of calling `supabase.auth.getUser()`.
**Why it's wrong:** RLS relies on `auth.uid()` which is derived from the verified JWT. A spoofed `user_id` in the request body is not the same as the authenticated session.
**Do this instead:** Always call `supabase.auth.getUser()` at the top of every Server Action and return an error if `!user`.

## Error Handling

**Strategy:** Discriminated union results from Server Actions. Auth errors result in `redirect("/login")`. Database errors surface as user-visible error strings.

**Patterns:**
- Server Actions return `{ ok: true } | { ok: false; error: string }` — client checks `result.ok`
- Auth pages use `lib/utils.ts mapAuthError()` to localize Supabase error strings to Spanish
- Notifications use `console.error` with a `[notifications]` prefix and silently fail — a notification failure never blocks the primary mutation
- Profile mutations redirect with `?error=...` or `?message=...` query params read by the page

## Cross-Cutting Concerns

**Logging:** `console.error` only, in `lib/notifications.ts` for non-critical notification failures. No structured logging library.
**Validation:** Server-side in Server Actions (`isAllowedAbbr`, `cardNumberMin`, quantity checks). Client-side via HTML `required`, `min`, `max`, `maxLength` for UX only — never trusted.
**Authentication:** Supabase Auth (email/password + email confirmation). Session persisted in cookies via `@supabase/ssr`. Enforced at middleware (refresh), layout (redirect), and action (getUser) levels.
**Internationalization:** Spanish only. No i18n library. All UI strings are hardcoded in Spanish. `mapAuthError()` translates Supabase English error messages to Spanish.
**Slug generation:** `slugify()` in `lib/utils.ts` — lowercase, NFD normalize, remove diacritics, collapse non-alphanumeric to hyphens, trim to 60 chars.

---

*Architecture analysis: 2026-05-06*

<!-- refreshed: 2026-05-06 -->
# Codebase Structure

**Analysis Date:** 2026-05-06

## Directory Layout

```
IntercambioCartasMundial/
├── app/                        # Next.js App Router root
│   ├── layout.tsx              # Root layout: fonts, html/body
│   ├── page.tsx                # Landing page (public, no auth)
│   ├── globals.css             # Global CSS, Tailwind base
│   ├── privacidad/
│   │   └── page.tsx            # Privacy policy (public)
│   ├── (app)/                  # Route group — authenticated shell
│   │   ├── layout.tsx          # Auth gate, Navbar, BottomNav, UnreadProvider
│   │   ├── album/
│   │   │   ├── page.tsx        # Album page (needs + duplicates tabs)
│   │   │   └── actions.ts      # Server actions: upsertCard, deleteCard, bulkDelete, bulkUpsertFromText
│   │   ├── compare/
│   │   │   ├── page.tsx        # Exchanges page (match views, sorted MUTUAL→DIRECT→NONE)
│   │   │   ├── ExchangeColumn.tsx  # Display-only: card list for one counterpart side
│   │   │   └── ExchangeActions.tsx # Client: WhatsApp link + inline message form
│   │   ├── search/
│   │   │   ├── page.tsx        # Auth gate + pass userId to SearchClient
│   │   │   └── SearchClient.tsx    # Client: search input, Supabase browser queries
│   │   ├── mensajes/
│   │   │   ├── page.tsx        # Server fetch of inbox/outbox + profile map
│   │   │   ├── InboxClient.tsx # Client: tabs, markAsRead, clearBox
│   │   │   └── actions.ts      # Server actions: sendMessage, markAsRead, clearBox
│   │   └── profile/
│   │       └── page.tsx        # Server fetch + inline updateProfile server action
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts        # GET handler: exchange code for session, redirect
│   │   └── sign-out/
│   │       └── route.ts        # POST handler: supabase.auth.signOut, redirect to /login
│   ├── login/
│   │   └── page.tsx            # Public login form (email + password)
│   ├── register/
│   │   └── page.tsx            # Public registration form
│   ├── recover/
│   │   └── page.tsx            # Password recovery / reset form
│   └── u/
│       └── [slug]/
│           ├── page.tsx        # Public profile page (accessible to anon)
│           └── MessageForm.tsx # Client: send message to profile owner
├── components/
│   ├── ui/                     # Base UI primitives (no business logic)
│   │   ├── Button.tsx          # Button with size/variant props
│   │   ├── Input.tsx           # Styled input
│   │   ├── Select.tsx          # Styled select
│   │   ├── Label.tsx           # Form label
│   │   ├── Card.tsx            # Card, CardHeader, CardContent, CardTitle
│   │   ├── Tabs.tsx            # Tabs, TabsList, TabsTrigger, TabsContent
│   │   └── PasswordInput.tsx   # Input with show/hide toggle
│   ├── CardForm.tsx            # Client: single-card add form (calls upsertCard)
│   ├── CardList.tsx            # Client: filterable card list, bulk select, inline edit
│   ├── QuickPaste.tsx          # Client: multi-line text paste → bulkUpsertFromText
│   ├── Navbar.tsx              # Server: top navigation bar (receives displayName prop)
│   ├── NavLinks.tsx            # Client: desktop nav links + unread badge
│   ├── BottomNav.tsx           # Client: mobile fixed bottom navigation + unread badge
│   └── UnreadProvider.tsx      # Client: React context + Supabase Realtime subscription
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # createServerClient (SSR, cookie-based) — use in Server Components + Actions
│   │   ├── client.ts           # createBrowserClient — use in Client Components only
│   │   └── middleware.ts       # updateSession — called by middleware.ts to refresh cookies
│   ├── teams.ts                # Team abbreviation catalog, CARD_NUMBER_MAX, cardNumberMin(), isAllowedAbbr()
│   ├── utils.ts                # cn(), slugify(), mapAuthError(), parseQuickPaste(), tokenizeSearch()
│   └── notifications.ts        # notifyMatchedUsers() — insert inbox messages on new card matches
├── supabase/
│   └── migrations/             # 12 ordered SQL migration files
│       ├── 0001_init.sql       # Schema: profiles, teams, cards, user_card_needs, user_card_duplicates, indexes, triggers
│       ├── 0002_seed.sql       # Seed: 49 teams, 980 cards (49 × 20, FWC has extra card-00)
│       ├── 0003_views.sql      # Views: v_direct_card_matches, v_user_match_summary
│       ├── 0004_rls.sql        # RLS policies for all tables
│       ├── 0005_helpers.sql    # Helper functions (slugify in DB, etc.)
│       ├── 0006_whatsapp_privacy.sql  # Add show_contact column to profiles
│       ├── 0007_fwc_card_00.sql       # Insert FWC-00 trophy card, relax card_number check
│       ├── 0008_messages.sql          # messages table + RLS
│       ├── 0009_message_limit.sql     # Max 10 messages per inbox constraint / helper
│       ├── 0010_messages_delete_policy.sql  # RLS: users can delete own inbox/outbox messages
│       ├── 0011_notify_matches.sql    # Add notify_matches boolean column to profiles
│       └── 0012_realtime_messages.sql # REPLICA IDENTITY FULL + supabase_realtime publication
├── middleware.ts               # Next.js middleware entry: calls updateSession on all routes
├── types/
│   └── database.ts             # Auto-generated Supabase TypeScript types (Database interface)
├── public/                     # Static assets
│   └── images/                 # Logo / hero images
├── tailwind.config.ts          # Tailwind config: brand color palette, font variables
├── tsconfig.json               # TypeScript config: path alias @/ → project root
├── next.config.ts              # Next.js config
└── package.json                # Dependencies: Next.js 14, Supabase SSR, Tailwind, lucide-react
```

## Directory Purposes

**`app/(app)/`:**
- Purpose: All pages that require an authenticated session
- Contains: Page server components, co-located server actions (`actions.ts`), co-located client components
- Key files: `layout.tsx` (auth gate + shell), `album/actions.ts` (all card mutations), `mensajes/actions.ts` (all message mutations)
- Access: Redirects to `/login` if no Supabase session

**`app/auth/`:**
- Purpose: OAuth / email flow handlers — not rendered pages, only Route Handlers
- Contains: `callback/route.ts` (code exchange), `sign-out/route.ts` (sign-out POST)
- Key files: `app/auth/callback/route.ts`

**`app/login/`, `app/register/`, `app/recover/`:**
- Purpose: Public auth pages (no authentication required)
- Contains: Client-side forms that call Supabase Auth directly or via server actions
- Access: Publicly accessible; redirect to `/album` on success

**`app/u/[slug]/`:**
- Purpose: Public profile pages — shareable URL for each user's card inventory
- Contains: Server-rendered profile + card lists, `MessageForm` client component
- Access: Fully public (anon-accessible). Auth state determines whether the message form or a login prompt is shown.

**`components/ui/`:**
- Purpose: Reusable base UI primitives with no domain knowledge
- Contains: Button, Input, Select, Label, Card, Tabs, PasswordInput
- Rule: These components must not import from `app/` or reference business logic. They accept only styling/behavior props.

**`components/`:**
- Purpose: Feature-level components with domain knowledge
- Contains: CardForm, CardList, QuickPaste (album feature), Navbar, NavLinks, BottomNav (chrome), UnreadProvider (real-time state)
- Rule: May import from `lib/`, `components/ui/`, and `app/(app)/*/actions.ts`. Must not import from other page directories.

**`lib/supabase/`:**
- Purpose: Supabase client factories — three variants for three execution contexts
- Rule: `server.ts` for Server Components and Server Actions only. `client.ts` for Client Components only. `middleware.ts` for `middleware.ts` only. Never mix.

**`lib/`:**
- Purpose: Pure utility functions and domain constants shared across the application
- Contains: `teams.ts` (team catalog), `utils.ts` (cn, slugify, parsers), `notifications.ts` (match notification logic)
- Rule: Files in `lib/` must not import from `app/` or `components/`. They are the innermost layer.

**`supabase/migrations/`:**
- Purpose: Ordered SQL migration files applied to the Supabase (PostgreSQL) project
- Contains: 12 migrations numbered `0001`–`0012`
- Generated: No — hand-written SQL
- Committed: Yes — migrations are the source of truth for schema. Never edit a deployed migration; always add a new one.

**`types/`:**
- Purpose: TypeScript type definitions
- Key files: `types/database.ts` — `Database` interface generated from the Supabase schema, used to type all `createClient<Database>()` calls

## Key File Locations

**Entry Points:**
- `middleware.ts`: Runs on every non-static request, refreshes session cookie
- `app/layout.tsx`: Root layout, sets fonts and html attributes
- `app/(app)/layout.tsx`: Authenticated shell, auth guard
- `app/page.tsx`: Landing page (marketing/hero)

**Supabase Clients:**
- `lib/supabase/server.ts`: Use in all Server Components and Server Actions
- `lib/supabase/client.ts`: Use in Client Components (reads + Realtime only)
- `lib/supabase/middleware.ts`: Use only from `middleware.ts`

**Server Actions:**
- `app/(app)/album/actions.ts`: upsertCard, deleteCard, bulkDeleteCards, bulkUpsertFromText
- `app/(app)/mensajes/actions.ts`: sendMessage, markAsRead, clearBox

**Domain Constants:**
- `lib/teams.ts`: Single source of truth for allowed team abbreviations (49 teams) and card number range. Keep in sync with `supabase/migrations/0002_seed.sql`.

**Database Schema:**
- `supabase/migrations/0001_init.sql`: Core tables
- `supabase/migrations/0004_rls.sql`: All RLS policies (reference when adding new tables)
- `supabase/migrations/0003_views.sql`: Match views (`v_direct_card_matches`, `v_user_match_summary`)

**Notification Logic:**
- `lib/notifications.ts`: `notifyMatchedUsers()` — called from `album/actions.ts` after new cards are added

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Route handlers: `route.ts`
- Server actions: `actions.ts` (co-located in page directory)
- Client-only components that are co-located: PascalCase suffix matching role — e.g., `SearchClient.tsx`, `InboxClient.tsx`, `ExchangeActions.tsx`, `ExchangeColumn.tsx`
- Standalone components: PascalCase — e.g., `CardForm.tsx`, `CardList.tsx`, `UnreadProvider.tsx`
- Utilities: camelCase — e.g., `utils.ts`, `teams.ts`, `notifications.ts`

**Directories:**
- Route groups: lowercase in parentheses — `(app)/`
- Dynamic segments: bracket notation — `[slug]/`
- Feature pages: lowercase — `album/`, `compare/`, `search/`, `mensajes/`, `profile/`
- UI primitives: `ui/`

**Components:**
- All React components: PascalCase function names matching the filename
- Server Components: no directive (default)
- Client Components: `"use client"` at top of file
- Server Actions: `"use server"` at top of file

## Where to Add New Code

**New authenticated page:**
- Page file: `app/(app)/<feature>/page.tsx` (Server Component, async)
- Server actions: `app/(app)/<feature>/actions.ts` (add `"use server"` at top)
- Client components: `app/(app)/<feature>/<ComponentName>.tsx` (add `"use client"` at top)
- Tests (if added): co-locate or place under `__tests__/<feature>/`

**New reusable UI component (no business logic):**
- Implementation: `components/ui/<ComponentName>.tsx`
- Must not import from `app/`, `lib/notifications.ts`, or action files

**New feature component (with domain knowledge):**
- Implementation: `components/<ComponentName>.tsx`
- May import from `lib/`, `components/ui/`, and action files

**New utility function:**
- If domain-agnostic (string, class): add to `lib/utils.ts`
- If team/card-specific: add to `lib/teams.ts`
- If notification-related: add to `lib/notifications.ts`

**New database table:**
1. Write `supabase/migrations/NNNN_<description>.sql` with the next sequential number
2. Add RLS policies in the same migration (follow pattern in `0004_rls.sql`)
3. Regenerate `types/database.ts` via Supabase CLI
4. Update `lib/supabase/server.ts` and `lib/supabase/client.ts` type parameters (already use `Database`)

**New server action:**
- Add to the closest `actions.ts` for the feature, or create `app/(app)/<feature>/actions.ts`
- Always start with `"use server"` and call `supabase.auth.getUser()` before any data operation
- Return `ServerActionResult` (`{ ok: true } | { ok: false; error: string }`) for consistency

## Special Directories

**`.planning/`:**
- Purpose: GSD planning artifacts — phase plans, codebase maps
- Generated: By GSD commands (`/gsd-map-codebase`, `/gsd-plan-phase`)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes — by `next build` / `next dev`
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes — by `npm install`
- Committed: No

**`supabase/migrations/`:**
- Purpose: Ordered SQL migrations — schema source of truth
- Generated: No — hand-written
- Committed: Yes — never delete or edit deployed migrations

**`public/images/`:**
- Purpose: Static image assets (logo, hero graphics)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-05-06*

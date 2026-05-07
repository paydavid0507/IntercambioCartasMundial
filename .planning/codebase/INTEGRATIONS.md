# External Integrations

**Analysis Date:** 2026-05-06

## APIs & External Services

### Supabase (primary backend)

All backend services run on a single Supabase project.

**SDKs:**
- `@supabase/supabase-js` ^2.105.3 — JS client
- `@supabase/ssr` ^0.10.2 — SSR/cookie adapter

**Auth:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
**URL:** `NEXT_PUBLIC_SUPABASE_URL` (public)

Three client instantiation patterns:

| File | Context | Factory |
|------|---------|---------|
| `lib/supabase/client.ts` | Browser (Client Components) | `createBrowserClient<Database>()` |
| `lib/supabase/server.ts` | Server Components & Server Actions | `createServerClient<Database>()` with cookie store |
| `lib/supabase/middleware.ts` | Next.js middleware | `createServerClient<Database>()` with request/response cookies |

All three are typed against `types/database.ts` (generated Supabase schema types).

### WhatsApp — wa.me deep links

**Type:** External deep link (no API key, no SDK, no webhook)

**How it works:** User-provided WhatsApp numbers are stored in `profiles.whatsapp`. When `profiles.show_contact = true`, the number is rendered as an `https://wa.me/<digits-only>` link. The phone number is sanitized with `.replace(/[^0-9]/g, "")` before inclusion in the URL.

**Usage locations:**
- `app/u/[slug]/page.tsx` — public profile page "Contactar por WhatsApp" button
- `app/(app)/compare/ExchangeActions.tsx` — compare view exchange action button
- `lib/notifications.ts` — inline wa.me link appended to match notification messages

## Data Storage

### Database — Supabase PostgreSQL

**Connection:** `NEXT_PUBLIC_SUPABASE_URL` (handled by Supabase client; no raw DB string)

**Client/ORM:** Supabase JS client (query builder, not a traditional ORM)

**Schema** (migrations in `supabase/migrations/`):

| Table | Purpose |
|-------|---------|
| `public.profiles` | User profiles: display name, city, country, WhatsApp, share slug, notification prefs |
| `public.teams` | Reference catalog of 48 FIFA World Cup 2026 teams |
| `public.cards` | Reference catalog of sticker cards (team + number 1–20, generated `card_code`) |
| `public.user_card_needs` | Cards a user is missing (quantity_needed ≥ 1) |
| `public.user_card_duplicates` | Cards a user has extra (quantity_available ≥ 1) |
| `public.messages` | Internal inbox messages between users |

**Views:**

| View | Purpose |
|------|---------|
| `public.v_direct_card_matches` | Cards where one user has duplicates another user needs |
| `public.v_user_match_summary` | Per-user-pair match summary with type (MUTUAL / DIRECT / NONE) |

**Extensions:** `pgcrypto` (UUID generation)

**Row Level Security:** Enabled on all tables.

RLS policy summary:

| Table | Anon read | Auth read | Write |
|-------|-----------|-----------|-------|
| `teams` | Yes | Yes | No |
| `cards` | Yes | Yes | No |
| `profiles` | Yes | Yes | Own row only |
| `user_card_needs` | Yes | Yes | Own rows only |
| `user_card_duplicates` | Yes | Yes | Own rows only |
| `messages` | No | Own messages only | Send (insert) as sender; update read_at as recipient |

### File Storage

Not used. No Supabase Storage buckets configured. No file upload functionality present.

### Caching

None. No Redis, Memcached, or Supabase Edge Cache configured.

## Authentication & Identity

**Provider:** Supabase Auth (email + password)

**Session mechanism:** Cookie-based sessions via `@supabase/ssr`. The middleware at `middleware.ts` calls `updateSession()` on every matched request to refresh expired sessions transparently.

**Middleware matcher** (`middleware.ts`) — runs on all paths except:
- `_next/static`
- `_next/image`
- `favicon.ico`
- `images/` directory
- Static asset extensions (svg, png, jpg, jpeg, gif, webp)

**Auth flows implemented:**
- Registration — `app/register/page.tsx`
- Login — `app/login/page.tsx`
- Password recovery — `app/recover/page.tsx`

**No OAuth/social login.** No third-party identity providers (Google, GitHub, etc.) configured.

**No email/SMS providers configured.** Supabase transactional emails (e.g., confirmation, password reset) rely on Supabase's built-in email service; no SendGrid, Resend, or Twilio integration present.

## Real-Time

**Provider:** Supabase Realtime (postgres_changes subscription)

**Configuration** (`supabase/migrations/0012_realtime_messages.sql`):
```sql
alter table public.messages replica identity full;
alter publication supabase_realtime add table public.messages;
```

`REPLICA IDENTITY FULL` is set so DELETE events include full row data (including `recipient_id`), enabling client-side filtering.

**Usage:** `app/(app)/mensajes/InboxClient.tsx` subscribes to `postgres_changes` on the `messages` table to update the unread message count in real time without polling.

## Internal Notification System

**Type:** In-app (not email/SMS/push)

**Implementation:** `lib/notifications.ts` — `notifyMatchedUsers()` function.

**Trigger:** Called from Server Actions in the album page when a user adds new needs or duplicates.

**Logic:**
1. Find users with matching needs/duplicates for the newly added cards
2. Filter to users who have `notify_matches = true` in their profile
3. Insert one `messages` row per matched user (from actor to recipient)
4. Message body optionally includes a `wa.me` link if actor has public WhatsApp

This uses the same `messages` table as direct user messaging — there is no separate notification table.

## Monitoring & Observability

**Error Tracking:** None. No Sentry, Datadog, or equivalent configured.

**Logs:** `console.error()` used in `lib/notifications.ts` for Supabase insert failures. No structured logging library.

**Analytics:** None detected.

## CI/CD & Deployment

**Hosting:** Vercel (inferred — Next.js 14 App Router + Supabase SSR is the standard Vercel deployment pattern; no `vercel.json` present, deployment config managed via Vercel dashboard).

**CI Pipeline:** None detected. No GitHub Actions, CircleCI, or equivalent workflow files present.

**Database migrations:** Applied manually via Supabase CLI or Supabase dashboard. Migration files are in `supabase/migrations/` (numbered `0001` through `0012`).

## Environment Configuration

**Required environment variables:**

| Variable | Visibility | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser-safe) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser-safe) | Supabase anon/public key |

Both variables are prefixed `NEXT_PUBLIC_` so they are embedded in client bundles. No server-only secret keys are present in the codebase (the Supabase service role key is not used anywhere).

No `.env` files are committed. Existence of `.env*` files was not verified (see security note).

## Webhooks & Callbacks

**Incoming:** None. No webhook endpoints defined in `app/api/`.

**Outgoing:** None. No HTTP calls to external services beyond Supabase and wa.me links (which are browser-initiated navigations, not server-side calls).

---

*Integration audit: 2026-05-06*

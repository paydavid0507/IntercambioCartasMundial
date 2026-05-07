# Codebase Concerns

**Analysis Date:** 2026-05-06

---

## Tech Debt

**Hand-written database types out of sync with schema:**
- Issue: `types/database.ts` is maintained by hand and does not include the `notify_matches` column added in migration `0011`. As a result, `app/(app)/profile/page.tsx` uses `(profile as { notify_matches?: boolean })?.notify_matches` (line 182) and `const profileUpdate: any = { ... notify_matches ... }` (line 53) to work around the missing type. The `lib/notifications.ts` file queries `.eq("notify_matches", true)` without any TypeScript guard.
- Files: `types/database.ts`, `app/(app)/profile/page.tsx`, `lib/notifications.ts`
- Impact: TypeScript cannot catch column-name typos or type mismatches on `notify_matches`; every migration that adds a column requires manual type file edits or produces silent `any` escapes.
- Fix approach: Run `supabase gen types typescript --project-id <id> > types/database.ts` after each migration and commit the generated file; remove all manual `as any` casts.

**`as unknown as` pattern for Supabase joined query results:**
- Issue: Supabase's JS client cannot infer the shape of nested joined selects (e.g., `cards(card_code, team_abbr, card_number)` joined from `user_card_needs`). Every page that uses a joined select falls back to `as unknown as LocalType[]` to coerce the result. This pattern appears in five places.
- Files: `app/(app)/album/page.tsx` (lines 40, 51), `app/u/[slug]/page.tsx` (lines 67, 74), `app/(app)/search/SearchClient.tsx` (lines 114, 137)
- Impact: Any future schema change to joined columns will silently compile and fail at runtime.
- Fix approach: After generating Supabase types, use the generated `Database["public"]["Tables"]["..."]["Row"]` types with explicit cast helpers, or use `supabase-js` v2 type inference via the generic client.

**No automated tests (zero coverage):**
- Issue: No test framework (`jest`, `vitest`, `playwright`, `cypress`) is installed. No test files exist under `app/`, `components/`, or `lib/`. The only test scripts available are `npm run lint` and `npm run type-check`.
- Files: `package.json` (devDependencies section)
- Impact: Regressions in parsing logic (`lib/utils.ts` — `parseQuickPaste`, `tokenizeSearch`), notification fanout (`lib/notifications.ts`), and server actions (`app/(app)/album/actions.ts`) go undetected until production.
- Fix approach: Add `vitest` for unit tests; start with `lib/utils.ts` (pure functions) as the highest-value first target since it contains the QuickPaste parser that is used in every bulk import.

**Migration-only deployment — no CI/CD pipeline:**
- Issue: There is no `vercel.json`, no GitHub Actions workflow, and no Supabase CLI linked to CI. Migrations `0011_notify_matches.sql` and `0012_realtime_messages.sql` must be applied manually in the Supabase dashboard SQL editor. There is no staging environment.
- Files: `supabase/migrations/` (all 12 files)
- Impact: A deploy to Vercel that references `notify_matches` will succeed at the framework level but fail silently at runtime if the migration has not been applied. There is no automated gate preventing this.
- Fix approach: Add a GitHub Actions workflow that runs `supabase db push` against a staging project on every PR and against production on merge to `main`.

**No Node.js version pinning:**
- Issue: No `.nvmrc`, `.node-version`, or `engines` field in `package.json`. The project uses Next.js 14 which requires Node 18+.
- Files: `package.json`
- Impact: Inconsistent environments between developers; Vercel will select a default Node version that may differ from local.
- Fix approach: Add `.nvmrc` with `18` (or `20`) and add `"engines": { "node": ">=18" }` to `package.json`.

**No Prettier / formatter config:**
- Issue: No `.prettierrc` or `biome.json` is present. ESLint (`eslint-config-next`) handles linting but not formatting.
- Files: `package.json`, `.eslintrc.json`
- Impact: Formatting inconsistencies accumulate across contributors; diffs contain whitespace noise.
- Fix approach: Add `.prettierrc` and a `format` script; run on CI with `--check`.

---

## Security Considerations

**`profileUpdate: any` bypass for profile updates:**
- Risk: `app/(app)/profile/page.tsx` line 53 casts `profileUpdate` to `any` before calling `supabase.from("profiles").update(profileUpdate)`. This bypasses TypeScript's type-checking on the update payload. If a future column is added to `profiles` (e.g., `is_admin`), a crafted form submission could theoretically include it unless Supabase RLS explicitly blocks it.
- Files: `app/(app)/profile/page.tsx`
- Current mitigation: RLS policy `users can update own profile` restricts UPDATE to the authenticated user's own row (migration `0004_rls.sql`). Supabase also ignores extra keys not in the schema.
- Recommendations: Remove the `any` cast by adding `notify_matches` to `types/database.ts`; use the typed `Update` interface instead.

**Notification system inserts messages as `sender_id = actorId` — trust boundary relies on server context:**
- Risk: `lib/notifications.ts` calls `supabase.from("messages").insert(messages)` with `sender_id: actorId` where `actorId` is passed in as a plain string argument. The RLS policy `users can send messages` enforces `sender_id = auth.uid()`. This is safe because `notifyMatchedUsers` is only called from server actions (`app/(app)/album/actions.ts`) where `actorId = user.id` is taken from `supabase.auth.getUser()`. However, the function itself accepts any `actorId` string and provides no internal guard.
- Files: `lib/notifications.ts`, `app/(app)/album/actions.ts`
- Current mitigation: Server-side execution and RLS. The DB will reject any insert where `sender_id != auth.uid()`.
- Recommendations: Add an explicit `actorId === user.id` check inside `notifyMatchedUsers` or refactor to derive the actor from the Supabase client's session directly, eliminating the parameter.

**No rate limiting on server actions:**
- Risk: `upsertCard`, `bulkUpsertFromText`, and `sendMessage` in `app/(app)/album/actions.ts` and `app/(app)/mensajes/actions.ts` are Next.js Server Actions with no rate limiting, IP throttling, or captcha. An authenticated user can spam hundreds of card additions or messages per second.
- Files: `app/(app)/album/actions.ts`, `app/(app)/mensajes/actions.ts`
- Current mitigation: The DB trigger `trg_message_limit` (migration `0009_message_limit.sql`) caps each user at 10 received and 10 sent messages, bounding message spam impact. No equivalent limit exists for card upserts.
- Recommendations: Add Vercel Edge Middleware rate limiting (e.g., using Upstash Redis + `@upstash/ratelimit`) or Supabase's built-in rate limit hooks on the `messages` table.

**WhatsApp number stored and exposed without format validation:**
- Risk: The `whatsapp` field on `profiles` is a free-text string. `lib/notifications.ts` strips non-digit characters with `.replace(/[^0-9]/g, "")` before constructing `wa.me` links, but the raw value (including any text a user enters) is stored and returned to other users when `show_contact = true`.
- Files: `lib/notifications.ts` (line 68), `app/(app)/profile/page.tsx`
- Current mitigation: The `wa.me` link sanitizes digits before building the URL.
- Recommendations: Validate and normalize the WhatsApp number server-side on profile update (E.164 format or at minimum digits-only pattern).

**Profile page embeds free-text fields (`display_name`, `city`, `country`) in HTML:**
- Risk: These fields are rendered directly in JSX. React escapes them, so XSS risk is low in current JSX-only paths. Worth monitoring if values are ever used outside JSX (e.g., in `og:title` meta tags).
- Files: `app/(app)/profile/page.tsx`, `lib/utils.ts`
- Current mitigation: React JSX escaping prevents XSS in all React-rendered paths.
- Recommendations: No immediate action needed; add server-side sanitization before using these values in non-JSX contexts.

---

## Performance Bottlenecks

**`bulkUpsertFromText` triggers sequential DB queries plus notification fanout:**
- Problem: A single QuickPaste bulk import fires: (1) catalog lookup, (2) existing-row check, (3) upsert, then (4) `notifyMatchedUsers` which itself fires: (a) actor profile fetch, (b) counterpart lookup in `user_card_needs` or `user_card_duplicates`, (c) notifiable profiles fetch, (d) `messages` insert. At minimum 4–5 sequential round-trips to Supabase per bulk paste, unbounded by the number of new cards added.
- Files: `app/(app)/album/actions.ts` (lines 164–314), `lib/notifications.ts`
- Cause: No batching of notification queries; no background queue for the fanout step.
- Improvement path: Move `notifyMatchedUsers` to a Supabase Edge Function or Postgres trigger so it runs asynchronously server-side without blocking the server action response. Alternatively, use `Promise.all` where feasible to parallelize the actor profile + counterpart lookup.

**`ComparePage` loads all match data with no pagination:**
- Problem: `app/(app)/compare/page.tsx` fires three Supabase queries in parallel (`v_user_match_summary`, `v_direct_card_matches` as owner-to-me, `v_direct_card_matches` as me-to-seeker) with no `.limit()`. For a user with many matches, all rows are fetched and held in memory on the server then serialized to the client.
- Files: `app/(app)/compare/page.tsx`
- Cause: No `.limit()` or `.range()` on the three main queries.
- Improvement path: Add a limit (e.g., 50 matches) with client-side "load more"; consider materializing `v_user_match_summary`.

**`AlbumPage` fetches all user cards with no pagination:**
- Problem: `app/(app)/album/page.tsx` fetches all `user_card_needs` and `user_card_duplicates` for the current user with no `.limit()` and sorts client-side. Users who track 500+ cards will download and render all rows on every visit.
- Files: `app/(app)/album/page.tsx` (lines 27–38)
- Cause: No pagination or virtual list.
- Improvement path: Add server-side pagination or virtualization; `CardList` renders a flat `<ul>` that could support `react-window` if the list grows large.

**`SearchClient` fires up to 4 Supabase queries per keystroke (after 350ms debounce):**
- Problem: For card-code searches, `SearchClient` runs: (1) profile query, (2) card catalog lookup, (3) `user_card_duplicates` query, (4) `user_card_needs` query in parallel. No server-side caching of search results.
- Files: `app/(app)/search/SearchClient.tsx` (lines 53–175)
- Cause: All queries run client-side via the Supabase JS client; no Next.js caching or edge cache.
- Improvement path: Move search to a Next.js Route Handler with `Cache-Control` headers or use `unstable_cache`; debounce at 350ms is appropriate and should stay.

---

## Real-Time Gaps

**WebSocket reconnect does not refetch stale badge count:**
- Problem: `components/UnreadProvider.tsx` subscribes to real-time events for INSERT/UPDATE/DELETE on `messages`. If the WebSocket disconnects and reconnects (network interruption, mobile sleep, tab backgrounded), the `count` state is not refetched — only new events from the point of reconnection are processed. The badge can show a stale count.
- Files: `components/UnreadProvider.tsx`
- Current mitigation: None.
- Recommendations: Add a `refetch()` call on channel `onReconnect`, or on `visibilitychange`/`online` browser events.

**Supabase free tier: 200 concurrent real-time connections:**
- Problem: Each active browser tab subscribes to a real-time channel (`unread-{userId}`). The Supabase free tier allows 200 concurrent WebSocket connections across the entire project. At 200 simultaneous active users, the real-time service will start rejecting new connections.
- Files: `components/UnreadProvider.tsx`
- Current mitigation: None.
- Improvement path: Upgrade to Supabase Pro when user count approaches the limit; implement a polling fallback when the WebSocket channel fails to subscribe.

---

## Missing Features (Known Gaps)

**`NEXT_PUBLIC_SITE_URL` env var used but not documented as required:**
- Problem: `app/(app)/profile/page.tsx` line 95 uses `process.env.NEXT_PUBLIC_SITE_URL ?? "https://intercambio-cartas-mundial.vercel.app"` to build the public share URL. This env var is not mentioned in any `.env.example` or project documentation.
- Files: `app/(app)/profile/page.tsx`
- Impact: On a non-production Vercel preview deployment, the public URL shown to the user will point to the production domain instead of the preview URL.
- Fix approach: Document `NEXT_PUBLIC_SITE_URL` as a required env var; use Vercel's `VERCEL_URL` as a fallback for previews.

**Design system CSS utilities defined but not adopted in components:**
- Problem: `app/globals.css` defines `.page-header`, `.page-header-bar`, `.page-title`, `.page-subtitle`, `.card`, `.stat-card`, `.stat-card-faltantes`, `.stat-card-repetidas`, and `.stat-card-total` as `@layer components` utilities. All pages still inline equivalent Tailwind class strings directly rather than using these utility classes.
- Files: `app/globals.css`, `app/(app)/album/page.tsx`, `app/(app)/compare/page.tsx`, `app/(app)/mensajes/page.tsx`, `app/(app)/profile/page.tsx`
- Impact: DRY principle is violated; changing the design of a page header requires touching every page file instead of one CSS definition.
- Fix approach: Migrate page headers and stat cards to use `.page-header`, `.page-title`, `.stat-card` etc. The utility classes are already in Tailwind's content scan paths (`app/**/*.{ts,tsx}`) so no config change is needed.

---

## Fragile Areas

**`enforce_message_limit` DB trigger deletes messages silently after insert:**
- Files: `supabase/migrations/0009_message_limit.sql`
- Why fragile: The trigger fires `AFTER INSERT` and deletes messages beyond offset 10 for both sender and recipient. A notification burst (many users triggering `notifyMatchedUsers` simultaneously) inserts multiple messages into the same recipient's inbox; the trigger fires once per row and may race with concurrent inserts. The 10-message cap means older messages are silently pruned with no UI indication.
- Safe modification: Any change to the retention number requires a migration to `CREATE OR REPLACE FUNCTION`. The trigger itself cannot be altered without dropping and recreating it.
- Test coverage: None.

**`handle_new_user` DB trigger hard-codes country default to `'Honduras'`:**
- Files: `supabase/migrations/0005_helpers.sql` (line 32)
- Why fragile: New users who do not provide country during registration get `country = 'Honduras'` from `coalesce(new.raw_user_meta_data->>'country', 'Honduras')`. This default is undocumented. If the registration form changes, the trigger and the default must be updated together.
- Safe modification: Change only through a migration that updates the function; verify the registration flow after any change.

**`v_user_match_summary` view not materialized — full scan on every page load:**
- Files: `supabase/migrations/0003_views.sql`
- Why fragile: `v_user_match_summary` joins `v_direct_card_matches` (itself a three-table join) with `profiles`. With many users and cards this is a multi-table scan on every `ComparePage` load. N concurrent users trigger N such scans simultaneously.
- Safe modification: Convert to a materialized view refreshed on a schedule or after card upserts; requires a migration.
- Test coverage: None.

---

## Scaling Limits

**Message retention (10 messages) vs. notification volume:**
- Current capacity: 10 received + 10 sent messages per user, enforced by the `trg_message_limit` DB trigger.
- Limit: A user who receives many match notifications quickly loses earlier ones. A bulk paste that notifies 15 users will silently drop the oldest 5 messages from each recipient's inbox.
- Scaling path: Increase the limit via migration, or create a separate `notifications` table so system notifications do not compete with direct messages for the same 10-slot inbox.

**Supabase free tier: 500 MB database storage:**
- Current capacity: 48 teams x 20 cards = 960 catalog rows (seeded). User card rows are small (UUID + int). At 10,000 active users with 500 cards each, roughly 5 million rows would consume ~400–600 MB.
- Scaling path: Monitor DB size; upgrade to Supabase Pro (8 GB) when approaching 400 MB.

---

## Dependencies at Risk

**Next.js pinned to `14.2.15` (exact, not `^14`):**
- Risk: Security patches and bug fixes are released regularly for Next.js 14. The exact pin means `npm install` will never pull in patches automatically.
- Impact: Potential exposure to known Next.js vulnerabilities between manual upgrades.
- Migration plan: Run `npm install next@latest` to update within v14; review the changelog before upgrading to v15.

**`@supabase/ssr@^0.10.2` — pre-stable package:**
- Risk: `@supabase/ssr` v0.x is pre-stable; breaking API changes can occur in minor versions. The `createServerClient` / `createBrowserClient` pattern is stable now but may change on a major bump.
- Impact: A future `npm install` that bumps this package could break cookie-based session handling.
- Migration plan: Pin to the exact version (`0.10.2`) until Supabase releases a stable 1.x.

---

## Test Coverage Gaps

**`lib/utils.ts` — `parseQuickPaste` and `tokenizeSearch`:**
- What's not tested: All parsing edge cases — range format (`MEX: 1-20`), comma format (`BRA: 3,8,15`), single card with quantity (`ARG-05 x2`), invalid abbreviations, reversed ranges, quantity deduplication/summing.
- Files: `lib/utils.ts`
- Risk: A parsing regression silently corrupts bulk imports; users add wrong cards without error.
- Priority: High (pure functions, easy to unit test, high user impact).

**`lib/notifications.ts` — `notifyMatchedUsers`:**
- What's not tested: Fanout logic (no matches returns early, filters `notify_matches = true`, constructs correct message body, includes/excludes `wa.me` link based on `show_contact`).
- Files: `lib/notifications.ts`
- Risk: Notification messages sent to wrong users or with incorrect content; silent failures on DB error.
- Priority: High.

**`app/(app)/album/actions.ts` — server actions:**
- What's not tested: `upsertCard` validation (abbr check, number range, quantity check), `bulkUpsertFromText` add vs. update counting, `deleteCard`, `clearBox`.
- Files: `app/(app)/album/actions.ts`, `app/(app)/mensajes/actions.ts`
- Risk: Auth bypass or data corruption regressions go undetected.
- Priority: High.

**RLS policies — `0004_rls.sql` and `0008_messages.sql`:**
- What's not tested: No integration tests verify that a user cannot read another user's private data or insert rows with a spoofed `user_id`. This is a manual verification today.
- Files: `supabase/migrations/0004_rls.sql`, `supabase/migrations/0008_messages.sql`
- Risk: An RLS policy regression could expose private card lists or allow message spoofing.
- Priority: High (consider `pgTAP` tests or Supabase's local testing suite).

---

*Concerns audit: 2026-05-06*

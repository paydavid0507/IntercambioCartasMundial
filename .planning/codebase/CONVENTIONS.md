# Coding Conventions

**Analysis Date:** 2026-05-06

## Language & Compiler

**TypeScript strict mode** is enabled (`"strict": true` in `tsconfig.json`). All code must pass `npx tsc --noEmit` cleanly — this is the primary quality gate.

**No generated Supabase types.** The file `types/database.ts` is hand-written and manually kept in sync with `supabase/migrations/`. When new columns are added to the DB schema, update `types/database.ts` by hand and use `any` casts only where the generated types are not yet reflected. Do not run `supabase gen types typescript` without also updating the hand-written file.

**Path alias:** `@/*` maps to the project root. Always use `@/` imports, never relative `../../` imports across feature boundaries.

---

## TypeScript Patterns

### ServerActionResult type

Every server action that performs a mutation returns this shape:

```typescript
type ServerActionResult = { ok: true } | { ok: false; error: string };
```

Defined locally at the top of each `actions.ts` file (e.g., `app/(app)/album/actions.ts` line 15). Do not import it from a shared location — keep it co-located with the actions that use it.

Some actions extend the base shape with extra fields when the caller needs more detail:

```typescript
// Extended shape for bulk operations (app/(app)/album/actions.ts)
Promise<{ ok: boolean; added: number; updated: number; errors: { line: string; reason: string }[] }>
```

### Type assertions for Supabase join results

Supabase JS client loses type information on `.select()` with joined tables. Cast with `as unknown as Array<{...}>` and an explicit local type, never with bare `as any`:

```typescript
// app/(app)/search/SearchClient.tsx
const fromDups: CardOwnerResult[] = ((dups ?? []) as unknown as Array<{
  card_id: string;
  quantity_available: number;
  profiles: { display_name: string; ... } | null;
}>)
  .filter((r) => r.profiles)
  .map((r) => ({ ... }));
```

### Null-safe patterns

- Use `?? []` and `?? ""` defaults when Supabase returns `null | undefined`.
- Discriminated union narrowing: always check `result.ok` before accessing `result.error`.

---

## React Patterns

### useTransition for server action pending states

All client components that call server actions use `React.useTransition`:

```typescript
// components/CardForm.tsx
const [pending, startTransition] = React.useTransition();

function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  startTransition(async () => {
    const result = await upsertCard(kind, abbr, number, quantity);
    if (!result.ok) setError(result.error);
  });
}
```

Never use `useState` + manual `setLoading(true/false)` for server action pending states.

### useMemo for stable client instances

When a client-side Supabase client is created inside a component, wrap it in `useMemo`:

```typescript
// app/(app)/search/SearchClient.tsx
const supabase = React.useMemo(() => createClient(), []);
```

### Client component boundary

Mark client components with `"use client"` at the top of the file. Server components (pages, layouts) do NOT have this directive. Keep the client boundary as leaf-level as possible — prefer passing data down as props from server components.

### Namespace imports for React

Use `import * as React from "react"` (namespace import) rather than default import in client components. Hook calls are then `React.useState`, `React.useTransition`, etc.

### Controlled forms, not FormData

Forms use React-controlled state (`useState`) combined with `useTransition`. Do not use uncontrolled `FormData` / `action=` prop patterns.

---

## Server Actions

### File structure

Server actions live in `actions.ts` files co-located with the page that owns them:

- `app/(app)/album/actions.ts` — album CRUD
- `app/(app)/mensajes/actions.ts` — messaging

Always add `"use server"` directive at the top of the file.

### Mandatory auth check first

Every mutating action must validate the session as its first step:

```typescript
// Pattern used in every action
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { ok: false, error: "No autenticado" };
```

Never trust client-supplied `userId` parameters for ownership checks — always read from the authenticated session.

### Validate inputs before hitting the DB

Validate all parameters (type, range, format) before any Supabase call. Return `{ ok: false, error: "..." }` with a human-readable Spanish message.

### revalidatePath after every mutation

Every action that changes DB state must call `revalidatePath` before returning `{ ok: true }`:

```typescript
revalidatePath("/album");   // album actions
revalidatePath("/mensajes"); // messaging actions
```

### Return shape convention

Return `{ ok: true }` on success, `{ ok: false, error: string }` on failure. Never throw from a server action — always return the error in the result shape.

---

## Import Organization

**Order:**
1. React (`import * as React from "react"`)
2. Next.js (`next/cache`, `next/navigation`, `next/link`, etc.)
3. External libraries (`lucide-react`, `clsx`, etc.)
4. Internal `@/lib/*`
5. Internal `@/components/*`
6. Internal `@/app/*` (actions, types)
7. Local types / constants

No blank lines between groups is acceptable; consistency within a file matters more than strict grouping.

---

## Naming Patterns

**Files:** kebab-case for pages and layouts (`page.tsx`, `layout.tsx`). PascalCase for component files (`CardForm.tsx`, `ExchangeActions.tsx`). camelCase for utility/lib files (`utils.ts`, `teams.ts`).

**Components:** PascalCase named exports, never default exports for components.
```typescript
export function CardForm({ kind }: { kind: CardKind }) { ... }
export const Button = React.forwardRef<...>(...);
```

**Functions:** camelCase verbs — `upsertCard`, `deleteCard`, `sendMessage`, `markAsRead`.

**Types:** PascalCase — `CardKind`, `ServerActionResult`, `ParsedCardEntry`.

**Constants:** SCREAMING_SNAKE_CASE for domain constants (`CARD_NUMBER_MAX`, `TEAM_ABBREVIATIONS`).

---

## Tailwind CSS

### Semantic tokens only — never raw color names

Use the semantic token names defined in `tailwind.config.ts`. Never use raw Tailwind color scales like `bg-amber-500` or `bg-sky-600` directly in components.

| Semantic token | Use case |
|---|---|
| `brand-600` | Primary buttons, links, focus rings |
| `brand-700` | Hover state of primary buttons |
| `accent-400` | Active nav indicator, amber accent bars |
| `accent-500` | Unread badges, notification dots |
| `slate-950` | Navbar and BottomNav background |
| `slate-200` | Card borders, dividers |
| `slate-300` | Input borders |
| `slate-500` | Secondary text, labels |

Exception: match-type colors (`green-*`, `sky-*`) are allowed in the Intercambios section because they represent semantic match states, not design tokens.

### Mobile-first with `sm:` as the only breakpoint

All layout decisions use mobile-first defaults. The `sm:` (640px) breakpoint is the transition point between mobile and desktop layouts. The `md:`, `lg:`, `xl:` breakpoints are not used.

### Responsive text visibility

Hide desktop-only text on mobile with `hidden sm:inline`:

```tsx
<Button size="sm">
  <Icon className="h-3.5 w-3.5 sm:mr-1" />
  <span className="hidden sm:inline">Texto</span>
</Button>
```

### sm:contents grid layout trick

Use `sm:contents` to escape a wrapper div and participate in a parent grid on desktop while stacking vertically on mobile:

```tsx
// components/CardForm.tsx
<div className="grid grid-cols-2 gap-3 sm:contents">
  <div>...</div>
  <div>...</div>
</div>
```

### cn() utility for conditional classes

Always use the `cn()` utility from `lib/utils.ts` (wraps `clsx` + `tailwind-merge`) when combining conditional class strings:

```typescript
import { cn } from "@/lib/utils";
cn("base-classes", condition && "conditional-class", className)
```

---

## Design System Rules

**THEME.md is the reference.** `tailwind.config.ts` is the token source. `app/globals.css` holds CSS variables and custom animations. These three files together form the design system — never override with inline styles.

### Mandatory section header pattern

Every page section header must use this exact structure:

```tsx
<header className="flex items-start gap-3">
  <span className="mt-2 h-7 w-[3px] flex-shrink-0 rounded-full bg-accent-400" />
  <div>
    <h1 className="font-display text-4xl tracking-wide text-slate-900">TÍTULO</h1>
    <p className="text-sm text-slate-500">Descripción.</p>
  </div>
</header>
```

### Fonts

- `font-display` (Bebas Neue): section titles, large numbers, nav logo only
- `font-sans` (Plus Jakarta Sans): all body copy, labels, buttons, form text

Never introduce other font families.

### Card structure

```tsx
<div className="rounded-lg border border-slate-200 bg-white shadow-sm">
```

Cards must always have a border and shadow — they sit on the dot-grid background and need visual separation.

### Page layout

```tsx
<div className="max-w-5xl mx-auto px-4 py-6 pb-20 sm:pb-6 space-y-6">
```

The `pb-20` bottom padding on mobile leaves room for the fixed BottomNav (`h-16` approximately). On desktop (`sm:pb-6`) normal padding applies.

### Mobile action button patterns

**Toolbar buttons** (1-2 actions): icon-only on mobile with hidden text:
```tsx
<Button size="sm">
  <Icon className="h-3.5 w-3.5 sm:mr-1" />
  <span className="hidden sm:inline">Label</span>
</Button>
```

**Action groups** (3+ actions, e.g., ExchangeActions): circle + caption layout on mobile, inline button on desktop. See `app/(app)/compare/ExchangeActions.tsx` for the canonical implementation.

```tsx
// Mobile: h-11 w-11 circle + text-[10px] caption below
// Desktop: sm:inline-flex sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-md
```

### Anti-patterns (never do these)

- Raw color values without semantic meaning (`bg-amber-500` → use `bg-accent-500`)
- Cards without `border` + `shadow-sm`
- Solid body background (dot-grid is always present)
- Navbar background other than `bg-slate-950`
- Toolbar buttons with full text on mobile
- Purple, pink, or gradient colors in main UI
- Bebas Neue for body copy
- Section headers without the amber vertical bar

---

## ESLint

Only `next/core-web-vitals` is configured (`.eslintrc.json`). The `@typescript-eslint` plugin is **not** installed. Do not add `// eslint-disable-next-line @typescript-eslint/*` comments — they have no effect and indicate a misunderstanding of the installed rules.

Run lint with `npm run lint` (calls `next lint`). The build (`npm run build`) also runs lint and will fail on ESLint errors.

---

## Git Conventions

Feature commits follow this footer convention:

```
feat: description of what was done

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Commit messages use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`.

---

## Utilities

### cn() — class merging
`lib/utils.ts`: `cn(...inputs: ClassValue[])` — wraps `clsx` + `tailwind-merge`. Use for all conditional class construction.

### mapAuthError() — Spanish error messages
`lib/utils.ts`: Maps raw Supabase auth error strings to user-friendly Spanish messages. Always pass Supabase auth errors through this before displaying to users.

### slugify()
`lib/utils.ts`: Normalizes Unicode, lowercases, replaces non-alphanumeric with `-`. Used for `share_slug` generation.

### parseQuickPaste()
`lib/utils.ts`: Parses multi-line text input in batch format (`MEX: 1,2,3` or range `MEX: 1-20`) or single-card format (`MEX-05 x2`). Returns `{ entries, errors }`.

### tokenizeSearch()
`lib/utils.ts`: Parses a free-text search query into structured filters (`abbr`, `number`, `cardCode`, `freeText`).

---

*Convention analysis: 2026-05-06*

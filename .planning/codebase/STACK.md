# Technology Stack

**Analysis Date:** 2026-05-06

## Languages

**Primary:**
- TypeScript 5.6 — all application code (`app/**`, `components/**`, `lib/**`, `types/**`)

**Configuration:**
- JavaScript (ESM) — `next.config.mjs`, `postcss.config.mjs`
- SQL — Supabase migrations (`supabase/migrations/*.sql`)

## Runtime

**Environment:**
- Node.js (version not pinned — no `.nvmrc` or `.node-version` present)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.15 (App Router) — full-stack React framework; Server Components, Server Actions, middleware

**Rendering:**
- React 18.3.1 — UI library
- React DOM 18.3.1 — DOM renderer

**Styling:**
- Tailwind CSS 3.4.13 — utility-first CSS; config at `tailwind.config.ts`
- PostCSS 8.4.47 — CSS processing; config at `postcss.config.mjs`
- autoprefixer 10.4.20 — vendor prefix injection

**No testing framework detected.** No `jest`, `vitest`, `playwright`, or `cypress` packages present.

## TypeScript Configuration

Config file: `tsconfig.json`

Key settings:
- `strict: true` — full strict mode enabled
- `target: "ES2017"`
- `moduleResolution: "bundler"` — Next.js bundler resolution
- `paths: { "@/*": ["./*"] }` — root alias; import anything as `@/...`
- `noEmit: true` — type checking only, Next.js handles compilation
- `incremental: true` — cached builds via `tsconfig.tsbuildinfo`

## Fonts

Loaded via `next/font/google` in `app/layout.tsx`:

| Font | CSS Variable | Tailwind Class | Use |
|------|-------------|----------------|-----|
| Bebas Neue (weight 400) | `--font-display` | `font-display` | Headers, section titles, numbers |
| Plus Jakarta Sans | `--font-sans` | `font-sans` | All body text |

Both fonts use `display: swap` and subset `latin`.

## Build Tooling

**Next.js config** (`next.config.mjs`):
- `reactStrictMode: true`
- `experimental.serverActions.bodySizeLimit: "2mb"`
- Global security headers applied to all routes:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `X-DNS-Prefetch-Control: on`

**Build scripts** (`package.json`):
```bash
npm run dev          # next dev — local development server
npm run build        # next build — production build
npm run start        # next start — production server
npm run lint         # next lint — ESLint
npm run type-check   # tsc --noEmit — type checking without emit
```

## Linting

**Tool:** ESLint 8.57.1
**Config:** `.eslintrc.json` — extends `next/core-web-vitals`
**Invocation:** `next lint` (wraps ESLint with Next.js defaults)

No Prettier config detected. Formatting is not enforced by tooling.

## Key Dependencies

**Production:**

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.15 | Full-stack framework (App Router) |
| `react` / `react-dom` | ^18.3.1 | UI layer |
| `@supabase/supabase-js` | ^2.105.3 | Supabase JS client (auth, database, real-time) |
| `@supabase/ssr` | ^0.10.2 | Cookie-based session handling for SSR |
| `clsx` | ^2.1.1 | Conditional class name composition |
| `tailwind-merge` | ^2.5.4 | Merge Tailwind classes without conflicts |
| `lucide-react` | ^1.14.0 | Icon library (SVG icons as React components) |

**Development:**

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.6.2 | Type system |
| `tailwindcss` | ^3.4.13 | CSS framework |
| `postcss` | ^8.4.47 | CSS processing |
| `autoprefixer` | ^10.4.20 | CSS vendor prefixes |
| `eslint` | ^8.57.1 | Linting |
| `eslint-config-next` | 14.2.15 | Next.js ESLint ruleset |
| `@types/node` | ^20.16.10 | Node.js type definitions |
| `@types/react` | ^18.3.11 | React type definitions |
| `@types/react-dom` | ^18.3.0 | React DOM type definitions |

## Tailwind Design Tokens

Defined in `tailwind.config.ts` as the single source of truth:

**Colors:**
- `brand.*` — sky blue scale (50–900); `brand-600` is the default for buttons and links
- `accent.*` — amber scale (50–900); `accent-400` for active nav, `accent-500` for badges
- `mutual.*` — semantic green (bg/text/border) for mutual trade matches
- `direct.*` — semantic sky (bg/text/border) for direct trade matches

**Typography:** `font-display` (Bebas Neue), `font-sans` (Plus Jakarta Sans)

**Shadows:** `shadow-card`, `shadow-card-md` for white content cards

**Border radius:** `rounded-card` (8px) for cards

Content scan paths: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./lib/**/*.{ts,tsx}`

## Platform Requirements

**Development:**
- Node.js with npm
- Supabase project (URL + anon key via env vars)

**Production:**
- Vercel (inferred from Next.js 14 + Supabase SSR pattern; no `vercel.json` present)
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

*Stack analysis: 2026-05-06*

# Phase 00 — UI Review

**Audited:** 2026-05-05
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md present)
**Screenshots:** Captured — landing (desktop + mobile), login (desktop + mobile), register (desktop)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Copy is clear and in context, but three loading micro-states use truncated "..." instead of descriptive text, and the CardForm label "Selección" misdescribes a team selector |
| 2. Visuals | 3/4 | Strong hierarchy on landing; landing feature cards lack icons, login/register pages have no back-to-home link, mobile header wraps to two lines on small phones |
| 3. Color | 4/4 | Brand sky-blue is used purposefully — CTAs, active nav, unread badges, focus rings; no hardcoded hex values; green reserved for WhatsApp/success only |
| 4. Typography | 3/4 | Eight distinct size tokens in use (xs through 5xl) — slightly above the ideal four, but each level has a clear role; four weight variants are within standard range |
| 5. Spacing | 3/4 | Scale is consistent (multiples of 4px/0.5rem Tailwind steps); no arbitrary px/rem values in layout; only badge micro-sizing uses `[10px]`/`[8px]` which is acceptable for icon badges |
| 6. Experience Design | 3/4 | Loading states, disabled buttons, empty states, and success/error messages are well covered; native `confirm()` dialogs for destructive actions break the visual language; no skeleton loaders for the album/compare async data fetch |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **Native `confirm()` dialogs for card deletion** — Breaks the styled UI with a browser-native popup that cannot be themed or localized, looks inconsistent on Android Chrome, and has no "undo" path. Replace `confirm()` in `components/CardList.tsx:94` and `CardList.tsx:330` with an inline confirmation pattern already implemented in `InboxClient.tsx` (the `confirmClear` state pattern), applied at the chip and bulk-delete level.

2. **Login and Register pages have no visible back navigation** — Users who land on `/login` or `/register` from a direct link or after an error have no affordance to return to the landing page. The page viewport is otherwise mostly empty space. Add a `← Intercambia Mundial 2026` link above each form card (same pattern already used in `/u/[slug]/page.tsx:87`), and consider adding a "Mostrar/ocultar contraseña" toggle on both password inputs.

3. **Landing feature cards (`FeatureCard`) are text-only and visually flat** — Three cards sit below the hero with identical weight and no distinguishing icon, color accent, or numbering. On the screenshot they read as a gray wall of text. Adding a single icon per card (e.g., `BookOpen`, `ArrowLeftRight`, `Sparkles`) and a small colored indicator would create scanning affordance for first-time visitors on mobile.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Strengths:**
- All visible CTAs are descriptive and in Spanish: "Empezar gratis", "Iniciar sesión", "Ya tengo cuenta", "Guardar cambios", "Importar", "Vaciar".
- Error messages are user-facing and clear: "Correo o contraseña incorrectos" (`app/login/page.tsx:21`), "La contraseña debe tener al menos 6 caracteres" (`app/register/page.tsx:27`).
- Empty states are contextual: "Aún no has agregado cartas en esta sección" (`components/CardList.tsx:106`), "Aún no hay coincidencias. Agrega más cartas faltantes y repetidas para empezar a ver intercambios" (`app/(app)/compare/page.tsx:172`).
- Success feedback is explicit: "X agregadas, Y actualizadas" (`components/QuickPaste.tsx:57`), "Perfil actualizado" (`app/(app)/profile/page.tsx:71`).

**Issues:**
- `components/CardList.tsx:358` — The save button in the inline EditPanel shows `"..."` while pending. Change to `"Guardando..."` to match the established pattern in `CardForm.tsx:82`.
- `components/CardForm.tsx:40` — Label reads `"Selección"` but the field is a team abbreviation selector (`TEAM_ABBREVIATIONS`). A more accurate label is `"Selección / Equipo"` or just `"Equipo"`.
- `app/(app)/mensajes/InboxClient.tsx:164` — The clear-inbox confirmation uses `"Sí"` / `"No"` as button labels. These are minimal; `"Vaciar"` / `"Cancelar"` would be more legible and consistent with other destructive patterns in the app.
- No `<title>` changes on inner app pages beyond the root layout metadata — the browser tab always shows "Intercambia Mundial 2026" regardless of active page. Adding per-page `export const metadata` would improve orientation, especially for WhatsApp link previews.

---

### Pillar 2: Visuals (3/4)

**Strengths:**
- Desktop landing has a clear focal point: large bold headline, prominent primary CTA, secondary CTA in ghost style. Visual weight hierarchy is correct.
- The BottomNav active-item indicator (brand-colored underline pill + colored icon) is clear and unambiguous.
- Match-type badges (Mutua/Directa/Solo tú das) use distinct color tokens (green/brand/slate) to aid scanning in the Intercambios list.
- Card chips in the album view are compact and use amber highlight for edit mode — good contextual differentiation.

**Issues:**
- **Mobile header wraps** — At 375px the brand name "Intercambia Mundial 2026" + "Iniciar sesión" + "Crear cuenta" overflows to two lines (visible in screenshot). The landing `<header>` nav stack-wraps. Consider abbreviating the nav to icons only on mobile, or using `text-sm` for the brand name at small breakpoints.
- **Feature cards on landing have no icons** — `app/page.tsx:86–99` — Three cards with title + description but no visual anchor. At mobile widths (stacked single column) they appear as an undifferentiated list. Each card title maps naturally to a lucide icon already imported elsewhere in the project.
- **Login and register have empty space above the card** — The form floats at vertical center of a mostly-white viewport with nothing above it. No back link, no logo. Users who deep-link directly feel disoriented. The vertical centering (`flex flex-1 items-center justify-center`) leaves ~40% blank space above on desktop.
- **No active link indicator on desktop Navbar** — `components/Navbar.tsx:31–43` — Links are plain text with hover only. The current route is not highlighted; the BottomNav correctly tracks `pathname` but the desktop nav does not, creating an inconsistency between breakpoints.

---

### Pillar 3: Color (4/4)

**Strengths:**
- Brand palette is a single sky-blue scale (`brand-50` through `brand-900`) defined in `tailwind.config.ts:12–23`. No hardcoded hex or `rgb()` values found anywhere in the codebase.
- 32 brand-color token usages across all components; every instance is semantically justified:
  - `bg-brand-600` / `hover:bg-brand-700` — primary action buttons
  - `text-brand-600` / `text-brand-700` — inline links and active nav
  - `bg-brand-50` / `border-brand-400` — selected card chip background
  - `bg-brand-600` — unread message badge
  - `focus-visible:ring-brand-500` — form focus rings
- Green is correctly reserved for WhatsApp CTA (`bg-green-600` on public profile) and success messages (`bg-green-50` / `text-green-700`). This avoids green-as-brand ambiguity.
- Semantic color split is clean: slate family for chrome/text, brand for interaction, red for danger, green for success/WhatsApp, amber for edit-mode highlight.

**No issues found.** This is the strongest pillar in the codebase.

---

### Pillar 4: Typography (3/4)

**Size scale in use:**

| Token | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Labels, helper text, badge counts, timestamps |
| `text-sm` | 14px | Body text, list items, form inputs |
| `text-base` | 16px | Button (lg size), brand name in header |
| `text-lg` | 18px | Card titles (`CardTitle` component) |
| `text-xl` | 20px | Auth form page headings (h1 on login/register) |
| `text-2xl` | 24px | App page headings (Mi álbum, Intercambios, etc.) |
| `text-4xl` | 36px | Landing hero h1 |
| `text-5xl` | 48px | Landing hero h1 at `sm:` breakpoint |

**Weight scale in use:** `font-normal`, `font-medium`, `font-semibold`, `font-bold` — 4 values, all purposefully differentiated.

**Issues:**
- Eight distinct size tokens is two more than the ideal four-step scale. `text-lg` is used only in the `CardTitle` component (`components/ui/Card.tsx:37`). `text-xl` is used only in auth headings. Consolidating auth headings to `text-2xl` (matching app headings) and promoting `CardTitle` to `text-xl` would reduce the scale to 6 tokens without visual regression.
- `text-[10px]` and `text-[8px]` appear in badge micro-text (BottomNav, Navbar, InboxClient). These are justified exceptions for notification badges where `text-xs` (12px) would overflow the badge circle. No action needed, but they are outside the declared scale.
- No responsive type scaling outside the landing hero. App-area `h1` tags are fixed at `text-2xl` on all breakpoints. On desktop the page headings could step up to `text-3xl` for better visual presence in the `max-w-5xl` container.

---

### Pillar 5: Spacing (3/4)

**Spacing class frequency (top occurrences):**
- `px-3` (26×), `p-3` (22×), `py-2` (17×), `p-2` (17×) — forming the primary density unit at 12px/8px
- `px-4` (11×), `p-5` (6×), `p-4` (4×) — secondary density for card/section containers
- `py-12` (4×) — used for auth page vertical padding
- `p-6` (9×) — card sections and album summary items

**Strengths:**
- All spacing values are standard Tailwind scale steps (multiples of 4px). No `[*px]` or `[*rem]` in layout classes.
- Consistent `space-y-4` / `space-y-6` rhythm within page sections.
- Bottom padding on the app main (`pb-20 sm:pb-6`) correctly clears the fixed BottomNav on mobile.

**Issues:**
- **Density inconsistency across card containers:** Album summary items use `p-4`, Card component uses `p-5`, auth forms use `p-6`, and compare page uses `p-3` for inner exchange columns. For a single-product app, standardizing card inner padding to one value (`p-4` or `p-5`) would improve visual consistency.
- **CardHeader space override:** `app/(app)/compare/page.tsx:182` passes `className="flex flex-row items-start justify-between gap-3"` which overrides the CardHeader's default `flex-col space-y-1.5`. The result is correct but requires the caller to know the internal layout of the primitive. Consider adding a `horizontal` prop variant to `CardHeader`.
- The `gap-3` used between CTA buttons on the landing (`app/page.tsx:48`) is slightly tight at 12px for `size="lg"` buttons — `gap-4` would give more breathing room.

---

### Pillar 6: Experience Design (3/4)

**Coverage matrix:**

| State | Covered | Notes |
|-------|---------|-------|
| Loading — button actions | Yes | All async buttons show Spanish text ("Guardando...", "Enviando...", "Importando...", "Eliminando...") and disable during transition |
| Loading — search | Yes | `SearchClient.tsx:190–191` shows "Buscando..." inline |
| Empty — album | Yes | Dashed-border card with contextual prompt |
| Empty — intercambios | Yes | Dashed-border card with next-step guidance |
| Empty — mensajes | Yes | Centered gray text |
| Error — forms | Yes | Red `bg-red-50` banner with message |
| Error — inline actions | Yes | Inline `text-red-600` beside affected button |
| Success — mutations | Yes | Green banner for profile update, QuickPaste import result |
| Destructive confirmation | Partial | InboxClient uses styled inline confirm; CardList uses native `confirm()` |
| Skeleton/loading for page data | No | Album, Compare, and Mensajes pages fetch server-side; no loading placeholder if network is slow |
| Active nav state (desktop) | No | BottomNav shows active state; desktop Navbar does not |
| Password visibility toggle | No | Both password fields have no show/hide toggle |
| Toast/notification system | No | Successes are shown via URL params which vanish on hard refresh; no persistent notification layer |

**Key issues:**

- **Native `confirm()` for card deletion** (`components/CardList.tsx:94`, `CardList.tsx:330`): The browser-native dialog blocks the UI thread, cannot be styled, and renders differently across Android/iOS. Replace with the inline confirmation already used in `InboxClient.tsx:155–184`.

- **No active link on desktop Navbar** (`components/Navbar.tsx:31–43`): The `usePathname()` hook is available on the client but the Navbar is a server component. Either convert it to `"use client"` (small cost) or add a `currentPath` prop passed from the layout (which already runs server-side). This creates a confusing state where mobile users see an active indicator but desktop users do not.

- **No skeleton loaders for asynchronous page data**: The album, compare, and mensajes pages are server-rendered and stream their data. If the Supabase query is slow, the user sees a blank white page region. Adding `loading.tsx` files for the `(app)` routes with skeleton placeholders would prevent layout shift and communicate progress.

- **Password fields have no visibility toggle**: Both `app/login/page.tsx:69–75` and `app/register/page.tsx:127–131` render `type="password"` inputs with no show/hide affordance. On mobile this is a common friction point, especially for new users setting a password.

---

## Registry Safety

No `components.json` found — shadcn not initialized. Registry audit skipped.

---

## Files Audited

- `app/page.tsx` — Landing page
- `app/layout.tsx` — Root layout
- `app/(app)/layout.tsx` — Authenticated app layout
- `app/login/page.tsx` — Login form
- `app/register/page.tsx` — Registration form
- `app/(app)/album/page.tsx` — Album page (tabs: Faltantes/Repetidas)
- `app/(app)/compare/page.tsx` — Intercambios / match page
- `app/(app)/mensajes/InboxClient.tsx` — Inbox client component
- `app/(app)/search/SearchClient.tsx` — Search client component
- `app/(app)/profile/page.tsx` — Profile edit page
- `app/u/[slug]/page.tsx` — Public profile page
- `components/Navbar.tsx` — Desktop top navigation
- `components/BottomNav.tsx` — Mobile bottom navigation
- `components/CardList.tsx` — Card list with bulk select and inline edit
- `components/CardForm.tsx` — Single card add form
- `components/QuickPaste.tsx` — Bulk import textarea form
- `components/ui/Button.tsx` — Button primitive
- `components/ui/Card.tsx` — Card primitive
- `tailwind.config.ts` — Design token definitions
- `app/globals.css` — Global styles and base layer

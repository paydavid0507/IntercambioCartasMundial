# Intercambia Mundial 2026

Aplicación web para administrar las cartas faltantes y repetidas del álbum
Panini Mundial 2026 y encontrar usuarios con quien intercambiar.

Construida con **Next.js 14 (App Router)**, **Supabase** (Auth + Postgres con
Row Level Security) y **TailwindCSS**.

## Funciones implementadas

- Registro, inicio de sesión y recuperación de contraseña con Supabase Auth.
- Perfil editable con ciudad, país, WhatsApp opcional y slug público.
- Pantalla **Mi álbum** con pestañas de faltantes y repetidas, formulario,
  edición/eliminación, y entrada rápida tipo `MEX-01 x2` (sección 14 del spec).
- Pantalla **Intercambios** con coincidencias mutuas primero, luego directas,
  ordenadas por la cantidad total de cartas que se pueden mover.
- Pantalla **Buscar** con búsqueda por carta (`MEX-05`), abreviación, nombre,
  ciudad, país o slug. Debounce de 350 ms.
- Perfil público en `/u/{slug}` con resumen de cartas y botón opcional de
  WhatsApp.
- Base de datos normalizada con índices, vistas SQL para coincidencias y
  políticas de Row Level Security (sección 7-11 del spec).

## Setup

1. **Crear proyecto en Supabase**
   1. https://supabase.com/dashboard → New project.
   2. Una vez creado, abre **Project Settings → API** y copia
      `Project URL` y `anon public key`.

2. **Aplicar migraciones**
   - En el dashboard, abre **SQL Editor** y ejecuta los archivos en este
     orden:
     1. `supabase/migrations/0001_init.sql`
     2. `supabase/migrations/0002_seed.sql`
     3. `supabase/migrations/0003_views.sql`
     4. `supabase/migrations/0004_rls.sql`
     5. `supabase/migrations/0005_helpers.sql`
   - O usa el CLI: `supabase db reset`.

3. **Variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Edita `.env.local` y rellena con los valores de tu proyecto Supabase y la
   URL pública del sitio.

4. **Instalar y correr en desarrollo**
   ```bash
   npm install
   npm run dev
   ```
   Abre http://localhost:3000.

5. **(Opcional) Auth por correo**
   - En Supabase, **Authentication → URL Configuration** asegúrate de incluir
     `http://localhost:3000/auth/callback` en *Redirect URLs*.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint con reglas de Next |
| `npm run type-check` | Chequeo estricto de TypeScript |

## Estructura

```
app/
  (app)/                Rutas autenticadas (con navbar)
    album/              Faltantes y repetidas
    compare/            Coincidencias de intercambio
    profile/            Editar perfil
    search/             Buscador
  auth/                 Callback de OAuth y sign-out
  login/  register/  recover/
  u/[slug]/             Perfil público
components/
  ui/                   Primitivos Tailwind (Button, Input, Tabs, ...)
  CardForm  CardList  QuickPaste  Navbar
lib/
  supabase/             Clientes (browser, server, middleware)
  teams.ts              Lista oficial de abreviaciones
  utils.ts              cn, slugify, parseQuickPaste, tokenizeSearch
types/
  database.ts           Tipos hechos a mano de la BD
supabase/
  migrations/           SQL en orden de ejecución
middleware.ts           Refresca sesión Supabase
```

## Despliegue sugerido

- **Frontend**: Vercel, Netlify o Cloudflare Pages. El proyecto es 100%
  Next.js estándar; basta con apuntar al repo y configurar las tres variables
  de entorno.
- **Base de datos**: Supabase (incluye autenticación y la API REST/PostgREST
  que usa este frontend a través de `@supabase/ssr`).

## Notas legales

La app no usa imágenes ni logos oficiales de Panini ni FIFA. Solo registra
códigos de cartas y datos ingresados por el usuario.

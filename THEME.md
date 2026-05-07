# Intercambia Mundial 2026 — Design System

> Referencia única para todos los desarrollos. Seguir estas reglas evita
> conflictos visuales y mantiene la coherencia en toda la app.

---

## 1. Filosofía

- **Dark shell, light content.** Navbar y BottomNav en `slate-950`, todo el contenido en blanco/slate-50.
- **Amber como acento.** El color amber (`accent`) marca actividad, notificaciones y orientación visual. No se usa para acciones primarias — esas son `brand` (sky blue).
- **Dot-grid siempre.** El fondo punteado es parte del brand. No reemplazar con color sólido.
- **Mobile-first.** Los botones de toolbar son icon-only en móvil. Los CTAs primarios conservan texto.
- **Bebas Neue para display, Plus Jakarta Sans para todo lo demás.** No introducir otras fuentes.

---

## 2. Colores

### Usar tokens semánticos, nunca colores directos

| Token Tailwind | CSS Variable | Uso |
|---|---|---|
| `brand-600` | `--color-brand` | Botones primarios, links, focus rings |
| `brand-700` | `--color-brand-hover` | Hover de botones primarios |
| `brand-100` | `--color-brand-soft` | Fondos teñidos de brand |
| `accent-400` | `--color-accent-soft` | Nav activo, barras de acento en headers |
| `accent-500` | `--color-accent` | Badges de no leídos, highlights |
| `accent-100` | `--color-accent-muted` | Fondos teñidos de acento |
| `slate-50` | `--color-surface-raised` | Fondo de página |
| `white` | `--color-surface` | Cards, formularios |
| `slate-100` | `--color-surface-subtle` | Hover en filas, secciones |
| `slate-200` | `--color-border` | Bordes de cards y divisores |
| `slate-300` | `--color-border-input` | Bordes de inputs |
| `slate-900` | `--color-text-primary` | Texto principal |
| `slate-500` | `--color-text-secondary` | Texto secundario, subtítulos |
| `slate-400` | `--color-text-muted` | Placeholders, labels débiles |
| `slate-950` | `--color-nav-bg` | Navbar, BottomNav |
| `slate-800` | `--color-nav-border` | Bordes del nav |
| `red-600` | `--color-danger` | Acciones destructivas |
| `green-600` | `--color-success` | Estados de éxito |

### Colores de estado de match (solo en Intercambios)

| Tipo | Background | Texto | Borde |
|---|---|---|---|
| Mutua | `green-100` / `--color-mutual-bg` | `green-800` | `green-300` |
| Directa | `sky-100` / `--color-direct-bg` | `sky-800` | `sky-200` |
| Solo tú das | `slate-100` | `slate-600` | — |

---

## 3. Tipografía

```
font-display → Bebas Neue     → Headers de página, números grandes
font-sans    → Plus Jakarta Sans → Todo lo demás
```

### Escala de texto en uso

| Clase | Uso |
|---|---|
| `font-display text-4xl tracking-wide` | Títulos de sección (MI ÁLBUM, INTERCAMBIOS...) |
| `text-sm font-semibold uppercase tracking-widest` | Labels de stats, etiquetas de sección |
| `text-sm` / `text-base` | Texto de body general |
| `text-xs` | Captions, timestamps, contadores |
| `text-[10px]` | Captions de botones en móvil (icono + caption) |
| `font-mono text-sm` | Códigos de carta (ARG-05, MEX-12) |

---

## 4. Layout y Espaciado

```
max-w-5xl mx-auto px-4   → Contenedor de página
py-6 pb-20 sm:pb-6       → Padding vertical (pb-20 deja espacio al BottomNav en móvil)
space-y-6                → Separación entre secciones de página
space-y-4                → Separación entre elementos dentro de sección
gap-3                    → Gaps en grids de formulario
```

### Breakpoints relevantes

| Breakpoint | Uso |
|---|---|
| `sm` (640px) | Transición de layout mobile → desktop. Botones con texto. |
| — | Por ahora no se usa `md`, `lg` explícitamente. |

---

## 5. Componentes

### Cards

```tsx
// Card estándar
<div className="rounded-lg border border-slate-200 bg-white shadow-sm">

// Card con borde izquierdo por tipo (Intercambios)
<Card className="border-l-[3px] border-l-green-400">   // Mutua
<Card className="border-l-[3px] border-l-sky-400">     // Directa

// Stat card con borde superior (Álbum)
<div className="rounded-xl border border-slate-200 bg-white border-t-[3px] border-t-amber-400">
```

### Header de sección

```tsx
<header className="flex items-start gap-3">
  <span className="mt-2 h-7 w-[3px] flex-shrink-0 rounded-full bg-accent-400" />
  <div>
    <h1 className="font-display text-4xl tracking-wide text-slate-900">TÍTULO</h1>
    <p className="text-sm text-slate-500">Descripción breve.</p>
  </div>
</header>
```

### Botones

```tsx
// Componente Button — variantes disponibles:
<Button variant="primary">   // brand-600, para CTAs principales
<Button variant="secondary"> // slate-100, para acciones secundarias
<Button variant="ghost">     // transparente, para acciones terciarias
<Button variant="danger">    // red-600, para acciones destructivas

// Tamaños:
<Button size="sm">  // h-9  — toolbars, acciones inline
<Button size="md">  // h-10 — default
<Button size="lg">  // h-11 — CTAs prominentes

// Patrón icon-only en móvil (para toolbar buttons):
<Button size="sm">
  <Icon className="h-3.5 w-3.5 sm:mr-1" />
  <span className="hidden sm:inline">Texto</span>
</Button>
```

### Botones de acción en grupo (ExchangeActions pattern)

```tsx
// Mobile: círculo h-11 w-11 + caption text-[10px]
// Desktop: botón inline con texto
<div className="flex items-start gap-5 sm:flex-wrap sm:items-center sm:gap-2">
  <button className="flex flex-col items-center gap-1 sm:inline-flex sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-md sm:bg-slate-100 sm:px-3 sm:py-2.5 sm:text-sm sm:font-medium">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 sm:hidden">
      <Icon className="h-5 w-5 text-slate-600" />
    </span>
    <Icon className="hidden h-4 w-4 sm:block" />
    <span className="text-[10px] font-medium text-slate-500 sm:text-sm sm:text-slate-700">
      Etiqueta
    </span>
  </button>
</div>
```

### Inputs / Selects

```tsx
// Mismo tratamiento visual: h-10, border-slate-300, ring brand-500
<Input />   // components/ui/Input.tsx
<Select />  // components/ui/Select.tsx
<Label />   // text-sm font-medium text-slate-700
```

### Badges de match

```tsx
// Mutua
<span className="rounded-full bg-green-100 text-green-800 ring-1 ring-green-300 shadow-sm shadow-green-100 px-2.5 py-1 text-xs font-semibold">
  ⇄ Mutua
</span>

// Directa
<span className="rounded-full bg-sky-100 text-sky-800 ring-1 ring-sky-200 px-2.5 py-1 text-xs font-semibold">
  → Directa
</span>
```

---

## 6. Navegación

### Navbar (desktop)
- Fondo: `bg-slate-950`, borde inferior: `border-b border-slate-800`
- Línea decorativa inferior: gradiente amber de izquierda a derecha
- Link activo: `text-accent-400` (amber-400)
- Link hover: `hover:bg-slate-800/60 hover:text-white`

### BottomNav (mobile, sm:hidden)
- Fondo: `bg-slate-950`, borde superior: `border-t border-slate-800`
- Ícono activo: `text-accent-400`
- Indicador de activo: línea horizontal amber de 2px en la parte superior del item
- Badge de no leídos: `bg-accent-500` con `animate-ping` ring amber
- El ícono de mensajes cambia a `text-accent-400` cuando hay no leídos

---

## 7. Animaciones

| Clase | Keyframe | Uso |
|---|---|---|
| `animate-fade-up` | fadeUp 0.5s | Entrada de contenido en página |
| `delay-100` … `delay-400` | animation-delay | Stagger en listas de entrada |
| `animate-pulse-dot` | pulse-dot 1.6s | Punto de no leídos en mensajes |
| `animate-spin-slow` | spin-slow 0.9s | Spinner de carga |
| `animate-ping` | Tailwind built-in | Ring de notificación en ícono de mensajes |

**Regla:** una animación de entrada bien orquestada (fadeUp con stagger) vale más que micro-interacciones dispersas.

---

## 8. Fondo de página

```css
/* No tocar — es parte del brand */
background-image: radial-gradient(circle, rgba(148, 163, 184, 0.22) 1px, transparent 1px);
background-size: 22px 22px;
```

---

## 9. Reglas mobile

1. **Botones de toolbar** → icon-only con `<span className="hidden sm:inline">texto</span>`
2. **Grupos de acción** (3+ acciones) → círculo h-11 + caption text-[10px] debajo
3. **CTAs primarios** (submit de formulario) → siempre con texto
4. **Targets táctiles mínimos** → h-9 para `sm`, h-10 para `md`, h-11 para `lg`
5. **`touch-action: manipulation`** → ya aplicado globalmente en `@layer base`

---

## 10. Anti-patterns — NO hacer

```
❌ Introducir nuevas fuentes (solo Bebas Neue + Plus Jakarta Sans)
❌ Usar colores crudos de Tailwind sin semántica (bg-amber-500 → bg-accent-500)
❌ Cards sin border + shadow-sm (se pierden sobre el fondo punteado)
❌ Fondo sólido en body (siempre dot-grid)
❌ Navbar de color diferente a slate-950
❌ Botones de toolbar con texto completo en móvil
❌ Usar purple, pink o gradientes en el UI principal
❌ Texto en display (Bebas Neue) para body copy
❌ Omitir la barra amber en headers de sección
```

---

## 11. Checklist para nuevas páginas

- [ ] Header con `flex items-start gap-3` + barra amber + `font-display text-4xl`
- [ ] Contenido en cards `rounded-lg border border-slate-200 bg-white shadow-sm`
- [ ] Botones de toolbar icon-only en móvil
- [ ] Padding de página: `px-4 py-6 pb-20 sm:pb-6`
- [ ] Espaciado entre secciones: `space-y-6`
- [ ] Inputs: `Input` o `Select` del componente UI (no `<input>` nativo sin estilo)
- [ ] Si hay notificaciones/badges: color `accent-500`, con `animate-ping` si es urgente

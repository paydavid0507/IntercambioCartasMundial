# Aplicación de Intercambio de Cartas Panini Mundial 2026

## 1. Objetivo

Crear una aplicación web rápida y sencilla donde los usuarios registrados puedan administrar sus cartas del álbum Panini Mundial 2026, indicando:

- Cartas faltantes.
- Cartas repetidas.
- Cantidad de repetidas por carta.
- Cantidad deseada por carta.
- Comparación automática con otros usuarios registrados.
- Contacto con usuarios compatibles para realizar intercambios.
- Enlace público o compartible del perfil de intercambio de cada usuario.

La aplicación debe permitir que cada persona actualice en cualquier momento sus cartas faltantes y repetidas.

---

## 2. Stack recomendado

### Frontend

- React o Next.js.
- TailwindCSS para estilos.
- ShadCN UI o componentes simples reutilizables.
- Aplicación responsive para celular, tablet y escritorio.

### Backend y base de datos

- Supabase como backend gratuito inicial.
- Supabase Auth para registro e inicio de sesión.
- Supabase PostgreSQL como base de datos relacional.
- Row Level Security para proteger la información de cada usuario.

### Hosting sugerido

- Vercel, Netlify o Cloudflare Pages para publicar el frontend.
- Supabase para base de datos, autenticación y API.

---

## 3. Concepto principal

Cada carta se identifica por:

```text
ABREVIACION-NUMERO
```

Ejemplos:

```text
MEX-01
BRA-15
ARG-20
FWC-03
```

El usuario no debe escribir libremente la abreviación. Debe seleccionarla desde un combo/lista desplegable. Luego debe escribir o seleccionar el número de carta del 1 al 20.

---

## 4. Abreviaciones permitidas

```text
MEX, RSA, KOR, CZE, CAN, BIH, QAT, SUI, BRA, MAR,
HAI, SCO, USA, PAR, AUS, TUR, GER, CUW, CIV, ECU,
NED, JPN, SWE, TUN, BEL, EGY, IRN, NZL, ESP, CPV,
KSA, URU, FRA, SEN, IRQ, NOR, ARG, ALG, AUT, JOR,
POR, COD, UZB, COL, ENG, CRO, GHA, PAN, FWC
```

> Nota: usar siempre las abreviaciones en mayúsculas internamente, aunque el usuario las escriba o seleccione en minúsculas.

---

## 5. Funcionalidades principales

## 5.1 Registro de usuarios

Cada usuario debe poder crear una cuenta para que su información quede asociada a un perfil único.

Campos sugeridos:

- Nombre visible.
- Correo electrónico.
- Ciudad.
- País.
- Teléfono o WhatsApp opcional.
- Nombre de usuario o slug para enlace público.
- Preferencia de contacto.
- Indicar si desea mostrar su contacto públicamente.

Ejemplo de enlace público:

```text
/u/david-benavides
```

Este enlace puede mostrar un resumen de sus cartas faltantes y repetidas, según la configuración de privacidad del usuario.

---

## 5.2 Administrar cartas faltantes

El usuario debe poder agregar cartas que necesita.

Campos:

- Abreviación de selección o grupo.
- Número de carta del 1 al 20.
- Cantidad deseada.

Ejemplo:

```text
MEX-05 | cantidad deseada: 1
ARG-10 | cantidad deseada: 2
BRA-20 | cantidad deseada: 1
```

Reglas:

- La abreviación debe existir en la lista permitida.
- El número debe estar entre 1 y 20.
- La cantidad deseada debe ser mayor o igual a 1.
- Si el usuario vuelve a agregar la misma carta, la aplicación debe actualizar la cantidad en vez de duplicar el registro.
- El usuario debe poder editar o eliminar una carta faltante.

---

## 5.3 Administrar cartas repetidas

El usuario debe poder agregar cartas que tiene repetidas.

Campos:

- Abreviación de selección o grupo.
- Número de carta del 1 al 20.
- Cantidad disponible para intercambio.

Ejemplo:

```text
KOR-03 | cantidad repetida: 3
USA-12 | cantidad repetida: 1
FWC-01 | cantidad repetida: 2
```

Reglas:

- La abreviación debe existir en la lista permitida.
- El número debe estar entre 1 y 20.
- La cantidad repetida debe ser mayor o igual a 1.
- Si el usuario vuelve a agregar la misma carta repetida, la aplicación debe actualizar la cantidad.
- El usuario debe poder editar o eliminar una carta repetida.

---

## 5.4 Búsqueda de cartas

La aplicación debe permitir buscar por:

- Abreviación.
- Número de carta.
- Código completo de carta.
- Usuario.
- Ciudad.
- País.

Ejemplos de búsqueda:

```text
MEX
MEX-05
ARG 10
BRA
David
Tegucigalpa
```

---

## 5.5 Comparación automática para intercambios

La aplicación debe comparar las cartas del usuario actual contra las cartas de los demás usuarios registrados.

Debe mostrar:

- Usuarios que tienen cartas que yo necesito.
- Usuarios que necesitan cartas que yo tengo repetidas.
- Coincidencias de intercambio mutuo.
- Cantidad posible a intercambiar.
- Datos de contacto disponibles.
- Botón o enlace para contactar al usuario.

### Tipos de coincidencia

#### Coincidencia directa

Otro usuario tiene una carta que yo necesito.

Ejemplo:

```text
Yo necesito: MEX-05
Carlos tiene repetida: MEX-05 x2
```

#### Coincidencia inversa

Yo tengo una carta repetida que otro usuario necesita.

Ejemplo:

```text
Yo tengo repetida: BRA-10 x1
Ana necesita: BRA-10
```

#### Coincidencia perfecta o mutua

Ambos usuarios tienen cartas que el otro necesita.

Ejemplo:

```text
Yo necesito: ARG-07
Pedro tiene repetida: ARG-07

Pedro necesita: USA-12
Yo tengo repetida: USA-12
```

Estas coincidencias deben aparecer primero porque son las más útiles para intercambio.

---

## 6. Pantallas sugeridas

## 6.1 Login / Registro

Opciones:

- Registrarse con correo y contraseña.
- Iniciar sesión.
- Recuperar contraseña.

---

## 6.2 Mi perfil

Campos editables:

- Nombre visible.
- Ciudad.
- País.
- WhatsApp opcional.
- Mostrar contacto públicamente: Sí / No.
- Slug o enlace público.

---

## 6.3 Mi álbum

Pantalla principal del usuario.

Debe tener dos secciones o pestañas:

1. Cartas faltantes.
2. Cartas repetidas.

Cada sección debe permitir:

- Agregar carta.
- Editar cantidad.
- Eliminar carta.
- Buscar dentro de la lista.
- Ver resumen total.

Ejemplo de resumen:

```text
Faltantes: 35 cartas
Repetidas: 52 cartas
Cartas únicas repetidas: 20
```

---

## 6.4 Agregar carta

Formulario simple:

```text
Tipo: [Faltante / Repetida]
Selección: [MEX]
Número: [1 - 20]
Cantidad: [1]
Guardar
```

Validaciones:

- La selección es obligatoria.
- El número es obligatorio y debe estar entre 1 y 20.
- La cantidad es obligatoria y debe ser mayor o igual a 1.

---

## 6.5 Comparar intercambios

Esta pantalla debe mostrar resultados ordenados por utilidad.

Orden sugerido:

1. Coincidencias mutuas.
2. Personas que tienen muchas cartas que yo necesito.
3. Personas que necesitan muchas cartas que yo tengo.
4. Coincidencias simples.

Ejemplo de resultado:

```text
Carlos M.
Ciudad: Tegucigalpa

Carlos puede darte:
- MEX-05 x1
- BRA-10 x2

Tú puedes darle:
- USA-12 x1
- ARG-03 x1

Tipo de coincidencia: Mutua
Acción: Contactar
```

---

## 6.6 Perfil público de intercambio

Ruta sugerida:

```text
/u/{slug}
```

Debe mostrar:

- Nombre visible.
- Ciudad y país.
- Cartas faltantes.
- Cartas repetidas.
- Botón para contactar si el usuario permitió mostrar contacto.

---

## 7. Modelo de base de datos propuesto

## 7.1 Tabla `profiles`

Guarda la información pública del usuario.

```sql
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    city text,
    country text default 'Honduras',
    whatsapp text,
    show_contact boolean not null default false,
    share_slug text unique not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

---

## 7.2 Tabla `teams`

Guarda las abreviaciones permitidas.

```sql
create table public.teams (
    abbr text primary key,
    display_name text,
    sort_order int not null default 0
);
```

Carga inicial:

```sql
insert into public.teams (abbr, display_name, sort_order) values
('MEX', 'MEX', 1),
('RSA', 'RSA', 2),
('KOR', 'KOR', 3),
('CZE', 'CZE', 4),
('CAN', 'CAN', 5),
('BIH', 'BIH', 6),
('QAT', 'QAT', 7),
('SUI', 'SUI', 8),
('BRA', 'BRA', 9),
('MAR', 'MAR', 10),
('HAI', 'HAI', 11),
('SCO', 'SCO', 12),
('USA', 'USA', 13),
('PAR', 'PAR', 14),
('AUS', 'AUS', 15),
('TUR', 'TUR', 16),
('GER', 'GER', 17),
('CUW', 'CUW', 18),
('CIV', 'CIV', 19),
('ECU', 'ECU', 20),
('NED', 'NED', 21),
('JPN', 'JPN', 22),
('SWE', 'SWE', 23),
('TUN', 'TUN', 24),
('BEL', 'BEL', 25),
('EGY', 'EGY', 26),
('IRN', 'IRN', 27),
('NZL', 'NZL', 28),
('ESP', 'ESP', 29),
('CPV', 'CPV', 30),
('KSA', 'KSA', 31),
('URU', 'URU', 32),
('FRA', 'FRA', 33),
('SEN', 'SEN', 34),
('IRQ', 'IRQ', 35),
('NOR', 'NOR', 36),
('ARG', 'ARG', 37),
('ALG', 'ALG', 38),
('AUT', 'AUT', 39),
('JOR', 'JOR', 40),
('POR', 'POR', 41),
('COD', 'COD', 42),
('UZB', 'UZB', 43),
('COL', 'COL', 44),
('ENG', 'ENG', 45),
('CRO', 'CRO', 46),
('GHA', 'GHA', 47),
('PAN', 'PAN', 48),
('FWC', 'FWC', 49);
```

---

## 7.3 Tabla `cards`

Guarda todas las cartas posibles del álbum usando la combinación abreviación + número.

```sql
create table public.cards (
    id uuid primary key default gen_random_uuid(),
    team_abbr text not null references public.teams(abbr),
    card_number smallint not null check (card_number between 1 and 20),
    card_code text generated always as (
        team_abbr || '-' || lpad(card_number::text, 2, '0')
    ) stored,
    unique (team_abbr, card_number),
    unique (card_code)
);
```

Carga inicial de cartas:

```sql
insert into public.cards (team_abbr, card_number)
select t.abbr, n
from public.teams t
cross join generate_series(1, 20) as n;
```

---

## 7.4 Tabla `user_card_needs`

Guarda las cartas que el usuario necesita o desea.

```sql
create table public.user_card_needs (
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.cards(id) on delete cascade,
    quantity_needed int not null default 1 check (quantity_needed >= 1),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, card_id)
);
```

---

## 7.5 Tabla `user_card_duplicates`

Guarda las cartas repetidas disponibles para intercambio.

```sql
create table public.user_card_duplicates (
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.cards(id) on delete cascade,
    quantity_available int not null default 1 check (quantity_available >= 1),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, card_id)
);
```

---

## 8. Índices para búsquedas rápidas

```sql
create index idx_cards_team_number
on public.cards (team_abbr, card_number);

create index idx_cards_code
on public.cards (card_code);

create index idx_user_card_needs_card_id
on public.user_card_needs (card_id);

create index idx_user_card_needs_user_id
on public.user_card_needs (user_id);

create index idx_user_card_duplicates_card_id
on public.user_card_duplicates (card_id);

create index idx_user_card_duplicates_user_id
on public.user_card_duplicates (user_id);

create index idx_profiles_slug
on public.profiles (share_slug);

create index idx_profiles_city_country
on public.profiles (city, country);
```

---

## 9. Vista para coincidencias directas

Esta vista muestra qué usuario tiene una carta repetida que otro usuario necesita.

```sql
create or replace view public.v_direct_card_matches as
select
    n.user_id as seeker_user_id,
    d.user_id as owner_user_id,
    c.id as card_id,
    c.card_code,
    c.team_abbr,
    c.card_number,
    n.quantity_needed,
    d.quantity_available,
    least(n.quantity_needed, d.quantity_available) as possible_quantity
from public.user_card_needs n
join public.user_card_duplicates d
    on d.card_id = n.card_id
   and d.user_id <> n.user_id
join public.cards c
    on c.id = n.card_id;
```

---

## 10. Vista resumen de coincidencias por usuario

Esta vista ayuda a saber con quién conviene intercambiar.

```sql
create or replace view public.v_user_match_summary as
with direct as (
    select
        seeker_user_id,
        owner_user_id,
        count(*) as cards_owner_can_give,
        sum(possible_quantity) as total_owner_can_give
    from public.v_direct_card_matches
    group by seeker_user_id, owner_user_id
), reciprocal as (
    select
        d1.seeker_user_id,
        d1.owner_user_id,
        d1.cards_owner_can_give,
        d1.total_owner_can_give,
        coalesce(d2.cards_owner_can_give, 0) as cards_seeker_can_give,
        coalesce(d2.total_owner_can_give, 0) as total_seeker_can_give
    from direct d1
    left join direct d2
        on d2.seeker_user_id = d1.owner_user_id
       and d2.owner_user_id = d1.seeker_user_id
)
select
    r.seeker_user_id,
    r.owner_user_id,
    p.display_name as owner_display_name,
    p.city,
    p.country,
    case when p.show_contact then p.whatsapp else null end as whatsapp,
    p.share_slug,
    r.cards_owner_can_give,
    r.total_owner_can_give,
    r.cards_seeker_can_give,
    r.total_seeker_can_give,
    case
        when r.cards_owner_can_give > 0 and r.cards_seeker_can_give > 0 then 'MUTUAL'
        when r.cards_owner_can_give > 0 then 'DIRECT'
        else 'NONE'
    end as match_type
from reciprocal r
join public.profiles p
    on p.id = r.owner_user_id;
```

Orden recomendado para mostrar resultados:

```sql
select *
from public.v_user_match_summary
where seeker_user_id = auth.uid()
order by
    case when match_type = 'MUTUAL' then 1 else 2 end,
    total_owner_can_give desc,
    total_seeker_can_give desc,
    owner_display_name asc;
```

---

## 11. Seguridad con Row Level Security

Activar RLS:

```sql
alter table public.profiles enable row level security;
alter table public.user_card_needs enable row level security;
alter table public.user_card_duplicates enable row level security;
```

Políticas sugeridas:

```sql
create policy "profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "needs are readable by authenticated users"
on public.user_card_needs
for select
to authenticated
using (true);

create policy "users manage own needs"
on public.user_card_needs
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "duplicates are readable by authenticated users"
on public.user_card_duplicates
for select
to authenticated
using (true);

create policy "users manage own duplicates"
on public.user_card_duplicates
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

## 12. Reglas de negocio

1. Un usuario debe estar registrado para administrar cartas.
2. Una carta se identifica por abreviación y número.
3. El número permitido va del 1 al 20.
4. La cantidad mínima es 1.
5. Si una carta ya existe en la lista del usuario, se actualiza la cantidad.
6. El usuario puede tener una misma carta en buscadas y repetidas si desea más copias para colección especial.
7. Las coincidencias mutuas deben aparecer primero.
8. Los datos de contacto solo se muestran si el usuario lo permite.
9. El usuario puede compartir su perfil mediante un enlace público.
10. La app no debe permitir cartas con abreviaciones fuera de la lista oficial configurada.

---

## 13. Flujo básico de usuario

1. El usuario se registra.
2. Completa su perfil.
3. Agrega cartas faltantes.
4. Agrega cartas repetidas.
5. Entra a la pantalla de comparación.
6. La app le muestra usuarios compatibles.
7. El usuario abre el perfil del otro usuario o usa el botón de contacto.
8. Después del intercambio, actualiza sus cantidades.

---

## 14. Formato de entrada rápida opcional

Además del formulario normal, se puede agregar una entrada rápida para pegar varias cartas.

Ejemplo:

```text
MEX-01 x2
BRA-10 x1
ARG-05 x3
FWC-02 x1
```

La aplicación debe interpretar:

- Abreviación.
- Número.
- Cantidad.

Y luego guardar los registros en la sección seleccionada: faltantes o repetidas.

---

## 15. API o servicios recomendados

Aunque Supabase genera API automáticamente, se recomienda crear servicios en el frontend:

```text
AuthService
ProfileService
CardCatalogService
UserNeedsService
UserDuplicatesService
MatchService
```

Funciones sugeridas:

```text
login(email, password)
register(email, password)
getProfile(userId)
updateProfile(profile)
getTeams()
getCardsByTeam(teamAbbr)
addOrUpdateNeededCard(teamAbbr, number, quantity)
addOrUpdateDuplicateCard(teamAbbr, number, quantity)
deleteNeededCard(cardId)
deleteDuplicateCard(cardId)
getMatchesForCurrentUser()
getPublicProfile(slug)
```

---

## 16. Recomendaciones de rendimiento

1. No guardar las cartas como texto libre.
2. Usar tabla `cards` normalizada.
3. Usar índices por `card_id`, `user_id` y `card_code`.
4. Hacer la comparación en SQL, no manualmente en el navegador.
5. Mostrar resultados paginados.
6. Usar búsqueda con debounce de 300 a 500 ms.
7. Evitar cargar todos los usuarios si solo se necesitan coincidencias.
8. Usar vistas SQL para el resumen de matches.
9. En el futuro, si hay muchos usuarios, convertir la vista de coincidencias en una vista materializada o función RPC.

---

## 17. MVP mínimo recomendado

Para una primera versión funcional, construir solo esto:

1. Registro e inicio de sesión.
2. Perfil básico del usuario.
3. Catálogo de abreviaciones y cartas del 1 al 20.
4. Pantalla para agregar faltantes.
5. Pantalla para agregar repetidas.
6. Pantalla para comparar con otros usuarios.
7. Perfil público con enlace compartible.
8. Botón o información de contacto si el usuario lo permite.

---

## 18. Futuras mejoras

- Escanear carta con cámara.
- Importar desde Excel o CSV.
- Exportar lista de faltantes y repetidas.
- Crear grupos privados de intercambio.
- Ranking de mejores usuarios para intercambio.
- Historial de intercambios realizados.
- Confirmación de intercambio entre dos usuarios.
- Notificaciones cuando aparece una carta que necesito.
- Filtros por ciudad o país.
- Código QR para compartir perfil.

---

## 19. Consideración legal y de marca

La aplicación debe evitar usar imágenes oficiales, logos protegidos o diseños copiados del álbum sin autorización. Para un MVP, usar solo códigos de cartas, abreviaciones, texto y datos ingresados por los usuarios.

---

## 20. Nombre sugerido del proyecto

Opciones:

- Swap Album 2026
- Intercambia Mundial 2026
- Mi Álbum 2026
- CambiaFigus 2026
- Panini Swap Tracker
- Faltantes y Repetidas 2026


-- Panini Mundial 2026 - Row Level Security
-- Reference: panini_mundial_2026_intercambios.md, section 11

alter table public.profiles enable row level security;
alter table public.user_card_needs enable row level security;
alter table public.user_card_duplicates enable row level security;

-- Catalog tables remain readable to anyone.
alter table public.teams enable row level security;
alter table public.cards enable row level security;

create policy "teams readable to all"
on public.teams
for select
to anon, authenticated
using (true);

create policy "cards readable to all"
on public.cards
for select
to anon, authenticated
using (true);

-- Profiles
create policy "profiles readable to anon for public share pages"
on public.profiles
for select
to anon, authenticated
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

-- Needs
create policy "needs readable to all"
on public.user_card_needs
for select
to anon, authenticated
using (true);

create policy "users manage own needs"
on public.user_card_needs
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Duplicates
create policy "duplicates readable to all"
on public.user_card_duplicates
for select
to anon, authenticated
using (true);

create policy "users manage own duplicates"
on public.user_card_duplicates
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

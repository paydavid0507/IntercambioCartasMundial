-- Panini Mundial 2026 - Initial schema
-- Reference: panini_mundial_2026_intercambios.md, sections 7-8

create extension if not exists "pgcrypto";

-- 7.1 Profiles
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

-- 7.2 Teams
create table public.teams (
    abbr text primary key,
    display_name text,
    sort_order int not null default 0
);

-- 7.3 Cards
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

-- 7.4 Needs
create table public.user_card_needs (
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.cards(id) on delete cascade,
    quantity_needed int not null default 1 check (quantity_needed >= 1),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, card_id)
);

-- 7.5 Duplicates
create table public.user_card_duplicates (
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.cards(id) on delete cascade,
    quantity_available int not null default 1 check (quantity_available >= 1),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, card_id)
);

-- 8. Indexes
create index idx_cards_team_number on public.cards (team_abbr, card_number);
create index idx_cards_code on public.cards (card_code);
create index idx_user_card_needs_card_id on public.user_card_needs (card_id);
create index idx_user_card_needs_user_id on public.user_card_needs (user_id);
create index idx_user_card_duplicates_card_id on public.user_card_duplicates (card_id);
create index idx_user_card_duplicates_user_id on public.user_card_duplicates (user_id);
create index idx_profiles_slug on public.profiles (share_slug);
create index idx_profiles_city_country on public.profiles (city, country);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_user_card_needs_updated_at
before update on public.user_card_needs
for each row execute function public.set_updated_at();

create trigger trg_user_card_duplicates_updated_at
before update on public.user_card_duplicates
for each row execute function public.set_updated_at();

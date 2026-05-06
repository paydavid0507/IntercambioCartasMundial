-- Panini Mundial 2026 - Match notifications opt-in

alter table public.profiles
  add column if not exists notify_matches boolean not null default false;

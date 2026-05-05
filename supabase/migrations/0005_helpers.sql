-- Panini Mundial 2026 - Helpers
-- Auto-create a profile row when a new auth user signs up so the app
-- always has a profile to read for any authenticated user.

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
declare
    base_slug text;
    candidate text;
    suffix int := 0;
begin
    base_slug := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'display_name',
                                               split_part(new.email, '@', 1),
                                               'user'),
                                      '[^a-z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    if base_slug = '' then
        base_slug := 'user';
    end if;

    candidate := base_slug;
    while exists (select 1 from public.profiles where share_slug = candidate) loop
        suffix := suffix + 1;
        candidate := base_slug || '-' || suffix::text;
    end loop;

    insert into public.profiles (id, display_name, share_slug, country)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        candidate,
        coalesce(new.raw_user_meta_data->>'country', 'Honduras')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

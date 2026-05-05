# Supabase setup

Run the migrations in order against a fresh Supabase project. The simplest path
is to paste each file into the SQL editor in the Supabase dashboard.

1. `0001_init.sql` - tables, indexes, updated_at triggers
2. `0002_seed.sql` - team abbreviations + 20 cards per team (980 rows total)
3. `0003_views.sql` - `v_direct_card_matches` and `v_user_match_summary`
4. `0004_rls.sql` - row level security and policies
5. `0005_helpers.sql` - auto-create a profile on signup with a generated slug

If you prefer the Supabase CLI:

```bash
supabase db push
```

(Place the SQL files inside `supabase/migrations/` with the timestamps the CLI
expects, or run `supabase db reset` to apply them in order to a local stack.)

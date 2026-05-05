-- Panini Mundial 2026 - Internal messaging system

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint no_self_message check (sender_id <> recipient_id)
);

create index idx_messages_recipient on public.messages (recipient_id, created_at desc);
create index idx_messages_sender on public.messages (sender_id, created_at desc);

alter table public.messages enable row level security;

create policy "users can send messages"
on public.messages for insert
to authenticated
with check (sender_id = auth.uid());

create policy "users can read their own messages"
on public.messages for select
to authenticated
using (recipient_id = auth.uid() or sender_id = auth.uid());

create policy "recipients can mark as read"
on public.messages for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

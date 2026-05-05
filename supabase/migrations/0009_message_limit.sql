-- Panini Mundial 2026 - Message retention limit
-- Each user keeps at most 10 received and 10 sent messages.
-- Oldest messages are deleted automatically after each insert.

create or replace function public.enforce_message_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Keep only the 10 most recent received messages for the recipient.
  delete from public.messages
  where id in (
    select id from public.messages
    where recipient_id = NEW.recipient_id
    order by created_at desc
    offset 10
  );

  -- Keep only the 10 most recent sent messages for the sender.
  delete from public.messages
  where id in (
    select id from public.messages
    where sender_id = NEW.sender_id
    order by created_at desc
    offset 10
  );

  return NEW;
end;
$$;

create trigger trg_message_limit
after insert on public.messages
for each row execute function public.enforce_message_limit();

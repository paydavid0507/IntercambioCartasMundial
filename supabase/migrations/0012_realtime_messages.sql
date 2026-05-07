-- Enable real-time on messages table.
-- REPLICA IDENTITY FULL allows Supabase to broadcast DELETE events with
-- full row data (including recipient_id) so client-side filters work.

alter table public.messages replica identity full;
alter publication supabase_realtime add table public.messages;

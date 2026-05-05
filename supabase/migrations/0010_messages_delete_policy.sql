-- Allow users to delete their own received and sent messages.
-- Missing DELETE policy was silently blocking clearBox().

create policy "users can delete their own messages"
on public.messages for delete
to authenticated
using (recipient_id = auth.uid() or sender_id = auth.uid());

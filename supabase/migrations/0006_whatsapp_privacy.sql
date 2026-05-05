-- Panini Mundial 2026 - WhatsApp column privacy
-- Prevent unauthenticated REST API scraping of whatsapp numbers.
-- Authenticated users (logged-in app users) can still read it, which is
-- required so the app server component can show the WhatsApp button.
-- The v_user_match_summary view already masks it per show_contact.

revoke select (whatsapp) on public.profiles from anon;

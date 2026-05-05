-- Panini Mundial 2026 - Allow card number 0 for FWC only
-- FWC has a special trophy/mascot card at position 00.

alter table public.cards
  drop constraint if exists cards_card_number_check;

alter table public.cards
  add constraint cards_card_number_check
  check (
    (team_abbr = 'FWC' and card_number between 0 and 20)
    or
    (team_abbr != 'FWC' and card_number between 1 and 20)
  );

insert into public.cards (team_abbr, card_number)
values ('FWC', 0)
on conflict (team_abbr, card_number) do nothing;

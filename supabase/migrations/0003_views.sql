-- Panini Mundial 2026 - Match views
-- Reference: panini_mundial_2026_intercambios.md, sections 9-10

-- 9. Direct matches: a user (owner) has a duplicate that another user (seeker) needs.
create or replace view public.v_direct_card_matches as
select
    n.user_id as seeker_user_id,
    d.user_id as owner_user_id,
    c.id as card_id,
    c.card_code,
    c.team_abbr,
    c.card_number,
    n.quantity_needed,
    d.quantity_available,
    least(n.quantity_needed, d.quantity_available) as possible_quantity
from public.user_card_needs n
join public.user_card_duplicates d
    on d.card_id = n.card_id
   and d.user_id <> n.user_id
join public.cards c
    on c.id = n.card_id;

-- 10. User-to-user match summary (mutual / direct).
create or replace view public.v_user_match_summary as
with direct as (
    select
        seeker_user_id,
        owner_user_id,
        count(*) as cards_owner_can_give,
        sum(possible_quantity) as total_owner_can_give
    from public.v_direct_card_matches
    group by seeker_user_id, owner_user_id
), reciprocal as (
    select
        d1.seeker_user_id,
        d1.owner_user_id,
        d1.cards_owner_can_give,
        d1.total_owner_can_give,
        coalesce(d2.cards_owner_can_give, 0) as cards_seeker_can_give,
        coalesce(d2.total_owner_can_give, 0) as total_seeker_can_give
    from direct d1
    left join direct d2
        on d2.seeker_user_id = d1.owner_user_id
       and d2.owner_user_id = d1.seeker_user_id
)
select
    r.seeker_user_id,
    r.owner_user_id,
    p.display_name as owner_display_name,
    p.city,
    p.country,
    case when p.show_contact then p.whatsapp else null end as whatsapp,
    p.share_slug,
    r.cards_owner_can_give,
    r.total_owner_can_give,
    r.cards_seeker_can_give,
    r.total_seeker_can_give,
    case
        when r.cards_owner_can_give > 0 and r.cards_seeker_can_give > 0 then 'MUTUAL'
        when r.cards_owner_can_give > 0 then 'DIRECT'
        else 'NONE'
    end as match_type
from reciprocal r
join public.profiles p
    on p.id = r.owner_user_id;

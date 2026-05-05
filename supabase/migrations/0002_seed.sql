-- Panini Mundial 2026 - Seed teams and cards
-- Reference: panini_mundial_2026_intercambios.md, section 4 and 7

insert into public.teams (abbr, display_name, sort_order) values
('MEX', 'MEX', 1),
('RSA', 'RSA', 2),
('KOR', 'KOR', 3),
('CZE', 'CZE', 4),
('CAN', 'CAN', 5),
('BIH', 'BIH', 6),
('QAT', 'QAT', 7),
('SUI', 'SUI', 8),
('BRA', 'BRA', 9),
('MAR', 'MAR', 10),
('HAI', 'HAI', 11),
('SCO', 'SCO', 12),
('USA', 'USA', 13),
('PAR', 'PAR', 14),
('AUS', 'AUS', 15),
('TUR', 'TUR', 16),
('GER', 'GER', 17),
('CUW', 'CUW', 18),
('CIV', 'CIV', 19),
('ECU', 'ECU', 20),
('NED', 'NED', 21),
('JPN', 'JPN', 22),
('SWE', 'SWE', 23),
('TUN', 'TUN', 24),
('BEL', 'BEL', 25),
('EGY', 'EGY', 26),
('IRN', 'IRN', 27),
('NZL', 'NZL', 28),
('ESP', 'ESP', 29),
('CPV', 'CPV', 30),
('KSA', 'KSA', 31),
('URU', 'URU', 32),
('FRA', 'FRA', 33),
('SEN', 'SEN', 34),
('IRQ', 'IRQ', 35),
('NOR', 'NOR', 36),
('ARG', 'ARG', 37),
('ALG', 'ALG', 38),
('AUT', 'AUT', 39),
('JOR', 'JOR', 40),
('POR', 'POR', 41),
('COD', 'COD', 42),
('UZB', 'UZB', 43),
('COL', 'COL', 44),
('ENG', 'ENG', 45),
('CRO', 'CRO', 46),
('GHA', 'GHA', 47),
('PAN', 'PAN', 48),
('FWC', 'FWC', 49)
on conflict (abbr) do nothing;

insert into public.cards (team_abbr, card_number)
select t.abbr, n
from public.teams t
cross join generate_series(1, 20) as n
on conflict (team_abbr, card_number) do nothing;

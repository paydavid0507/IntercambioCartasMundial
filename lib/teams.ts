// Allowed team abbreviations - source of truth for the frontend.
// Keep this in sync with supabase/migrations/0002_seed.sql.
export const TEAM_ABBREVIATIONS = [
  "MEX", "RSA", "KOR", "CZE", "CAN", "BIH", "QAT", "SUI", "BRA", "MAR",
  "HAI", "SCO", "USA", "PAR", "AUS", "TUR", "GER", "CUW", "CIV", "ECU",
  "NED", "JPN", "SWE", "TUN", "BEL", "EGY", "IRN", "NZL", "ESP", "CPV",
  "KSA", "URU", "FRA", "SEN", "IRQ", "NOR", "ARG", "ALG", "AUT", "JOR",
  "POR", "COD", "UZB", "COL", "ENG", "CRO", "GHA", "PAN", "FWC",
] as const;

export type TeamAbbr = (typeof TEAM_ABBREVIATIONS)[number];

export const TEAM_ABBR_SET: ReadonlySet<TeamAbbr> = new Set(
  TEAM_ABBREVIATIONS,
);

export const CARD_NUMBER_MIN = 1;
export const CARD_NUMBER_MAX = 20;

export function isAllowedAbbr(abbr: string): abbr is TeamAbbr {
  return TEAM_ABBR_SET.has(abbr.toUpperCase() as TeamAbbr);
}

export function formatCardCode(abbr: string, number: number): string {
  return `${abbr.toUpperCase()}-${String(number).padStart(2, "0")}`;
}

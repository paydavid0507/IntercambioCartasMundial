import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CARD_NUMBER_MAX,
  CARD_NUMBER_MIN,
  isAllowedAbbr,
  type TeamAbbr,
} from "./teams";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type ParsedCardEntry = {
  abbr: TeamAbbr;
  number: number;
  quantity: number;
};

export type QuickPasteResult = {
  entries: ParsedCardEntry[];
  errors: { line: string; reason: string }[];
};

/**
 * Parses input in two formats:
 *   Batch:  MEX: 1,2,3,4,5   (one team, multiple numbers separated by commas)
 *   Single: MEX-01 x2 | BRA 10 1 | ARG-05
 * Each number in a batch line becomes one entry with quantity 1.
 */
export function parseQuickPaste(input: string): QuickPasteResult {
  const entries: ParsedCardEntry[] = [];
  const errors: { line: string; reason: string }[] = [];

  const lines = input.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Batch format: MEX: 1,2,3,4,5
    const batchMatch = line.match(/^([A-Za-z]{2,4})\s*:\s*([\d,\s]+)$/);
    if (batchMatch) {
      const abbrRaw = batchMatch[1].toUpperCase();
      if (!isAllowedAbbr(abbrRaw)) {
        errors.push({ line, reason: `abreviación inválida (${abbrRaw})` });
        continue;
      }
      const nums = batchMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
      for (const ns of nums) {
        const num = parseInt(ns, 10);
        if (isNaN(num) || num < CARD_NUMBER_MIN || num > CARD_NUMBER_MAX) {
          errors.push({ line: `${abbrRaw}: ${ns}`, reason: `número fuera de rango (${ns})` });
        } else {
          entries.push({ abbr: abbrRaw, number: num, quantity: 1 });
        }
      }
      continue;
    }

    // Single-card format: ABC-NN xK | ABC NN K | ABC-NN
    const match = line.match(
      /^([A-Za-z]{2,4})[\s-]+(\d{1,2})(?:\s*[xX]?\s*(\d{1,3}))?$/,
    );

    if (!match) {
      errors.push({ line, reason: "formato no reconocido" });
      continue;
    }

    const abbrRaw = match[1].toUpperCase();
    const num = parseInt(match[2], 10);
    const qty = match[3] ? parseInt(match[3], 10) : 1;

    if (!isAllowedAbbr(abbrRaw)) {
      errors.push({ line, reason: `abreviación inválida (${abbrRaw})` });
      continue;
    }
    if (num < CARD_NUMBER_MIN || num > CARD_NUMBER_MAX) {
      errors.push({ line, reason: `número fuera de rango (${num})` });
      continue;
    }
    if (qty < 1) {
      errors.push({ line, reason: "cantidad menor a 1" });
      continue;
    }

    entries.push({ abbr: abbrRaw, number: num, quantity: qty });
  }

  // Dedupe entries by code, summing quantities.
  const merged = new Map<string, ParsedCardEntry>();
  for (const e of entries) {
    const key = `${e.abbr}-${e.number}`;
    const prev = merged.get(key);
    if (prev) {
      prev.quantity += e.quantity;
    } else {
      merged.set(key, { ...e });
    }
  }

  return { entries: [...merged.values()], errors };
}

/**
 * Turn a free-text search query like "ARG 10" or "MEX-05" into structured
 * filters the search page can apply.
 */
export type SearchTokens = {
  abbr?: TeamAbbr;
  number?: number;
  cardCode?: string;
  freeText: string;
};

export function tokenizeSearch(query: string): SearchTokens {
  const trimmed = query.trim();
  if (!trimmed) return { freeText: "" };

  const codeMatch = trimmed.match(/^([A-Za-z]{2,4})[\s-]+(\d{1,2})$/);
  if (codeMatch) {
    const abbrRaw = codeMatch[1].toUpperCase();
    const num = parseInt(codeMatch[2], 10);
    if (
      isAllowedAbbr(abbrRaw) &&
      num >= CARD_NUMBER_MIN &&
      num <= CARD_NUMBER_MAX
    ) {
      return {
        abbr: abbrRaw,
        number: num,
        cardCode: `${abbrRaw}-${String(num).padStart(2, "0")}`,
        freeText: trimmed,
      };
    }
  }

  const abbrOnly = trimmed.toUpperCase();
  if (isAllowedAbbr(abbrOnly)) {
    return { abbr: abbrOnly, freeText: trimmed };
  }

  return { freeText: trimmed };
}

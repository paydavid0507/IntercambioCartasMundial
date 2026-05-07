import { describe, it, expect } from "vitest";
import { parseQuickPaste, tokenizeSearch } from "./utils";

// ---------------------------------------------------------------------------
// parseQuickPaste
// ---------------------------------------------------------------------------

describe("parseQuickPaste", () => {
  // ── happy paths ────────────────────────────────────────────────────────────

  it("parses a single card with no quantity (defaults to 1)", () => {
    const r = parseQuickPaste("MEX-05");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toEqual([{ abbr: "MEX", number: 5, quantity: 1 }]);
  });

  it("parses a single card with explicit quantity (xN)", () => {
    const r = parseQuickPaste("ARG-05 x3");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toEqual([{ abbr: "ARG", number: 5, quantity: 3 }]);
  });

  it("parses a single card with space separator and quantity", () => {
    const r = parseQuickPaste("BRA 10 2");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toEqual([{ abbr: "BRA", number: 10, quantity: 2 }]);
  });

  it("parses batch comma-separated format", () => {
    const r = parseQuickPaste("BRA: 3,8,15");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toHaveLength(3);
    expect(r.entries.map((e) => e.number)).toEqual([3, 8, 15]);
    expect(r.entries.every((e) => e.abbr === "BRA" && e.quantity === 1)).toBe(true);
  });

  it("parses batch range format", () => {
    const r = parseQuickPaste("MEX: 1-5");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toHaveLength(5);
    expect(r.entries.map((e) => e.number)).toEqual([1, 2, 3, 4, 5]);
  });

  it("parses FWC card starting at 0", () => {
    const r = parseQuickPaste("FWC-00");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toEqual([{ abbr: "FWC", number: 0, quantity: 1 }]);
  });

  it("parses FWC range starting at 0", () => {
    const r = parseQuickPaste("FWC: 0-3");
    expect(r.errors).toHaveLength(0);
    expect(r.entries.map((e) => e.number)).toEqual([0, 1, 2, 3]);
  });

  it("parses multiple lines", () => {
    const r = parseQuickPaste("MEX: 1-3\nBRA: 5,6");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toHaveLength(5);
  });

  it("ignores blank lines", () => {
    const r = parseQuickPaste("\n\nMEX-01\n\n");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toHaveLength(1);
  });

  it("is case-insensitive for abbreviations", () => {
    const r = parseQuickPaste("mex-05");
    expect(r.errors).toHaveLength(0);
    expect(r.entries[0].abbr).toBe("MEX");
  });

  it("deduplicates entries by card code and sums quantities", () => {
    const r = parseQuickPaste("MEX-05 x2\nMEX-05 x3");
    expect(r.errors).toHaveLength(0);
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].quantity).toBe(5);
  });

  it("deduplicates across batch and single formats", () => {
    const r = parseQuickPaste("MEX: 1,2\nMEX-01 x2");
    expect(r.errors).toHaveLength(0);
    // MEX-1 appears twice: quantity should be summed to 3
    const mex1 = r.entries.find((e) => e.number === 1);
    expect(mex1?.quantity).toBe(3);
    expect(r.entries).toHaveLength(2);
  });

  // ── error paths ────────────────────────────────────────────────────────────

  it("returns an error for an unrecognised abbreviation", () => {
    const r = parseQuickPaste("ZZZ-05");
    expect(r.entries).toHaveLength(0);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/abreviación inválida/);
  });

  it("returns an error for a card number out of range (too high)", () => {
    const r = parseQuickPaste("MEX-21");
    expect(r.entries).toHaveLength(0);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/fuera de rango/);
  });

  it("returns an error for card number 0 on a non-FWC team", () => {
    const r = parseQuickPaste("MEX-00");
    expect(r.entries).toHaveLength(0);
    expect(r.errors).toHaveLength(1);
  });

  it("returns an error for an unrecognised batch abbreviation", () => {
    const r = parseQuickPaste("ZZZ: 1,2,3");
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/abreviación inválida/);
  });

  it("returns an error for a reversed range", () => {
    const r = parseQuickPaste("MEX: 10-5");
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/rango invertido/);
  });

  it("returns an error for a range exceeding max", () => {
    const r = parseQuickPaste("MEX: 1-21");
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/fuera de límite/);
  });

  it("returns an error for an unrecognised line format", () => {
    const r = parseQuickPaste("gibberish line!!!");
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].reason).toMatch(/formato no reconocido/);
  });

  it("returns mixed entries and errors on a multi-line input", () => {
    const r = parseQuickPaste("MEX-05\nZZZ-01\nBRA-10");
    expect(r.entries).toHaveLength(2);
    expect(r.errors).toHaveLength(1);
  });

  it("returns empty result for blank input", () => {
    const r = parseQuickPaste("   ");
    expect(r.entries).toHaveLength(0);
    expect(r.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// tokenizeSearch
// ---------------------------------------------------------------------------

describe("tokenizeSearch", () => {
  it("returns empty freeText for a blank query", () => {
    const r = tokenizeSearch("   ");
    expect(r).toEqual({ freeText: "" });
  });

  it("recognises a full card code with dash separator", () => {
    const r = tokenizeSearch("MEX-05");
    expect(r.abbr).toBe("MEX");
    expect(r.number).toBe(5);
    expect(r.cardCode).toBe("MEX-05");
    expect(r.freeText).toBe("MEX-05");
  });

  it("recognises a full card code with space separator", () => {
    const r = tokenizeSearch("ARG 10");
    expect(r.abbr).toBe("ARG");
    expect(r.number).toBe(10);
    expect(r.cardCode).toBe("ARG-10");
  });

  it("is case-insensitive for card code queries", () => {
    const r = tokenizeSearch("mex-05");
    expect(r.abbr).toBe("MEX");
    expect(r.cardCode).toBe("MEX-05");
  });

  it("recognises a team abbreviation alone", () => {
    const r = tokenizeSearch("BRA");
    expect(r.abbr).toBe("BRA");
    expect(r.number).toBeUndefined();
    expect(r.cardCode).toBeUndefined();
  });

  it("falls back to freeText for an unknown abbreviation alone", () => {
    const r = tokenizeSearch("ZZZ");
    expect(r.abbr).toBeUndefined();
    expect(r.freeText).toBe("ZZZ");
  });

  it("falls back to freeText for a known abbr with out-of-range number", () => {
    const r = tokenizeSearch("MEX-99");
    expect(r.abbr).toBeUndefined();
    expect(r.cardCode).toBeUndefined();
    expect(r.freeText).toBe("MEX-99");
  });

  it("falls back to freeText for a plain name query", () => {
    const r = tokenizeSearch("david");
    expect(r.abbr).toBeUndefined();
    expect(r.freeText).toBe("david");
  });

  it("recognises FWC-00 as a valid card code", () => {
    const r = tokenizeSearch("FWC-00");
    expect(r.abbr).toBe("FWC");
    expect(r.number).toBe(0);
    expect(r.cardCode).toBe("FWC-00");
  });
});

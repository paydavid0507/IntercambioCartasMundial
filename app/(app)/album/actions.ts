"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CARD_NUMBER_MAX,
  cardNumberMin,
  isAllowedAbbr,
} from "@/lib/teams";
import { parseQuickPaste } from "@/lib/utils";
import { notifyMatchedUsers } from "@/lib/notifications";

export type CardKind = "needed" | "duplicate";

type ServerActionResult = { ok: true } | { ok: false; error: string };

export async function upsertCard(
  kind: CardKind,
  abbr: string,
  number: number,
  quantity: number,
): Promise<ServerActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const abbrUpper = abbr.toUpperCase();
  if (!isAllowedAbbr(abbrUpper)) {
    return { ok: false, error: `Abreviación no permitida (${abbr})` };
  }
  if (number < cardNumberMin(abbrUpper) || number > CARD_NUMBER_MAX) {
    return {
      ok: false,
      error: `Número fuera de rango (${number}). Debe estar entre 1 y 20.`,
    };
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { ok: false, error: "La cantidad debe ser al menos 1" };
  }

  const { data: card } = await supabase
    .from("cards")
    .select("id")
    .eq("team_abbr", abbrUpper)
    .eq("card_number", number)
    .maybeSingle();

  if (!card) {
    return { ok: false, error: "Carta no encontrada en el catálogo" };
  }

  // Determine if this is a new card (not an update) for notification purposes
  let isNew = false;
  if (kind === "needed") {
    const { data: existing } = await supabase
      .from("user_card_needs")
      .select("card_id")
      .eq("user_id", user.id)
      .eq("card_id", card.id)
      .maybeSingle();
    isNew = !existing;

    const { error } = await supabase
      .from("user_card_needs")
      .upsert(
        { user_id: user.id, card_id: card.id, quantity_needed: quantity },
        { onConflict: "user_id,card_id" },
      );
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: existing } = await supabase
      .from("user_card_duplicates")
      .select("card_id")
      .eq("user_id", user.id)
      .eq("card_id", card.id)
      .maybeSingle();
    isNew = !existing;

    const { error } = await supabase
      .from("user_card_duplicates")
      .upsert(
        {
          user_id: user.id,
          card_id: card.id,
          quantity_available: quantity,
        },
        { onConflict: "user_id,card_id" },
      );
    if (error) return { ok: false, error: error.message };
  }

  if (isNew) {
    await notifyMatchedUsers([card.id], kind, supabase);
  }

  revalidatePath("/album");
  return { ok: true };
}

export async function deleteCard(
  kind: CardKind,
  cardId: string,
): Promise<ServerActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  if (kind === "needed") {
    const { error } = await supabase
      .from("user_card_needs")
      .delete()
      .eq("user_id", user.id)
      .eq("card_id", cardId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("user_card_duplicates")
      .delete()
      .eq("user_id", user.id)
      .eq("card_id", cardId);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/album");
  return { ok: true };
}

export async function bulkDeleteCards(
  kind: CardKind,
  cardIds: string[],
): Promise<ServerActionResult> {
  if (cardIds.length === 0) return { ok: true };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  if (kind === "needed") {
    const { error } = await supabase
      .from("user_card_needs")
      .delete()
      .eq("user_id", user.id)
      .in("card_id", cardIds);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("user_card_duplicates")
      .delete()
      .eq("user_id", user.id)
      .in("card_id", cardIds);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/album");
  return { ok: true };
}

export async function bulkUpsertFromText(
  kind: CardKind,
  text: string,
): Promise<{
  ok: boolean;
  added: number;
  updated: number;
  errors: { line: string; reason: string }[];
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, added: 0, updated: 0, errors: [] };
  }

  const parsed = parseQuickPaste(text);
  if (parsed.entries.length === 0) {
    return { ok: false, added: 0, updated: 0, errors: parsed.errors };
  }

  const codes = parsed.entries.map(
    (e) => `${e.abbr}-${String(e.number).padStart(2, "0")}`,
  );
  const { data: cards, error: cardsErr } = await supabase
    .from("cards")
    .select("id, card_code")
    .in("card_code", codes);

  if (cardsErr) {
    return {
      ok: false,
      added: 0,
      updated: 0,
      errors: [{ line: "(catálogo)", reason: cardsErr.message }],
    };
  }

  const codeToId = new Map(cards?.map((c) => [c.card_code, c.id]) ?? []);

  const cardIds = parsed.entries
    .map(
      (e) => codeToId.get(`${e.abbr}-${String(e.number).padStart(2, "0")}`),
    )
    .filter((id): id is string => Boolean(id));

  if (cardIds.length === 0) {
    return { ok: false, added: 0, updated: 0, errors: parsed.errors };
  }

  // Determine added vs updated by checking existing rows up front.
  let existingIds: string[] = [];
  if (kind === "needed") {
    const { data } = await supabase
      .from("user_card_needs")
      .select("card_id")
      .eq("user_id", user.id)
      .in("card_id", cardIds);
    existingIds = (data ?? []).map((r) => r.card_id);
  } else {
    const { data } = await supabase
      .from("user_card_duplicates")
      .select("card_id")
      .eq("user_id", user.id)
      .in("card_id", cardIds);
    existingIds = (data ?? []).map((r) => r.card_id);
  }
  const existingSet = new Set(existingIds);

  let updated = 0;
  let added = 0;

  if (kind === "needed") {
    const rows = parsed.entries
      .map((e) => {
        const id = codeToId.get(
          `${e.abbr}-${String(e.number).padStart(2, "0")}`,
        );
        if (!id) return null;
        if (existingSet.has(id)) updated += 1;
        else added += 1;
        return {
          user_id: user.id,
          card_id: id,
          quantity_needed: e.quantity,
        };
      })
      .filter(
        (r): r is {
          user_id: string;
          card_id: string;
          quantity_needed: number;
        } => r !== null,
      );

    const { error } = await supabase
      .from("user_card_needs")
      .upsert(rows, { onConflict: "user_id,card_id" });
    if (error) {
      return {
        ok: false,
        added: 0,
        updated: 0,
        errors: [{ line: "(guardado)", reason: error.message }],
      };
    }
  } else {
    const rows = parsed.entries
      .map((e) => {
        const id = codeToId.get(
          `${e.abbr}-${String(e.number).padStart(2, "0")}`,
        );
        if (!id) return null;
        if (existingSet.has(id)) updated += 1;
        else added += 1;
        return {
          user_id: user.id,
          card_id: id,
          quantity_available: e.quantity,
        };
      })
      .filter(
        (r): r is {
          user_id: string;
          card_id: string;
          quantity_available: number;
        } => r !== null,
      );

    const { error } = await supabase
      .from("user_card_duplicates")
      .upsert(rows, { onConflict: "user_id,card_id" });
    if (error) {
      return {
        ok: false,
        added: 0,
        updated: 0,
        errors: [{ line: "(guardado)", reason: error.message }],
      };
    }
  }

  if (added > 0) {
    const newCardIds = cardIds.filter((id) => !existingSet.has(id));
    await notifyMatchedUsers(newCardIds, kind, supabase);
  }

  revalidatePath("/album");
  return { ok: true, added, updated, errors: parsed.errors };
}

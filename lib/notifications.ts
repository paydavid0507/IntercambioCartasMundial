import type { SupabaseClient } from "@supabase/supabase-js";

type CardKind = "needed" | "duplicate";

/**
 * After a user adds NEW cards to their album, notify all counterparts who
 * have a fresh match and have opted in to notifications.
 *
 * kind="duplicate"  → actor added duplicates → notify users who need those cards
 * kind="needed"     → actor added needs      → notify users who have those duplicates
 *
 * One inbox message per matched user, summarising the total card count.
 * If the actor has a public WhatsApp, a wa.me link is included in the body.
 *
 * The actor's identity is derived from the authenticated session on the
 * supplied Supabase client — no actorId parameter is accepted to prevent
 * accidental misuse with a spoofed ID.
 */
export async function notifyMatchedUsers(
  newCardIds: string[],
  kind: CardKind,
  supabase: SupabaseClient,
): Promise<void> {
  if (newCardIds.length === 0) return;

  // Derive actor from the authenticated session — never from a caller-supplied ID.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const actorId = user.id;

  // Actor's public profile
  const { data: actor } = await supabase
    .from("profiles")
    .select("display_name, whatsapp, show_contact")
    .eq("id", actorId)
    .maybeSingle();

  if (!actor) return;

  // Find which users are affected by the new cards
  const table =
    kind === "duplicate" ? "user_card_needs" : "user_card_duplicates";

  const { data: rows } = await supabase
    .from(table)
    .select("user_id")
    .in("card_id", newCardIds)
    .neq("user_id", actorId);

  if (!rows || rows.length === 0) return;

  // Count matches per user
  const countByUser = new Map<string, number>();
  for (const r of rows) {
    countByUser.set(r.user_id, (countByUser.get(r.user_id) ?? 0) + 1);
  }

  const candidateIds = Array.from(countByUser.keys());

  // Filter to users who have notifications enabled
  const { data: notifiableProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .in("id", candidateIds)
    .eq("notify_matches", true);

  if (profilesError) {
    console.error("[notifications] Error fetching notifiable profiles:", profilesError.message);
    return;
  }

  if (!notifiableProfiles || notifiableProfiles.length === 0) return;

  const waLine =
    actor.show_contact && actor.whatsapp
      ? `\nWhatsApp: https://wa.me/${actor.whatsapp.replace(/[^0-9]/g, "")}`
      : "";

  const messages = notifiableProfiles.map(({ id: recipientId }) => {
    const n = countByUser.get(recipientId) ?? 1;
    const cards = `${n} carta${n === 1 ? "" : "s"}`;

    const body =
      kind === "duplicate"
        ? `🔔 ${actor.display_name} tiene ${cards} que te faltan. Entra a Intercambios para ver el detalle.${waLine}`
        : `🔔 ${actor.display_name} necesita ${cards} que tú tienes de sobra. Entra a Intercambios para ver el detalle.${waLine}`;

    return {
      sender_id: actorId,
      recipient_id: recipientId,
      body: body.slice(0, 1000),
    };
  });

  const { error: insertError } = await supabase.from("messages").insert(messages);
  if (insertError) {
    console.error("[notifications] Error inserting messages:", insertError.message);
  }
}

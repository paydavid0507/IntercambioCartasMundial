"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(
  recipientId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para enviar mensajes." };
  if (user.id === recipientId) return { ok: false, error: "No puedes enviarte mensajes a ti mismo." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "El mensaje no puede estar vacío." };
  if (trimmed.length > 1000) return { ok: false, error: "Máximo 1000 caracteres." };

  // Rate limit: max 10 messages sent per hour
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count: recentCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id)
    .gte("created_at", oneHourAgo);
  if ((recentCount ?? 0) >= 10) {
    return { ok: false, error: "Límite alcanzado. Puedes enviar hasta 10 mensajes por hora." };
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    body: trimmed,
  });

  if (error) return { ok: false, error: "No se pudo enviar el mensaje." };
  revalidatePath("/mensajes");
  return { ok: true };
}

export async function markAsRead(
  messageId: string,
): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  revalidatePath("/mensajes");
  return { ok: true };
}

export async function clearBox(
  box: "inbox" | "outbox",
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const filter = box === "inbox" ? "recipient_id" : "sender_id";
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq(filter, user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/mensajes");
  return { ok: true };
}

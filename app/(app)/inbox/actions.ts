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

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    body: trimmed,
  });

  if (error) return { ok: false, error: "No se pudo enviar el mensaje." };
  revalidatePath("/inbox");
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

  revalidatePath("/inbox");
  return { ok: true };
}

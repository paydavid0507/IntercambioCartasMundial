import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "./InboxClient";

export const metadata = { title: "Mensajes · Intercambia Mundial 2026" };

export type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_slug: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default async function InboxPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rawMessages } = await supabase
    .from("messages")
    .select("id, sender_id, body, read_at, created_at")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const msgs = rawMessages ?? [];
  const senderIds = [...new Set(msgs.map((m) => m.sender_id))];

  const profileMap = new Map<string, { display_name: string; share_slug: string }>();
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, share_slug")
      .in("id", senderIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { display_name: p.display_name, share_slug: p.share_slug });
    }
  }

  const messages: Message[] = msgs.map((r) => ({
    id: r.id,
    sender_id: r.sender_id,
    sender_name: profileMap.get(r.sender_id)?.display_name ?? "Usuario",
    sender_slug: profileMap.get(r.sender_id)?.share_slug ?? "",
    body: r.body,
    read_at: r.read_at,
    created_at: r.created_at,
  }));

  const unread = messages.filter((m) => !m.read_at).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          Mensajes
          {unread > 0 && (
            <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-sm font-medium text-white">
              {unread}
            </span>
          )}
        </h1>
        <p className="text-sm text-slate-500">
          Mensajes recibidos de otros usuarios.
        </p>
      </header>

      <InboxClient messages={messages} />
    </div>
  );
}

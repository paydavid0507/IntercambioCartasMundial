import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "./InboxClient";

export const metadata = { title: "Mensajes · Intercambia Mundial 2026" };

export type Message = {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_slug: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export default async function InboxPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: rawInbox }, { data: rawOutbox }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, sender_id, body, read_at, created_at")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("messages")
      .select("id, recipient_id, body, created_at")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Collect all contact IDs to fetch profiles in one query
  const inboxContactIds = (rawInbox ?? []).map((m) => m.sender_id);
  const outboxContactIds = (rawOutbox ?? []).map((m: { recipient_id: string }) => m.recipient_id);
  const allContactIds = [...new Set([...inboxContactIds, ...outboxContactIds])];

  const profileMap = new Map<string, { display_name: string; share_slug: string }>();
  if (allContactIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, share_slug")
      .in("id", allContactIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { display_name: p.display_name, share_slug: p.share_slug });
    }
  }

  const inbox: Message[] = (rawInbox ?? []).map((r) => ({
    id: r.id,
    contact_id: r.sender_id,
    contact_name: profileMap.get(r.sender_id)?.display_name ?? "Usuario",
    contact_slug: profileMap.get(r.sender_id)?.share_slug ?? "",
    body: r.body,
    read_at: r.read_at,
    created_at: r.created_at,
  }));

  const outbox: Message[] = (rawOutbox ?? []).map((r: { id: string; recipient_id: string; body: string; created_at: string }) => ({
    id: r.id,
    contact_id: r.recipient_id,
    contact_name: profileMap.get(r.recipient_id)?.display_name ?? "Usuario",
    contact_slug: profileMap.get(r.recipient_id)?.share_slug ?? "",
    body: r.body,
    read_at: "read",
    created_at: r.created_at,
  }));

  const unread = inbox.filter((m) => !m.read_at).length;

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <span className="mt-2 h-7 w-[3px] flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h1 className="flex items-center gap-3 font-display text-4xl tracking-wide text-slate-900">
            MENSAJES
            {unread > 0 && (
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 font-sans text-sm font-bold text-slate-950">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">Máximo 10 mensajes por bandeja.</p>
        </div>
      </header>

      <InboxClient inbox={inbox} outbox={outbox} />
    </div>
  );
}

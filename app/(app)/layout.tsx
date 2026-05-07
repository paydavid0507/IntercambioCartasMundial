import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { UnreadProvider } from "@/components/UnreadProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null),
  ]);

  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "Usuario";

  return (
    <UnreadProvider initialCount={unreadCount ?? 0} userId={user.id}>
      <div className="flex min-h-screen flex-col">
        <Navbar displayName={displayName} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 sm:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </UnreadProvider>
  );
}

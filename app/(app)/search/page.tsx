import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SearchClient } from "./SearchClient";

export default async function SearchPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl tracking-wide text-slate-900">BUSCAR</h1>
        <p className="text-sm text-slate-500">
          Por carta (ej: <code className="rounded bg-slate-100 px-1 font-mono text-xs">MEX-05</code>), equipo, usuario, ciudad o país.
        </p>
      </header>
      <SearchClient currentUserId={user.id} />
    </div>
  );
}

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
      <header className="flex items-start gap-3">
        <span className="mt-2 h-7 w-[3px] flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h1 className="font-display text-4xl tracking-wide text-slate-900">BUSCAR</h1>
          <p className="text-sm text-slate-500">
            Por carta (ej: <code className="rounded bg-slate-100 px-1 font-mono text-xs">MEX-05</code>), equipo, usuario, ciudad o país.
          </p>
        </div>
      </header>
      <SearchClient currentUserId={user.id} />
    </div>
  );
}

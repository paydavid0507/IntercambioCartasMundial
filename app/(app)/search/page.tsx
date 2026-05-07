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
      <header className="page-header">
        <span className="page-header-bar" />
        <div>
          <h1 className="page-title">BUSCAR</h1>
          <p className="page-subtitle">
            Por carta (ej: <code className="rounded bg-slate-100 px-1 font-mono text-xs">MEX-05</code>), equipo, usuario, ciudad o país.
          </p>
        </div>
      </header>
      <SearchClient currentUserId={user.id} />
    </div>
  );
}

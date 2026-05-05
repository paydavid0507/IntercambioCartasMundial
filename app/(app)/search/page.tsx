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
        <h1 className="text-2xl font-bold">Buscar</h1>
        <p className="text-sm text-slate-500">
          Busca por carta (ej: <code>MEX-05</code>), abreviación, usuario,
          ciudad o país.
        </p>
      </header>
      <SearchClient currentUserId={user.id} />
    </div>
  );
}

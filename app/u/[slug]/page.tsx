import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, city, country")
    .eq("share_slug", params.slug)
    .maybeSingle();
  if (!profile) return { title: "Perfil" };

  return {
    title: `${profile.display_name} · Intercambia Mundial 2026`,
    description: `Cartas faltantes y repetidas de ${profile.display_name} (${[
      profile.city,
      profile.country,
    ]
      .filter(Boolean)
      .join(", ")}).`,
  };
}

type CardJoin = {
  card_id: string;
  cards: { card_code: string } | null;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Params;
}) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("share_slug", params.slug)
    .maybeSingle();

  if (!profile) notFound();

  const [{ data: needsData }, { data: dupsData }] = await Promise.all([
    supabase
      .from("user_card_needs")
      .select("card_id, quantity_needed, cards(card_code)")
      .eq("user_id", profile.id),
    supabase
      .from("user_card_duplicates")
      .select("card_id, quantity_available, cards(card_code)")
      .eq("user_id", profile.id),
  ]);

  const needs = ((needsData ?? []) as unknown as Array<
    CardJoin & { quantity_needed: number }
  >)
    .filter((r) => r.cards)
    .map((r) => ({ code: r.cards!.card_code, qty: r.quantity_needed }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const duplicates = ((dupsData ?? []) as unknown as Array<
    CardJoin & { quantity_available: number }
  >)
    .filter((r) => r.cards)
    .map((r) => ({ code: r.cards!.card_code, qty: r.quantity_available }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const totalNeeded = needs.reduce((a, n) => a + n.qty, 0);
  const totalDuplicates = duplicates.reduce((a, n) => a + n.qty, 0);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8">
      <div className="mb-4 flex items-center justify-between text-sm">
        <Link href="/" className="text-brand-700 hover:underline">
          ← Intercambia Mundial 2026
        </Link>
      </div>

      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {[profile.city, profile.country].filter(Boolean).join(", ") ||
            "Ubicación no indicada"}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Stat label="Faltantes" value={totalNeeded} />
          <Stat label="Repetidas" value={totalDuplicates} />
          <Stat label="Cartas únicas faltantes" value={needs.length} />
          <Stat label="Cartas únicas repetidas" value={duplicates.length} />
        </div>
        {profile.show_contact && profile.whatsapp ? (
          <div className="mt-4">
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Contactar por WhatsApp
            </a>
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-500">
            El usuario no ha publicado su contacto.
          </p>
        )}
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CardListSection
          title={`Faltantes (${needs.length})`}
          rows={needs}
          empty="No hay cartas faltantes registradas."
        />
        <CardListSection
          title={`Repetidas (${duplicates.length})`}
          rows={duplicates}
          empty="No hay cartas repetidas registradas."
        />
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Este perfil es público. Datos generados por el propio usuario.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-md bg-slate-100 px-3 py-1.5 text-slate-700">
      <span className="font-semibold">{value}</span>{" "}
      <span className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </span>
  );
}

function CardListSection({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { code: string; qty: number }[];
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
          {rows.map((r) => (
            <li
              key={r.code}
              className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1 font-mono"
            >
              <span>{r.code}</span>
              <span className="text-slate-600">x{r.qty}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

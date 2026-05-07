import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { CardForm } from "@/components/CardForm";
import { CardList, type CardRow } from "@/components/CardList";
import { QuickPaste } from "@/components/QuickPaste";

// Supabase JS cannot infer nested join shapes from the select string, so we
// define the expected row shapes explicitly and cast once via these helpers.
type NeedsRow = {
  card_id: string;
  quantity_needed: number;
  cards: { card_code: string; team_abbr: string; card_number: number } | null;
};

type DupRow = {
  card_id: string;
  quantity_available: number;
  cards: { card_code: string; team_abbr: string; card_number: number } | null;
};

function asNeedsRows(data: unknown): NeedsRow[] {
  return (data ?? []) as NeedsRow[];
}

function asDupRows(data: unknown): DupRow[] {
  return (data ?? []) as DupRow[];
}

export default async function AlbumPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: needsData }, { data: dupsData }] = await Promise.all([
    supabase
      .from("user_card_needs")
      .select("card_id, quantity_needed, cards(card_code, team_abbr, card_number)")
      .eq("user_id", user.id)
      .order("card_id"),
    supabase
      .from("user_card_duplicates")
      .select("card_id, quantity_available, cards(card_code, team_abbr, card_number)")
      .eq("user_id", user.id)
      .order("card_id"),
  ]);

  const needs: CardRow[] = asNeedsRows(needsData)
    .filter((r) => r.cards !== null)
    .map((r) => ({
      card_id: r.card_id,
      card_code: r.cards!.card_code,
      team_abbr: r.cards!.team_abbr,
      card_number: r.cards!.card_number,
      quantity: r.quantity_needed,
    }))
    .sort((a, b) => a.card_code.localeCompare(b.card_code));

  const duplicates: CardRow[] = asDupRows(dupsData)
    .filter((r) => r.cards !== null)
    .map((r) => ({
      card_id: r.card_id,
      card_code: r.cards!.card_code,
      team_abbr: r.cards!.team_abbr,
      card_number: r.cards!.card_number,
      quantity: r.quantity_available,
    }))
    .sort((a, b) => a.card_code.localeCompare(b.card_code));

  const totalNeeded = needs.reduce((acc, r) => acc + r.quantity, 0);
  const totalDuplicates = duplicates.reduce((acc, r) => acc + r.quantity, 0);
  const uniqueDuplicates = duplicates.length;

  return (
    <div className="space-y-6">
      <header className="page-header">
        <span className="page-header-bar" />
        <div>
          <h1 className="page-title">MI ÁLBUM</h1>
          <p className="page-subtitle">Administra tus cartas faltantes y repetidas.</p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <SummaryItem label="Faltantes" value={totalNeeded} sub={`${needs.length} únicas`} />
        <SummaryItem label="Repetidas" value={totalDuplicates} sub={`${uniqueDuplicates} únicas`} />
        <SummaryItem label="Total" value={totalNeeded + totalDuplicates} sub="registradas" />
      </section>

      <Tabs defaultValue="needs">
        <TabsList>
          <TabsTrigger value="needs">Faltantes ({needs.length})</TabsTrigger>
          <TabsTrigger value="duplicates">
            Repetidas ({duplicates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="needs" className="space-y-4">
          <CardForm kind="needed" />
          <QuickPaste kind="needed" />
          <CardList kind="needed" rows={needs} />
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <CardForm kind="duplicate" />
          <QuickPaste kind="duplicate" />
          <CardList kind="duplicate" rows={duplicates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  const variant =
    label === "Faltantes"
      ? "stat-card-faltantes"
      : label === "Repetidas"
        ? "stat-card-repetidas"
        : "stat-card-total";

  return (
    <div className={`stat-card ${variant}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:text-xs">{label}</p>
      <p className="mt-0.5 font-display text-3xl tracking-wide text-slate-900 sm:text-4xl">{value}</p>
      <p className="text-[10px] text-slate-400 sm:text-xs">{sub}</p>
    </div>
  );
}

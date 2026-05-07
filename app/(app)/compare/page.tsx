import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ExchangeActions } from "./ExchangeActions";
import { ExchangeColumn } from "./ExchangeColumn";

type Direct = {
  seeker_user_id: string;
  owner_user_id: string;
  card_code: string;
  team_abbr: string;
  card_number: number;
  possible_quantity: number;
};

type Summary = {
  seeker_user_id: string;
  owner_user_id: string;
  owner_display_name: string;
  city: string | null;
  country: string | null;
  whatsapp: string | null;
  share_slug: string;
  cards_owner_can_give: number;
  total_owner_can_give: number;
  cards_seeker_can_give: number;
  total_seeker_can_give: number;
  match_type: "MUTUAL" | "DIRECT" | "NONE";
};

export default async function ComparePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: summaryData }, { data: ownerToMe }, { data: meToSeeker }] =
    await Promise.all([
      // People that can give cards to me.
      supabase
        .from("v_user_match_summary")
        .select("*")
        .eq("seeker_user_id", user.id),
      // Cards each owner can give me.
      supabase
        .from("v_direct_card_matches")
        .select(
          "seeker_user_id, owner_user_id, card_code, team_abbr, card_number, possible_quantity",
        )
        .eq("seeker_user_id", user.id),
      // Cards I can give to each seeker.
      supabase
        .from("v_direct_card_matches")
        .select(
          "seeker_user_id, owner_user_id, card_code, team_abbr, card_number, possible_quantity",
        )
        .eq("owner_user_id", user.id),
    ]);

  const summaries = ((summaryData ?? []) as Summary[]).slice();
  summaries.sort((a, b) => {
    const tier = (s: Summary) =>
      s.match_type === "MUTUAL" ? 0 : s.match_type === "DIRECT" ? 1 : 2;
    if (tier(a) !== tier(b)) return tier(a) - tier(b);
    if (a.total_owner_can_give !== b.total_owner_can_give) {
      return b.total_owner_can_give - a.total_owner_can_give;
    }
    if (a.total_seeker_can_give !== b.total_seeker_can_give) {
      return b.total_seeker_can_give - a.total_seeker_can_give;
    }
    return a.owner_display_name.localeCompare(b.owner_display_name);
  });

  // Group cards by counterpart user_id for quick lookup.
  const ownerCards = new Map<string, Direct[]>();
  for (const r of (ownerToMe ?? []) as Direct[]) {
    const list = ownerCards.get(r.owner_user_id) ?? [];
    list.push(r);
    ownerCards.set(r.owner_user_id, list);
  }
  const myCards = new Map<string, Direct[]>();
  for (const r of (meToSeeker ?? []) as Direct[]) {
    const list = myCards.get(r.seeker_user_id) ?? [];
    list.push(r);
    myCards.set(r.seeker_user_id, list);
  }

  // For mutual matches, show pure direct rows for the seeker side as well so
  // the user sees both columns even if the summary view says NONE.
  const allCounterpartIds = new Set<string>([
    ...summaries.map((s) => s.owner_user_id),
    ...Array.from(myCards.keys()),
  ]);

  // Fetch profile data for any seeker-only matches we don't yet have a summary
  // row for, so we can render them too.
  const missingProfiles = Array.from(allCounterpartIds).filter(
    (id) => !summaries.some((s) => s.owner_user_id === id),
  );
  const profileMap = new Map<
    string,
    Pick<
      Summary,
      "owner_display_name" | "city" | "country" | "whatsapp" | "share_slug"
    >
  >();

  if (missingProfiles.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name, city, country, whatsapp, show_contact, share_slug")
      .in("id", missingProfiles);
    for (const p of profilesData ?? []) {
      profileMap.set(p.id, {
        owner_display_name: p.display_name,
        city: p.city,
        country: p.country,
        whatsapp: p.show_contact ? p.whatsapp : null,
        share_slug: p.share_slug,
      });
    }

    // Append synthetic seeker-only rows.
    for (const id of missingProfiles) {
      const prof = profileMap.get(id);
      if (!prof) continue;
      const myList = myCards.get(id) ?? [];
      const total = myList.reduce((a, c) => a + c.possible_quantity, 0);
      summaries.push({
        seeker_user_id: user.id,
        owner_user_id: id,
        cards_owner_can_give: 0,
        total_owner_can_give: 0,
        cards_seeker_can_give: myList.length,
        total_seeker_can_give: total,
        match_type: "NONE",
        ...prof,
      });
    }
    // Re-sort with the new entries.
    summaries.sort((a, b) => {
      const tier = (s: Summary) =>
        s.match_type === "MUTUAL"
          ? 0
          : s.match_type === "DIRECT"
            ? 1
            : 2;
      if (tier(a) !== tier(b)) return tier(a) - tier(b);
      if (a.total_owner_can_give !== b.total_owner_can_give) {
        return b.total_owner_can_give - a.total_owner_can_give;
      }
      if (a.total_seeker_can_give !== b.total_seeker_can_give) {
        return b.total_seeker_can_give - a.total_seeker_can_give;
      }
      return a.owner_display_name.localeCompare(b.owner_display_name);
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <span className="mt-2 h-7 w-[3px] flex-shrink-0 rounded-full bg-amber-400" />
        <div>
          <h1 className="font-display text-4xl tracking-wide text-slate-900">INTERCAMBIOS</h1>
          <p className="text-sm text-slate-500">Mutuas primero, luego directas, al final solo tú das.</p>
        </div>
      </header>

      {summaries.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Aún no hay coincidencias. Agrega más cartas faltantes y repetidas
          para empezar a ver intercambios.
        </p>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => {
            const ownerList = ownerCards.get(s.owner_user_id) ?? [];
            const myList = myCards.get(s.owner_user_id) ?? [];
            return (
              <Card key={`${s.owner_user_id}`} className={
                s.match_type === "MUTUAL"
                  ? "border-l-[3px] border-l-green-400"
                  : s.match_type === "DIRECT"
                    ? "border-l-[3px] border-l-sky-400"
                    : ""
              }>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle>{s.owner_display_name}</CardTitle>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {[s.city, s.country].filter(Boolean).join(", ") ||
                        "Ubicación no indicada"}
                    </p>
                  </div>
                  <MatchBadge type={s.match_type} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ExchangeColumn
                      title={`${s.owner_display_name} puede darte`}
                      cards={ownerList}
                      empty="No tiene cartas que te falten."
                    />
                    <ExchangeColumn
                      title="Tú puedes darle"
                      cards={myList}
                      empty="No tienes repetidas que necesite."
                    />
                  </div>

                  <ExchangeActions
                    shareSlug={s.share_slug}
                    recipientId={s.owner_user_id}
                    recipientName={s.owner_display_name}
                    whatsapp={s.whatsapp}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchBadge({ type }: { type: Summary["match_type"] }) {
  const styles =
    type === "MUTUAL"
      ? "bg-green-100 text-green-800 ring-1 ring-green-300 shadow-sm shadow-green-100"
      : type === "DIRECT"
        ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
        : "bg-slate-100 text-slate-600";
  const label =
    type === "MUTUAL"
      ? "⇄ Mutua"
      : type === "DIRECT"
        ? "→ Directa"
        : "Solo tú das";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}


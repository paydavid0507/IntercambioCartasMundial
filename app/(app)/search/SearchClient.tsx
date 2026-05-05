"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { tokenizeSearch } from "@/lib/utils";

type ProfileResult = {
  id: string;
  display_name: string;
  city: string | null;
  country: string | null;
  share_slug: string;
};

type CardOwnerResult = {
  card_code: string;
  user_id: string;
  display_name: string;
  city: string | null;
  country: string | null;
  share_slug: string;
  side: "needed" | "duplicate";
  quantity: number;
};

export function SearchClient({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [profiles, setProfiles] = React.useState<ProfileResult[]>([]);
  const [cardOwners, setCardOwners] = React.useState<CardOwnerResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    if (!debounced) {
      setProfiles([]);
      setCardOwners([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const tokens = tokenizeSearch(debounced);

      // 1) Profile search by name / city / country.
      // Strip characters with special meaning in PostgREST .or() syntax and LIKE wildcards.
      const safe = debounced.replace(/[(),:*%_\\]/g, " ").trim();
      const profileQuery = supabase
        .from("profiles")
        .select("id, display_name, city, country, share_slug")
        .or(
          [
            `display_name.ilike.%${safe}%`,
            `city.ilike.%${safe}%`,
            `country.ilike.%${safe}%`,
            `share_slug.ilike.%${safe}%`,
          ].join(","),
        )
        .neq("id", currentUserId)
        .limit(15);

      // 2) Card-owner search.
      let cardCodeFilter: { team_abbr?: string; card_number?: number; card_code?: string } | null = null;
      if (tokens.cardCode) {
        cardCodeFilter = { card_code: tokens.cardCode };
      } else if (tokens.abbr && tokens.number === undefined) {
        cardCodeFilter = { team_abbr: tokens.abbr };
      }

      let cardOwnerRows: CardOwnerResult[] = [];
      if (cardCodeFilter) {
        // Find the matching cards first.
        let cardsQ = supabase.from("cards").select("id, card_code");
        if (cardCodeFilter.card_code) {
          cardsQ = cardsQ.eq("card_code", cardCodeFilter.card_code);
        } else if (cardCodeFilter.team_abbr) {
          cardsQ = cardsQ.eq("team_abbr", cardCodeFilter.team_abbr);
        }

        const { data: cards } = await cardsQ.limit(50);
        const cardIdToCode = new Map<string, string>(
          (cards ?? []).map((c) => [c.id, c.card_code]),
        );
        const cardIds = Array.from(cardIdToCode.keys());

        if (cardIds.length > 0) {
          const [{ data: dups }, { data: needs }] = await Promise.all([
            supabase
              .from("user_card_duplicates")
              .select(
                "card_id, user_id, quantity_available, profiles(display_name, city, country, share_slug)",
              )
              .in("card_id", cardIds)
              .neq("user_id", currentUserId)
              .limit(50),
            supabase
              .from("user_card_needs")
              .select(
                "card_id, user_id, quantity_needed, profiles(display_name, city, country, share_slug)",
              )
              .in("card_id", cardIds)
              .neq("user_id", currentUserId)
              .limit(50),
          ]);

          const fromDups: CardOwnerResult[] = ((dups ?? []) as unknown as Array<{
            card_id: string;
            user_id: string;
            quantity_available: number;
            profiles: {
              display_name: string;
              city: string | null;
              country: string | null;
              share_slug: string;
            } | null;
          }>)
            .filter((r) => r.profiles)
            .map((r) => ({
              card_code: cardIdToCode.get(r.card_id) ?? "",
              user_id: r.user_id,
              display_name: r.profiles!.display_name,
              city: r.profiles!.city,
              country: r.profiles!.country,
              share_slug: r.profiles!.share_slug,
              side: "duplicate" as const,
              quantity: r.quantity_available,
            }));

          const fromNeeds: CardOwnerResult[] = ((needs ?? []) as unknown as Array<{
            card_id: string;
            user_id: string;
            quantity_needed: number;
            profiles: {
              display_name: string;
              city: string | null;
              country: string | null;
              share_slug: string;
            } | null;
          }>)
            .filter((r) => r.profiles)
            .map((r) => ({
              card_code: cardIdToCode.get(r.card_id) ?? "",
              user_id: r.user_id,
              display_name: r.profiles!.display_name,
              city: r.profiles!.city,
              country: r.profiles!.country,
              share_slug: r.profiles!.share_slug,
              side: "needed" as const,
              quantity: r.quantity_needed,
            }));

          cardOwnerRows = [...fromDups, ...fromNeeds].sort((a, b) =>
            a.card_code.localeCompare(b.card_code),
          );
        }
      }

      const { data: profilesData } = await profileQuery;

      if (cancelled) return;

      setProfiles((profilesData ?? []) as ProfileResult[]);
      setCardOwners(cardOwnerRows);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, supabase, currentUserId]);

  return (
    <div className="space-y-6">
      <Input
        autoFocus
        type="search"
        placeholder="Ej: MEX-05, ARG, Tegucigalpa, david..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Buscando...</p>
      ) : null}

      {!loading && debounced && profiles.length === 0 && cardOwners.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Sin resultados para <span className="font-mono">{debounced}</span>.
        </p>
      ) : null}

      {profiles.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Usuarios
          </h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {profiles.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div>
                  <p className="font-medium">{p.display_name}</p>
                  <p className="text-sm text-slate-500">
                    {[p.city, p.country].filter(Boolean).join(", ") ||
                      "Ubicación no indicada"}
                  </p>
                </div>
                <Link
                  href={`/u/${p.share_slug}`}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Ver perfil
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cardOwners.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Cartas
          </h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {cardOwners.map((r, i) => (
              <li
                key={`${r.user_id}-${r.card_code}-${r.side}-${i}`}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
                    {r.card_code}
                  </span>
                  <div>
                    <p className="font-medium">{r.display_name}</p>
                    <p className="text-sm text-slate-500">
                      {[r.city, r.country].filter(Boolean).join(", ") ||
                        "Ubicación no indicada"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.side === "duplicate"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {r.side === "duplicate"
                      ? `Repetida x${r.quantity}`
                      : `La necesita x${r.quantity}`}
                  </span>
                  <Link
                    href={`/u/${r.share_slug}`}
                    className="text-xs text-brand-700 hover:underline"
                  >
                    Ver perfil
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

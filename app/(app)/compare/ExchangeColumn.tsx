"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type CardEntry = {
  card_code: string;
  team_abbr: string;
  card_number: number;
  possible_quantity: number;
};

export function ExchangeColumn({
  title,
  cards,
  empty,
}: {
  title: string;
  cards: CardEntry[];
  empty: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const groups = new Map<string, CardEntry[]>();
  for (const c of [...cards].sort((a, b) =>
    a.card_code.localeCompare(b.card_code)
  )) {
    const list = groups.get(c.team_abbr) ?? [];
    list.push(c);
    groups.set(c.team_abbr, list);
  }
  const teamEntries = Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {cards.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <>
          <div
            className={cn(
              "overflow-y-auto rounded-md pr-0.5",
              isExpanded ? "max-h-[60vh]" : "max-h-48"
            )}
            style={{ minHeight: "5rem" }}
          >
            <div className="space-y-2">
              {teamEntries.map(([team, teamCards]) => (
                <div key={team}>
                  <p className="mb-1 font-mono text-xs font-semibold text-slate-500">
                    {team}
                    <span className="ml-1 font-normal text-slate-400">
                      · {teamCards.length}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {teamCards.map((c) => (
                      <span
                        key={c.card_code}
                        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-700"
                      >
                        {String(c.card_number).padStart(2, "0")}
                        {c.possible_quantity > 1 && (
                          <span className="ml-0.5 text-slate-400">
                            ×{c.possible_quantity}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((p) => !p)}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-white py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver todo · {cards.length}{" "}
                {cards.length === 1 ? "carta" : "cartas"}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

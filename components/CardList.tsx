"use client";

import * as React from "react";
import { Check, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  bulkDeleteCards,
  deleteCard,
  upsertCard,
  type CardKind,
} from "@/app/(app)/album/actions";

export type CardRow = {
  card_id: string;
  card_code: string;
  team_abbr: string;
  card_number: number;
  quantity: number;
};

function groupByTeam(rows: CardRow[]): [string, CardRow[]][] {
  const map = new Map<string, CardRow[]>();
  for (const row of rows) {
    const group = map.get(row.team_abbr) ?? [];
    group.push(row);
    map.set(row.team_abbr, group);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function CardList({ kind, rows }: { kind: CardKind; rows: CardRow[] }) {
  const [filter, setFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [bulkPending, startBulkTransition] = React.useTransition();
  const [bulkError, setBulkError] = React.useState<string | null>(null);
  const [listExpanded, setListExpanded] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.team_abbr.toLowerCase().includes(q) ||
        r.card_code.toLowerCase().includes(q) ||
        String(r.card_number).includes(q),
    );
  }, [filter, rows]);

  const groups = React.useMemo(() => groupByTeam(filtered), [filtered]);

  const allIds = React.useMemo(() => filtered.map((r) => r.card_id), [filtered]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleTeam(teamIds: string[]) {
    const allIn = teamIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allIn) teamIds.forEach((id) => next.delete(id));
      else teamIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function onBulkDelete() {
    const ids = [...selected];
    const label =
      ids.length === rows.length ? "todas las cartas" : `${ids.length} carta(s)`;
    if (!confirm(`¿Eliminar ${label}?`)) return;
    setBulkError(null);
    startBulkTransition(async () => {
      const res = await bulkDeleteCards(kind, ids);
      if (!res.ok) setBulkError(res.error);
      else setSelected(new Set());
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        Aún no has agregado cartas en esta sección.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Filtrar (ej: ARG, MEX-05, 07)"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSelected(new Set());
            setExpandedId(null);
          }}
          className="flex-1"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={allSelected}
            onChange={toggleAll}
          />
          {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
          <span className="text-slate-400">({filtered.length})</span>
        </label>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {bulkError && (
              <span className="text-sm text-red-600">{bulkError}</span>
            )}
            <Button
              size="sm"
              variant="danger"
              disabled={bulkPending}
              onClick={onBulkDelete}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {bulkPending
                ? "Eliminando..."
                : `Eliminar (${selected.size})`}
            </Button>
          </div>
        )}
      </div>

      {/* Grupos por equipo */}
      {groups.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Sin resultados para <span className="font-mono">&ldquo;{filter}&rdquo;</span>.
        </p>
      )}

      {groups.length > 0 && (
        <>
          <div
            className={cn(
              "overflow-y-auto rounded-md pr-0.5",
              listExpanded ? "max-h-[70vh]" : "max-h-64"
            )}
            style={{ minHeight: "7rem" }}
          >
            <div className="space-y-2">
              {groups.map(([team, cards]) => (
                <TeamSection
                  key={team}
                  kind={kind}
                  team={team}
                  cards={cards}
                  selected={selected}
                  expandedId={expandedId}
                  onToggleOne={toggleOne}
                  onToggleTeam={() => toggleTeam(cards.map((c) => c.card_id))}
                  onExpand={(id) =>
                    setExpandedId((prev) => (prev === id ? null : id))
                  }
                  onCollapse={() => setExpandedId(null)}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setListExpanded((p) => !p)}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            {listExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver todo · {rows.length} {rows.length === 1 ? "carta" : "cartas"}
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

function TeamSection({
  kind,
  team,
  cards,
  selected,
  expandedId,
  onToggleOne,
  onToggleTeam,
  onExpand,
  onCollapse,
}: {
  kind: CardKind;
  team: string;
  cards: CardRow[];
  selected: Set<string>;
  expandedId: string | null;
  onToggleOne: (id: string) => void;
  onToggleTeam: () => void;
  onExpand: (id: string) => void;
  onCollapse: () => void;
}) {
  const teamIds = cards.map((c) => c.card_id);
  const allTeamSelected = teamIds.every((id) => selected.has(id));
  const someTeamSelected = teamIds.some((id) => selected.has(id));
  const expandedCard = cards.find((c) => c.card_id === expandedId) ?? null;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Cabecera del equipo */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300"
          checked={allTeamSelected}
          ref={(el) => {
            if (el) el.indeterminate = someTeamSelected && !allTeamSelected;
          }}
          onChange={onToggleTeam}
        />
        <span className="font-mono text-sm font-semibold text-slate-800">
          {team}
        </span>
        <span className="text-xs text-slate-400">
          · {cards.length} {cards.length === 1 ? "carta" : "cartas"}
        </span>
      </div>

      {/* Grid de chips */}
      <div className="flex flex-wrap gap-1.5 p-3">
        {cards.map((card) => (
          <CardChip
            key={card.card_id}
            card={card}
            isSelected={selected.has(card.card_id)}
            isExpanded={expandedId === card.card_id}
            onToggleSelect={() => onToggleOne(card.card_id)}
            onExpand={() => onExpand(card.card_id)}
          />
        ))}
      </div>

      {/* Panel de edición inline */}
      {expandedCard && (
        <EditPanel
          kind={kind}
          card={expandedCard}
          onClose={onCollapse}
        />
      )}
    </div>
  );
}

function CardChip({
  card,
  isSelected,
  isExpanded,
  onToggleSelect,
  onExpand,
}: {
  card: CardRow;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onExpand: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
        isExpanded
          ? "border-amber-400 bg-amber-50"
          : isSelected
          ? "border-brand-400 bg-brand-50"
          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100",
      )}
    >
      <input
        type="checkbox"
        className="h-3 w-3 rounded border-slate-300"
        checked={isSelected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onExpand}
        className="font-mono font-medium text-slate-700"
      >
        {String(card.card_number).padStart(2, "0")}
      </button>
      {card.quantity > 1 && (
        <span className="text-slate-400">×{card.quantity}</span>
      )}
    </div>
  );
}

function EditPanel({
  kind,
  card,
  onClose,
}: {
  kind: CardKind;
  card: CardRow;
  onClose: () => void;
}) {
  const [qty, setQty] = React.useState(card.quantity);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  function onSave() {
    setError(null);
    startTransition(async () => {
      const res = await upsertCard(kind, card.team_abbr, card.card_number, qty);
      if (!res.ok) setError(res.error);
      else onClose();
    });
  }

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCard(kind, card.card_id);
      if (!res.ok) setError(res.error);
      else onClose();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 bg-amber-50 px-3 py-2">
      <span className="font-mono text-sm font-semibold text-slate-700">
        {card.card_code}
      </span>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">Cantidad</label>
        <Input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="h-7 w-20 text-sm"
        />
      </div>
      {error && <span className="text-sm text-red-600">{error}</span>}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSave} disabled={pending}>
          <Check className="mr-1 h-3.5 w-3.5" />
          {pending ? "..." : "Guardar"}
        </Button>
        {confirmDelete ? (
          <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 ring-1 ring-red-200">
            <span className="text-xs font-medium text-red-700">¿Eliminar?</span>
            <button type="button" onClick={onDelete} disabled={pending}
              className="rounded px-2 py-0.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
              {pending ? "..." : "Sí"}
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} disabled={pending}
              className="rounded px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors">
              No
            </button>
          </div>
        ) : (
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)} disabled={pending}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Eliminar
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onClose} disabled={pending}>
          <X className="mr-1 h-3.5 w-3.5" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}

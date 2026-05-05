"use client";

import * as React from "react";
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

export function CardList({ kind, rows }: { kind: CardKind; rows: CardRow[] }) {
  const [filter, setFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkPending, startBulkTransition] = React.useTransition();
  const [bulkError, setBulkError] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.card_code.toLowerCase().includes(q) ||
        r.team_abbr.toLowerCase().includes(q) ||
        String(r.card_number).includes(q),
    );
  }, [filter, rows]);

  const filteredIds = React.useMemo(
    () => filtered.map((r) => r.card_id),
    [filtered],
  );

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function onBulkDelete() {
    const ids = [...selected];
    const label = ids.length === rows.length ? "todas las cartas" : `${ids.length} carta(s)`;
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
      <Input
        type="search"
        placeholder="Filtrar (ej: ARG, MEX-05)"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setSelected(new Set());
        }}
      />

      {/* Toolbar de selección */}
      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={allFilteredSelected}
            onChange={toggleAllFiltered}
          />
          {allFilteredSelected ? "Deseleccionar todo" : "Seleccionar todo"}
        </label>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {bulkError && (
              <span className="text-sm text-red-600">{bulkError}</span>
            )}
            <Button
              size="sm"
              variant="danger"
              type="button"
              disabled={bulkPending}
              onClick={onBulkDelete}
            >
              {bulkPending
                ? "Eliminando..."
                : `Eliminar seleccionadas (${selected.size})`}
            </Button>
          </div>
        )}
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {filtered.map((row) => (
          <CardRowItem
            key={row.card_id}
            kind={kind}
            row={row}
            selected={selected.has(row.card_id)}
            onToggle={() => toggleOne(row.card_id)}
          />
        ))}
        {filtered.length === 0 && (
          <li className="p-4 text-center text-sm text-slate-500">
            Sin resultados.
          </li>
        )}
      </ul>
    </div>
  );
}

function CardRowItem({
  kind,
  row,
  selected,
  onToggle,
}: {
  kind: CardKind;
  row: CardRow;
  selected: boolean;
  onToggle: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [qty, setQty] = React.useState(row.quantity);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function onSave() {
    setError(null);
    startTransition(async () => {
      const res = await upsertCard(kind, row.team_abbr, row.card_number, qty);
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  function onDelete() {
    if (!confirm(`¿Eliminar ${row.card_code}?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCard(kind, row.card_id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <li className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300"
          checked={selected}
          onChange={onToggle}
        />
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm">
          {row.card_code}
        </span>
        {editing ? (
          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-24"
          />
        ) : (
          <span className="text-sm text-slate-600">x{row.quantity}</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button size="sm" type="button" onClick={onSave} disabled={pending}>
              {pending ? "..." : "Guardar"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => {
                setEditing(false);
                setQty(row.quantity);
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => setEditing(true)}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="danger"
              type="button"
              onClick={onDelete}
              disabled={pending}
            >
              Eliminar
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

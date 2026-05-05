"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { deleteCard, upsertCard, type CardKind } from "@/app/(app)/album/actions";

export type CardRow = {
  card_id: string;
  card_code: string;
  team_abbr: string;
  card_number: number;
  quantity: number;
};

export function CardList({
  kind,
  rows,
}: {
  kind: CardKind;
  rows: CardRow[];
}) {
  const [filter, setFilter] = React.useState("");

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
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {filtered.map((row) => (
          <CardRowItem key={row.card_id} kind={kind} row={row} />
        ))}
        {filtered.length === 0 ? (
          <li className="p-4 text-center text-sm text-slate-500">
            Sin resultados.
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function CardRowItem({ kind, row }: { kind: CardKind; row: CardRow }) {
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
    if (!confirm(`Eliminar ${row.card_code}?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCard(kind, row.card_id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <li className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
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
        {error ? (
          <span className="text-sm text-red-600">{error}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              type="button"
              onClick={onSave}
              disabled={pending}
            >
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

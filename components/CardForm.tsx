"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { TEAM_ABBREVIATIONS } from "@/lib/teams";
import { upsertCard, type CardKind } from "@/app/(app)/album/actions";

export function CardForm({ kind }: { kind: CardKind }) {
  const [abbr, setAbbr] = React.useState<string>(TEAM_ABBREVIATIONS[0]);
  const [number, setNumber] = React.useState<number>(1);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await upsertCard(kind, abbr, number, quantity);
      if (!result.ok) {
        setError(result.error);
      } else {
        // Reset just the number to make it easy to add many cards from the same team.
        setNumber(1);
        setQuantity(1);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_120px_120px_auto]"
    >
      <div className="space-y-1.5">
        <Label htmlFor={`abbr-${kind}`}>Selección</Label>
        <Select
          id={`abbr-${kind}`}
          value={abbr}
          onChange={(e) => setAbbr(e.target.value)}
        >
          {TEAM_ABBREVIATIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`number-${kind}`}>Número (1 - 20)</Label>
        <Input
          id={`number-${kind}`}
          type="number"
          min={1}
          max={20}
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`qty-${kind}`}>Cantidad</Label>
        <Input
          id={`qty-${kind}`}
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          <Save className="mr-1.5 h-4 w-4" />
          {pending ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {error ? (
        <p className="sm:col-span-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}

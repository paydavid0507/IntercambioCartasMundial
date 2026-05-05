"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { bulkUpsertFromText, type CardKind } from "@/app/(app)/album/actions";

export function QuickPaste({ kind }: { kind: CardKind }) {
  const [text, setText] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<{
    added: number;
    updated: number;
    errors: { line: string; reason: string }[];
  } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const r = await bulkUpsertFromText(kind, text);
      setResult({ added: r.added, updated: r.updated, errors: r.errors });
      if (r.added + r.updated > 0) setText("");
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1.5">
        <Label htmlFor={`paste-${kind}`}>Entrada rápida</Label>
        <p className="text-xs text-slate-500">
          Rango: <code>MEX: 1-20</code> · Lista: <code>BRA: 3,8,15</code> · Individual: <code>ARG-05 x2</code>
        </p>
        <textarea
          id={`paste-${kind}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder={"MEX: 1-20\nBRA: 3,8,15\nARG-05 x2"}
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm font-mono focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !text.trim()}>
          <Upload className="mr-1.5 h-4 w-4" />
          {pending ? "Importando..." : "Importar"}
        </Button>
      </div>

      {result ? (
        <div className="space-y-1 text-sm">
          {result.added + result.updated > 0 ? (
            <p className="rounded-md bg-green-50 px-3 py-2 text-green-700">
              {result.added} agregadas, {result.updated} actualizadas.
            </p>
          ) : null}
          {result.errors.length > 0 ? (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
              <p className="font-medium">
                {result.errors.length} línea(s) con problemas:
              </p>
              <ul className="mt-1 list-disc pl-5">
                {result.errors.slice(0, 5).map((er, i) => (
                  <li key={i}>
                    <code>{er.line}</code> — {er.reason}
                  </li>
                ))}
                {result.errors.length > 5 ? (
                  <li>… y {result.errors.length - 5} más</li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

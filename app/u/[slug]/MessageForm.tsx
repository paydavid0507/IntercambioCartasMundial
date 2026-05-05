"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sendMessage } from "@/app/(app)/inbox/actions";

export function MessageForm({
  recipientId,
  recipientName,
}: {
  recipientId: string;
  recipientName: string;
}) {
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<{ ok: boolean; error?: string } | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await sendMessage(recipientId, body);
      setResult(res);
      if (res.ok) setBody("");
    });
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-medium text-slate-700">
        Enviar mensaje a {recipientName}
      </p>
      {result?.ok ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          ¡Mensaje enviado! {recipientName} lo verá en su bandeja de entrada.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder={`Escríbele a ${recipientName}...`}
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            required
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">{body.length}/1000</span>
            {result?.error && (
              <span className="text-xs text-red-600">{result.error}</span>
            )}
            <Button type="submit" size="sm" disabled={pending || !body.trim()}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {pending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

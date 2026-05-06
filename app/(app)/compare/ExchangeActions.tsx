"use client";

import * as React from "react";
import Link from "next/link";
import { User, MessageCircle, Send, X } from "lucide-react";
import { sendMessage } from "@/app/(app)/mensajes/actions";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ExchangeActions({
  shareSlug,
  recipientId,
  recipientName,
  whatsapp,
}: {
  shareSlug: string;
  recipientId: string;
  recipientName: string;
  whatsapp: string | null;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [body, setBody] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await sendMessage(recipientId, body);
      if (res.ok) {
        setShowForm(false);
        setBody("");
        setSent(false);
      } else {
        setError(res.error ?? "Error al enviar.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Ver perfil */}
        <Link
          href={`/u/${shareSlug}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <User className="h-4 w-4" />
          Perfil
        </Link>

        {/* WhatsApp */}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
        )}

        {/* Mensaje */}
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setSent(false); setError(null); }}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            showForm
              ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {showForm ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Mensaje"}
        </button>
      </div>

      {/* Formulario inline */}
      {showForm && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3">
          {sent ? (
            <p className="text-sm text-green-700">
              ✓ Mensaje enviado a {recipientName}.
            </p>
          ) : (
            <form onSubmit={onSend} className="space-y-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={`Escríbele a ${recipientName}...`}
                className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                required
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">{body.length}/1000</span>
                <div className="flex items-center gap-2">
                  {error && <span className="text-xs text-red-600">{error}</span>}
                  <button
                    type="submit"
                    disabled={pending || !body.trim()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {pending ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

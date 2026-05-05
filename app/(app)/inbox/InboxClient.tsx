"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsDownUp, ChevronsUpDown, Trash2 } from "lucide-react";
import { clearBox, markAsRead } from "./actions";
import type { Message } from "./page";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function MessageList({
  messages,
  isInbox,
  onRead,
}: {
  messages: Message[];
  isInbox: boolean;
  onRead: (id: string) => void;
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const allExpanded = messages.length > 0 && messages.every((m) => expanded.has(m.id));
  const anyExpanded = messages.some((m) => expanded.has(m.id));

  function toggle(msg: Message) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(msg.id) ? next.delete(msg.id) : next.add(msg.id);
      return next;
    });
    if (isInbox && msg.read_at === null) onRead(msg.id);
  }

  function expandAll() {
    setExpanded(new Set(messages.map((m) => m.id)));
    if (isInbox) messages.filter((m) => m.read_at === null).forEach((m) => onRead(m.id));
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No hay mensajes aquí todavía.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        {anyExpanded && (
          <button
            type="button"
            onClick={() => setExpanded(new Set())}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronsDownUp className="h-3.5 w-3.5" />
            Colapsar todos
          </button>
        )}
        {!allExpanded && (
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            Expandir todos
          </button>
        )}
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {messages.map((msg) => {
          const isUnread = isInbox && msg.read_at === null;
          const isOpen = expanded.has(msg.id);
          return (
            <li key={msg.id}>
              <button
                type="button"
                onClick={() => toggle(msg)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isUnread && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                        {isInbox ? "De" : "Para"}: {msg.contact_name}
                      </p>
                      {!isOpen && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">{msg.body}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-400">{timeAgo(msg.created_at)}</span>
                    <span className="text-slate-300">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-800">{msg.body}</p>
                  <div className="mt-3">
                    <Link
                      href={`/u/${msg.contact_slug}`}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      Ver perfil de {msg.contact_name}
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function InboxClient({
  inbox,
  outbox,
}: {
  inbox: Message[];
  outbox: Message[];
}) {
  const [tab, setTab] = React.useState<"inbox" | "outbox">("inbox");
  const [readSet, setReadSet] = React.useState<Set<string>>(
    new Set(inbox.filter((m) => m.read_at !== null).map((m) => m.id)),
  );
  const [clearing, startClearTransition] = React.useTransition();

  const inboxWithRead: Message[] = inbox.map((m) => ({
    ...m,
    read_at: readSet.has(m.id) ? (m.read_at ?? "read") : null,
  }));

  function onRead(id: string) {
    setReadSet((prev) => new Set([...prev, id]));
    markAsRead(id);
  }

  function onClear() {
    const label = tab === "inbox" ? "bandeja de entrada" : "bandeja de salida";
    if (!confirm(`¿Vaciar ${label}? Se eliminarán todos los mensajes permanentemente.`)) return;
    startClearTransition(async () => {
      await clearBox(tab);
    });
  }

  const messages = tab === "inbox" ? inboxWithRead : outbox;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("inbox")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "inbox"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Recibidos
            {inbox.filter((m) => !readSet.has(m.id) && m.read_at === null).length > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">
                {inbox.filter((m) => !readSet.has(m.id) && m.read_at === null).length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("outbox")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "outbox"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Enviados
            {outbox.length > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-400 px-1.5 py-0.5 text-xs text-white">
                {outbox.length}
              </span>
            )}
          </button>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {clearing ? "Vaciando..." : "Vaciar bandeja"}
          </button>
        )}
      </div>

      <MessageList
        key={tab}
        messages={messages}
        isInbox={tab === "inbox"}
        onRead={onRead}
      />
    </div>
  );
}

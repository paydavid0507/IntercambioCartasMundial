"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsDownUp, ChevronsUpDown, Trash2, ChevronDown, ChevronUp, Inbox, Send } from "lucide-react";
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

export function InboxClient({
  inbox,
  outbox,
}: {
  inbox: Message[];
  outbox: Message[];
}) {
  const [tab, setTab] = React.useState<"inbox" | "outbox">("inbox");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [readSet, setReadSet] = React.useState<Set<string>>(
    new Set(inbox.filter((m) => m.read_at !== null).map((m) => m.id)),
  );
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [clearing, startClearTransition] = React.useTransition();

  const messages = tab === "inbox"
    ? inbox.map((m) => ({ ...m, read_at: readSet.has(m.id) ? (m.read_at ?? "read") : null }))
    : outbox;

  const allExpanded = messages.length > 0 && messages.every((m) => expanded.has(m.id));
  const anyExpanded = messages.some((m) => expanded.has(m.id));
  const unreadCount = inbox.filter((m) => !readSet.has(m.id) && m.read_at === null).length;

  // Reset confirm and expanded when switching tabs
  function switchTab(t: "inbox" | "outbox") {
    setTab(t);
    setConfirmClear(false);
    setExpanded(new Set());
  }

  function toggle(msg: Message) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(msg.id) ? next.delete(msg.id) : next.add(msg.id);
      return next;
    });
    if (tab === "inbox" && msg.read_at === null && !readSet.has(msg.id)) {
      setReadSet((prev) => new Set([...prev, msg.id]));
      markAsRead(msg.id);
    }
  }

  function expandAll() {
    setExpanded(new Set(messages.map((m) => m.id)));
    if (tab === "inbox") {
      const unread = messages.filter((m) => m.read_at === null && !readSet.has(m.id));
      if (unread.length > 0) {
        setReadSet((prev) => new Set([...prev, ...unread.map((m) => m.id)]));
        unread.forEach((m) => markAsRead(m.id));
      }
    }
  }

  function doClear() {
    startClearTransition(async () => {
      await clearBox(tab);
      setConfirmClear(false);
      setExpanded(new Set());
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header unificado: tabs + acciones */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">

          {/* Tabs */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => switchTab("inbox")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "inbox"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              Recibidos
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => switchTab("outbox")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "outbox"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              Enviados
              {outbox.length > 0 && (
                <span className="rounded-full bg-slate-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 leading-none">
                  {outbox.length}
                </span>
              )}
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <>
                {anyExpanded ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(new Set())}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronsDownUp className="h-3.5 w-3.5" />
                    Colapsar
                  </button>
                ) : !allExpanded && (
                  <button
                    type="button"
                    onClick={expandAll}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                    Expandir
                  </button>
                )}

                <div className="mx-1 h-4 w-px bg-slate-200" />

                {confirmClear ? (
                  <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 ring-1 ring-red-200">
                    <span className="text-xs font-medium text-red-700">¿Vaciar?</span>
                    <button
                      type="button"
                      onClick={doClear}
                      disabled={clearing}
                      className="rounded px-2 py-0.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {clearing ? "..." : "Sí"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      disabled={clearing}
                      className="rounded px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Vaciar
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lista de mensajes */}
      {messages.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-400">No hay mensajes aquí todavía.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {messages.map((msg) => {
            const isUnread = tab === "inbox" && msg.read_at === null;
            const isOpen = expanded.has(msg.id);
            return (
              <li key={msg.id} className={isUnread ? "bg-brand-50/40" : ""}>
                <button
                  type="button"
                  onClick={() => toggle(msg)}
                  className="w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isUnread
                        ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                        : <span className="h-2 w-2 shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className={`text-sm ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                          {tab === "inbox" ? msg.contact_name : `Para ${msg.contact_name}`}
                        </p>
                        {!isOpen && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">{msg.body}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-slate-400">
                      <span className="text-xs">{timeAgo(msg.created_at)}</span>
                      {isOpen
                        ? <ChevronUp className="h-3.5 w-3.5" />
                        : <ChevronDown className="h-3.5 w-3.5" />
                      }
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {msg.body}
                    </p>
                    <Link
                      href={`/u/${msg.contact_slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Ver perfil de {msg.contact_name} →
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

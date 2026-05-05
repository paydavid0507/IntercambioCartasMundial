"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { markAsRead } from "./actions";
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

export function InboxClient({ messages }: { messages: Message[] }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [readSet, setReadSet] = React.useState<Set<string>>(
    new Set(messages.filter((m) => m.read_at).map((m) => m.id)),
  );

  const allExpanded = messages.length > 0 && messages.every((m) => expanded.has(m.id));
  const anyExpanded = messages.some((m) => expanded.has(m.id));

  async function toggle(msg: Message) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(msg.id) ? next.delete(msg.id) : next.add(msg.id);
      return next;
    });
    if (!readSet.has(msg.id)) {
      setReadSet((prev) => new Set([...prev, msg.id]));
      await markAsRead(msg.id);
    }
  }

  function expandAll() {
    setExpanded(new Set(messages.map((m) => m.id)));
    const unread = messages.filter((m) => !readSet.has(m.id));
    if (unread.length > 0) {
      setReadSet(new Set(messages.map((m) => m.id)));
      unread.forEach((m) => markAsRead(m.id));
    }
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No tienes mensajes todavía.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Barra de control */}
      <div className="flex items-center justify-end gap-2">
        {anyExpanded && (
          <button
            type="button"
            onClick={collapseAll}
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
          const isRead = readSet.has(msg.id);
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
                    {!isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                        {msg.sender_name}
                      </p>
                      {!isOpen && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {msg.body}
                        </p>
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
                      href={`/u/${msg.sender_slug}`}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      Ver perfil de {msg.sender_name}
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

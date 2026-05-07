"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ArrowLeftRight, Search, Mail, User } from "lucide-react";
import { useUnread } from "@/components/UnreadProvider";

const items = [
  { href: "/album",    label: "Álbum",    icon: BookOpen },
  { href: "/compare",  label: "Cambios",  icon: ArrowLeftRight },
  { href: "/search",   label: "Buscar",   icon: Search },
  { href: "/mensajes", label: "Mensajes", icon: Mail },
  { href: "/profile",  label: "Perfil",   icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const unreadMessages = useUnread();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950 sm:hidden">
      <div className="flex items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-amber-400" : "text-slate-500"
              }`}
            >
              <div className="relative">
                {/* Ping ring — solo en mensajes con no leídos */}
                {href === "/mensajes" && unreadMessages > 0 && (
                  <span className="absolute -inset-1.5 rounded-full bg-amber-400/50 animate-ping pointer-events-none" />
                )}
                <Icon className={`relative h-5 w-5 ${href === "/mensajes" && unreadMessages > 0 ? "text-amber-400" : ""}`} />
                {href === "/mensajes" && unreadMessages > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-slate-950 leading-none shadow-sm shadow-amber-900/30">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>
              {label}
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

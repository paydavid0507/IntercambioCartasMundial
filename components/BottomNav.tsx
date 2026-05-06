"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ArrowLeftRight, Search, Mail, User } from "lucide-react";

const items = [
  { href: "/album",    label: "Álbum",      icon: BookOpen },
  { href: "/compare",  label: "Cambios",    icon: ArrowLeftRight },
  { href: "/search",   label: "Buscar",     icon: Search },
  { href: "/mensajes", label: "Mensajes",   icon: Mail },
  { href: "/profile",  label: "Perfil",     icon: User },
];

export function BottomNav({ unreadMessages }: { unreadMessages: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white sm:hidden">
      <div className="flex items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-brand-600" : "text-slate-500"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${active ? "stroke-brand-600" : ""}`} />
                {href === "/mensajes" && unreadMessages > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-600 px-0.5 text-[8px] font-bold text-white leading-none">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>
              {label}
              {active && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

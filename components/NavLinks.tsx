"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/album",    label: "Mi álbum" },
  { href: "/compare",  label: "Intercambios" },
  { href: "/search",   label: "Buscar" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/profile",  label: "Perfil" },
];

export function NavLinks({ unreadMessages }: { unreadMessages: number }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {l.label}
            {l.href === "/mensajes" && unreadMessages > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
            {active && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

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
            className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "text-amber-400"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            {l.label}
            {l.href === "/mensajes" && unreadMessages > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

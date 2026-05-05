import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/album", label: "Mi álbum" },
  { href: "/compare", label: "Intercambios" },
  { href: "/search", label: "Buscar" },
  { href: "/inbox", label: "Mensajes" },
  { href: "/profile", label: "Perfil" },
];

export function Navbar({
  displayName,
  unreadMessages,
}: {
  displayName: string;
  unreadMessages: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/album"
          className="text-base font-semibold tracking-tight whitespace-nowrap"
        >
          Intercambia Mundial 2026
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
              {l.href === "/inbox" && unreadMessages > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <form action="/auth/sign-out" method="post" className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {displayName}
          </span>
          <Button variant="secondary" size="sm" type="submit">
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Salir
          </Button>
        </form>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="relative rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap"
          >
            {l.label}
            {l.href === "/inbox" && unreadMessages > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
}

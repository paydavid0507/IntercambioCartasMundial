import Link from "next/link";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/album", label: "Mi álbum" },
  { href: "/compare", label: "Intercambios" },
  { href: "/search", label: "Buscar" },
  { href: "/profile", label: "Perfil" },
];

export function Navbar({ displayName }: { displayName: string }) {
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
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form action="/auth/sign-out" method="post" className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {displayName}
          </span>
          <Button variant="secondary" size="sm" type="submit">
            Salir
          </Button>
        </form>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
